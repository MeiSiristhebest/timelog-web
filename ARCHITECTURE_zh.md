# 🌐 TimeLog Web 端架构设计文档 (Architecture Guide)

<p align="center">
  <b><a href="./ARCHITECTURE.md">English</a> | 简体中文</b>
</p>

本文档阐述 **TimeLog Web** 基于 Next.js 15、Supabase 行级安全权限 (RLS) 与跨代际家庭故事策展工作台的架构实现。

```mermaid
graph TD
    Client[浏览器 / Next.js 15 客户端] -->|Server Actions / SSR| Server[Next.js App Router 服务端]

    subgraph "Next.js 15 Web 应用架构"
        Server --> AuthGuard[Supabase SSR 鉴权守卫]
        Server --> VoicePlayer[WaveSurfer 音频波形渲染]
        Server --> Timeline[家庭时光轴策展引擎]
    end

    subgraph "Supabase 云端基础设施"
        AuthGuard --> RLS[Postgres 行级安全策略 (RLS)]
        RLS --> DB[(Supabase Postgres 数据库)]
        VoicePlayer --> StorageBucket[(Supabase 录音存储桶)]
    end
```

---

## 🛡️ 1. 零信任行级数据安全 (RLS)
- 在 Postgres 数据库引擎层强制执行行级安全策略，杜绝跨家庭成员的数据越权读取。

---

## 🎵 2. WaveSurfer 音频波形与文字同步渲染
- 浏览器端高性能波形可视化，支持点击波形精确跳转至对应文字录音段落。

---

<sub>© 2026 TimeLog Web. Licensed under the MIT License.</sub>
