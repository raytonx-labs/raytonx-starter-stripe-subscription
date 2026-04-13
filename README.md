# RaytonX Starter: Stripe Subscription

一个基于 Next.js + Supabase + Stripe 构建的订阅系统 Starter 项目，用于展示完整的 SaaS 计费流程实现，包括用户认证、订阅管理、支付流程与 Webhook 处理。

该项目可作为：
- SaaS 产品计费系统的参考实现
- Stripe 订阅集成的实践示例
- 快速启动订阅型产品的工程模板

---

## 技术栈

- **Frontend**: Next.js (App Router)
- **Backend**: Next.js Route Handlers / Server Actions
- **Auth & Database**: Supabase
- **Billing**: Stripe
- **Deployment**: Vercel（推荐）

---

## 功能概览

### 1. 用户认证
- 基于 Supabase 的登录 / 注册
- 支持会话管理与服务端鉴权

### 2. 订阅流程
- 创建订阅（Stripe Checkout）
- 用户订阅状态同步
- 多订阅状态管理（active / canceled / past_due 等）

### 3. 支付流程
- Stripe Checkout 集成
- 客户与订阅自动绑定
- 支付成功 / 失败处理

### 4. Webhook 集成
- 监听 Stripe 事件（如 `checkout.session.completed`、`invoice.paid`）
- 服务端同步订阅状态
- 构建基于事件驱动的计费系统

### 5. SaaS 计费模型
- 用户 ↔ Stripe Customer 映射
- Subscription 生命周期管理
- 数据库存储与状态同步

## 本地运行

```bash
# 安装依赖
pnpm install

# 启动开发环境
pnpm dev
```
