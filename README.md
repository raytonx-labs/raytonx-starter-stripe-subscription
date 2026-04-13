# RaytonX Starter: Stripe Subscription

一个面向 SaaS 订阅场景的工程模板，基于 Next.js、Supabase 和 Stripe 构建。

目标不是只演示单点集成，而是逐步搭出一套完整的订阅型产品基础能力，包括认证、订阅、支付、Webhook 同步、后台管理，以及后续可持续扩展的项目结构。

## 项目定位

这个项目适合作为：
- SaaS 订阅系统的起步模板
- Supabase Auth + Stripe Billing 的集成参考
- 需要快速验证订阅产品流程的原型工程

## 技术栈

- Frontend: Next.js App Router
- Backend: Next.js Route Handlers / Server-side rendering
- Auth & Database: Supabase
- Billing: Stripe
- Package Manager: pnpm
- Deployment: Vercel

## 功能方向

项目计划覆盖以下能力：
- 用户认证：邮箱密码、GitHub、Google 登录
- 应用鉴权：登录态、受保护页面、管理员页面
- 订阅支付：月付、年付、Stripe Checkout
- 订阅管理：Customer Portal、取消订阅、状态同步
- 后台管理：查看用户、订阅状态与基础运营信息
- 数据同步：Webhook 驱动的 Stripe 状态镜像

## 当前进度

当前已经完成的基础能力：
- Supabase 项目连接与 SSR client 基础设施
- 请求级 session 刷新能力
- 认证基础结构
- 受保护的 app / admin 页面骨架
- 基于数据库角色的 admin guard

后续会继续补齐：
- 登录弹窗与 OAuth 流程
- pricing 与 checkout
- subscription 状态展示
- Stripe webhook 与后台管理页面

## 快速开始

```bash
pnpm install
pnpm dev
```

然后准备环境变量并完成 Supabase 初始化：
- 复制 `.env.example` 到本地环境文件
- 配置 Supabase 相关密钥
- 执行 `docs/database/supabase-auth-schema.sql`

## 文档入口

根目录 `README.md` 只负责说明项目目标和整体结构，模块细节统一放在 `docs/` 下：

- `docs/README.md`
- `docs/app/README.md`
- `docs/auth/README.md`
- `docs/supabase/README.md`
- `docs/database/README.md`

如果你要了解某一块代码，优先去对应模块文档，而不是从变更记录里找。
