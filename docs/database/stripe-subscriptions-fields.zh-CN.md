# `stripe_subscriptions` 字段说明

这张表是 Stripe Subscription 在 Supabase 中的镜像快照。Stripe 仍然是订阅状态的唯一事实来源，应用读取这张表只是为了更快地展示用户当前的订阅状态、套餐周期和取消信息。

## 主键与关联字段

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `id` | `uuid` | Supabase 本地记录主键。 |
| `user_id` | `uuid` | 关联到 `auth.users.id`，表示这条订阅属于哪个应用用户。 |
| `stripe_customer_id` | `text` | Stripe Customer ID，例如 `cus_xxx`。同时关联 `stripe_customers.stripe_customer_id`。 |
| `stripe_subscription_id` | `text` | Stripe Subscription ID，例如 `sub_xxx`。这是 Stripe 订阅对象的唯一标识。 |
| `stripe_price_id` | `text` | 当前订阅项使用的 Stripe Price ID，例如 `price_xxx`。 |

## 状态与周期字段

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `status` | `text` | Stripe subscription 的当前状态，例如 `active`、`trialing`、`past_due`、`canceled`、`unpaid`、`paused`、`incomplete`、`incomplete_expired`。 |
| `interval` | `text` | 当前订阅价格的周期，本项目只支持 `month` 和 `year`。 |
| `current_period_start` | `timestamptz` | 当前计费周期开始时间。 |
| `current_period_end` | `timestamptz` | 当前计费周期结束时间。用户预约周期末取消时，通常仍可使用到这个时间。 |
| `trial_end` | `timestamptz` | 试用期结束时间。没有试用期时为 `null`。 |

## 取消相关字段

这几个字段最容易混淆，建议按下面的语义理解。

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `cancel_at_period_end` | `boolean` | 是否预约在当前周期结束时取消。为 `true` 时，订阅通常仍是 `active`，直到周期真正结束。 |
| `cancel_at` | `timestamptz` | 计划自动取消的时间，通常是当前周期结束时间。预约周期末取消时，它通常等于 `current_period_end`。 |
| `canceled_at` | `timestamptz` | 取消动作发生的时间，Stripe 提供时才有。它不一定等于订阅真正结束时间。 |
| `ended_at` | `timestamptz` | 订阅真正结束的时间。预约取消期间通常还是 `null`，等 Stripe 真正终止订阅后才会有值。 |

### 常见状态组合

| 场景 | 常见字段值 | 说明 |
| --- | --- | --- |
| 正常订阅中 | `status = active`，`cancel_at_period_end = false`，`cancel_at = null`，`ended_at = null` | 用户当前正常订阅。 |
| 已预约周期末取消 | `status = active`，`cancel_at_period_end = true`，`cancel_at` 有值，`ended_at = null` | 用户仍有访问权益，但订阅会在 `cancel_at` 时间自动取消。 |
| 已真正取消 | `status = canceled`，`ended_at` 有值 | 订阅已经结束，通常不再提供付费权益。 |
| 支付失败 | `status = past_due` 或 `status = unpaid` | 用户可能需要更新付款方式；是否保留权益取决于产品策略。 |

## 其他字段

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `metadata` | `jsonb` | Stripe Subscription metadata 的镜像。本项目创建订阅时通常会写入 `user_id` 和 `email`。 |
| `created_at` | `timestamptz` | Supabase 本地记录创建时间。 |
| `updated_at` | `timestamptz` | Supabase 本地记录更新时间，由数据库 trigger 自动维护。 |

## Webhook 同步来源

`stripe_subscriptions` 主要由下面这些事件刷新：

| Stripe 事件 | 说明 |
| --- | --- |
| `checkout.session.completed` | Checkout 完成后，通过 `session.subscription` 找到 subscription 并同步。 |
| `customer.subscription.created` | Stripe 创建订阅后同步完整订阅快照。 |
| `customer.subscription.updated` | 订阅状态、取消计划、套餐变化等更新后同步。 |
| `customer.subscription.deleted` | 订阅真正结束或被删除后同步最终状态。 |
| `invoice.paid` | 发票支付成功后可重新同步订阅状态。 |
| `invoice.payment_failed` | 发票支付失败后可重新同步订阅状态。 |

## 排查建议

如果用户取消订阅后 Supabase 没有更新，优先检查：

- `stripe_billing_events` 是否记录了对应的 `customer.subscription.updated` 事件。
- `payload.data.object.cancel_at_period_end` 是否为 `true`。
- `payload.data.object.cancel_at` 是否有时间戳。
- webhook route 是否返回了 `200`，而不是 `500`。
- 真实数据库是否已经存在 `cancel_at` 列。

给已有表补充 `cancel_at` 字段可以执行：

```sql
alter table public.stripe_subscriptions
add column if not exists cancel_at timestamptz;
```
