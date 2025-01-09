# Weaving Flow

《织流》一个基于 Electron 的多功能应用，支持爬虫、浏览器（密码管理、收藏夹）、工作流编排，支持多端部署等功能。

## 开发环境要求

- Node.js >= 18
- pnpm >= 8.9.0

## 项目结构

```
weaving-flow
|
├── packages/                   # Monorepo 结构
│   ├── core/                   # 核心共享代码
│   ├── server/                 # 服务端代码
│   ├── client/                 # 前端代码
│   └── workflow/               # 工作流引擎
├── electron/                   # Electron 主进程
└── config/                     # 配置文件
```

## 架构设想

1. 核心功能模块：

- 浏览器功能
- 工作流模块
- 爬虫模块（服务端/客户端双部署）
- 收藏夹功能
- 密码存储
- 更多...

2. 技术栈选择：

- 前端：React + TypeScript + Vite
- 状态管理：Redux Toolkit
- API 层：tRPC（支持类型安全的前后端通信）
- 数据库：SQLite（本地）+ PostgreSQL（服务端）
- 工作流引擎：自定义 Node-based workflow engine
- 爬虫引擎：Puppeteer/Playwright

3. 部署模式：

- Electron 模式：完整的前后端一体化部署
- 服务端独立部署模式：支持云服务器部署
- 移动端支持：部分功能支持 Cordova 打包

## 开始使用

1. 到各包下安装依赖

```bash
pnpm install
```

2. 启动开发环境

```bash
pnpm dev
```

3. 构建项目

```bash
pnpm build
```

## 完善中...
