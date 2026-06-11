# TimeLog Web

TimeLog Web 是一款基于 **Next.js 16 (App Router)**、**Supabase**、**Tailwind CSS v4** 以及 **Zustand** 开发的家庭端 Web 控制台 (Family-Facing Web Console)。项目作为 TimeLog 系统的中央治理与语义富化平台，主要解决家庭成员对长辈录制故事的浏览、播放、管理、互动（如发送提问、发表评论、点赞）以及设备配对、角色管理、数据导出等需求，包含基于 pgvector 的语义检索、安全音频流式播放、多语言国际化、无障碍高对比度设计等功能。

---

## 🛠️ 核心架构与工程设计 (Architecture & Design)

以下架构模块均在本项目中进行了完整的实现与落地，点击对应模块中的源码直链，即可查阅底层的核心代码实现细节：

### 1. 中央治理与数据同步 (Central Governance & Data Synchronization) 🚀

*   **设计思路**：作为分布式系统的中央治理端，Web 控制台通过 Supabase 实时同步长辈端录制的故事、评论和反应。
*   **实现细节**：
    - **实时订阅**：使用 Supabase Realtime 订阅数据库变更，实现故事列表、评论和点赞状态的即时刷新。
    - **缓存控制**：通过 Next.js App Router 的 `force-dynamic` 绕过静态缓存，确保音频签名 URL、点赞数和评论实时更新。
*   **📂 核心源码直链**：
    - [subscriptions.ts (实时订阅服务)](src/features/realtime/subscriptions.ts)
    - [page.tsx (故事列表动态渲染)](src/app/(dashboard)/stories/page.tsx)
    - [queries.ts (故事查询与状态获取)](src/features/stories/queries.ts)

---

### 2. 安全音频流式播放与 RLS 绕过 (Secure Audio Streaming & RLS Bypass) 🎙️

*   **设计思路**：保护长辈隐私，音频文件存储在 Supabase Storage 的私有存储桶中。由于家庭成员不直接拥有长辈的音频文件，直接使用客户端 SDK 会被 RLS 策略拦截。
*   **实现细节**：
    - **管理员客户端**：在服务端使用 `SUPABASE_SECRET_KEY` 初始化一个 Admin 客户端。
    - **签名 URL 生成**：通过 `playback.server.ts` 中的 `createSignedStoryPlayback` 在服务端生成限时签名的播放 URL，安全绕过 RLS 策略，实现家庭成员的无感播放。
    - **交互式波形**：客户端使用 WaveSurfer.js 渲染音频波形，并与转写文本进行毫秒级同步。
*   **📂 核心源码直链**：
    - [admin.ts (Supabase Admin 客户端)](src/lib/supabase/admin.ts)
    - [playback.server.ts (服务端签名 URL 生成)](src/features/stories/playback.server.ts)
    - [waveform-player.tsx (波形播放器组件)](src/features/stories/components/playback-room/waveform-player.tsx)
    - [interactive-transcript.tsx (交互式转写文本)](src/features/stories/components/playback-room/interactive-transcript.tsx)

---

### 3. 双向互动：家庭提问与语音/文本评论 (Bidirectional Interaction: Family Prompts & Voice/Text Comments) 💬

*   **设计思路**：促进跨代沟通，家庭成员可以向长辈发送引导性问题，并对长辈的故事进行文本或语音评论。
*   **实现细节**：
    - **提问追踪器**：`prompts-tracker.tsx` 实时追踪发送给长辈的问题状态（如“等待录音”）。
    - **语音评论录制**：集成 Web Audio API，支持家庭成员在网页端直接录制语音评论，并上传至 Supabase。
*   **📂 核心源码直链**：
    - [prompts-tracker.tsx (提问追踪器)](src/features/interactions/components/prompts-tracker.tsx)
    - [voice-comment-recorder.tsx (语音评论录制器)](src/features/stories/components/comment-room/voice-comment-recorder.tsx)
    - [actions.ts (故事互动 Server Actions)](src/features/stories/actions.ts)

---

### 4. 免密设备配对与别名管理 (Passwordless Device Pairing & Alias Management) 🔑

*   **设计思路**：简化长辈端设备的登录流程，通过一次性配对码建立家庭关联。
*   **实现细节**：
    - **状态轮询**：Web 端提供配对码输入界面，通过 Supabase 建立设备与家庭账户的绑定。
    - **别名管理**：家属可在 Web 端为绑定的设备修改标签名称（如“外婆的话匣子”），便于多设备管理。
*   **📂 核心源码直链**：
    - [device-pairing-form.tsx (设备配对表单)](src/features/devices/components/device-pairing-form.tsx)
    - [actions.ts (设备管理 Server Actions)](src/features/devices/actions.ts)
    - [queries.ts (设备查询服务)](src/features/devices/queries.ts)

---

### 5. 多语言国际化与动态切换 (Zero-Lag Multi-lingual i18n) 🌐

*   **设计思路**：支持英文、中文、泰文三语无缝切换，包括 Server Actions 的错误/成功提示、动态日期格式化等。
*   **实现细节**：
    - **next-intl 集成**：使用 `next-intl` 实现全站国际化，所有硬编码字符串均已提取至 JSON 语言包。
    - **动态语言切换**：提供 `LanguageSelector` 组件，支持在登录/注册页及控制台内即时切换语言。
    - **动态日期本地化**：在查询层（如 `family/queries.ts`）根据当前 Locale 动态格式化绝对日期。
*   **📂 核心源码直链**：
    - [language-selector.tsx (语言选择器)](src/components/layout/language-selector.tsx)
    - [zh.json (中文语言包)](messages/zh.json) | [en.json (英文语言包)](messages/en.json) | [th.json (泰文语言包)](messages/th.json)
    - [use-translation.tsx (翻译 Hook)](src/lib/hooks/use-translation.tsx)

---

### 6. 无障碍设计与高对比度视觉系统 (WCAG 2.2 AAA Accessibility & Premium Theme) 🎨

*   **设计思路**：遵循 WCAG 2.2 AAA 高对比度标准，打造“高品质听音室”的沉浸式视觉体验。
*   **实现细节**：
    - **优雅配色**：采用深色黑曜石（#11100d）、古朴羊皮纸（#f4efe6）与金沙色（#d4b67a）搭配，高对比度且不刺眼。
    - **响应式排版**：使用 Cormorant Garamond（优雅衬线体）与 Instrument Sans（现代无衬线体）双字型系统，字号支持动态缩放。
*   **📂 核心源码直链**：
    - [DESIGN.md (设计系统规范)](DESIGN.md)
    - [globals.css (全局样式与 Tailwind 配置)](src/app/globals.css)
    - [button.tsx (高对比度无障碍按钮)](src/components/ui/button.tsx)

---

### 7. 数据主权与全量 JSON 导出 (Data Sovereignty & Archive Export) 📄

*   **设计思路**：确保家庭数据不被平台锁定，支持一键导出完整的家庭故事、转写文本、评论及媒体元数据。
*   **实现细节**：
    - **归档打包**：服务端 Action 聚合家庭所有故事、文本及评论，生成结构化的 JSON 归档文件供用户下载。
*   **📂 核心源码直链**：
    - [export-actions.ts (数据导出 Server Action)](src/features/admin/export-actions.ts)
    - [export-archive-button.tsx (导出按钮组件)](src/features/stories/components/export-archive-button.tsx)

---

## 📂 项目结构 (Project Structure)

```text
timelog-web
├── .github/workflows/     # GitHub Actions CI 工作流
├── messages/              # i18n 国际化语言包 (en, zh, th)
├── public/                # 静态资源文件
├── src/                   # 核心源码
│   ├── app/               # Next.js App Router 路由结构
│   │   ├── (auth)/        # 身份验证 (登录、注册)
│   │   ├── (dashboard)/   # 核心控制台 (故事画廊、设备管理、家庭成员、审计日志、设置)
│   │   └── api/           # API 路由 (调试、音频播放)
│   ├── components/        # 共享组件库
│   │   ├── admin/         # 管理员专用组件
│   │   ├── dashboard/     # 控制台通用组件
│   │   ├── layout/        # 布局组件 (侧边栏、顶栏、语言选择器)
│   │   └── ui/            # 基于 Radix UI & Tailwind 的无障碍组件
│   ├── contexts/          # 全局上下文 (AuthContext)
│   ├── features/          # 业务特性模块 (按领域高内聚划分)
│   │   ├── admin/         # 数据导出
│   │   ├── audit/         # 审计日志
│   │   ├── devices/       # 设备配对与管理
│   │   ├── family/        # 家庭成员与角色管理
│   │   ├── interactions/  # 互动提问
│   │   ├── realtime/      # 实时订阅
│   │   └── stories/       # 故事画廊、播放器、评论、点赞
│   ├── hooks/             # 共享 React Hooks
│   ├── i18n/              # next-intl 配置
│   ├── lib/               # 底层库封装 (Supabase 客户端、状态管理、工具函数)
│   └── types/             # TypeScript 类型定义
├── DESIGN.md              # 视觉设计系统规范
├── GEMINI.md              # 项目开发纪实与变更日志
├── CLAUDE.md              # 开发者指南与指令集
└── package.json           # 项目依赖与脚本配置
```

---

## 📊 技术栈选型 (Technology Stack)

| 层级 | 核心技术 | 作用 |
|:------|:-----------|:--------|
| **前端框架** | Next.js 16.2.2 (App Router) | 全栈 React 框架，支持 SSR 与 Server Actions |
| **逻辑语言** | TypeScript (Strict Mode) | 类型安全与静态检查 |
| **样式引擎** | Tailwind CSS v4.2.2 | 现代原子化 CSS 引擎 |
| **状态管理** | Zustand v5.0.12 | 轻量级、高性能的全局状态管理 |
| **国际化** | next-intl v4.9.0 | 全站多语言支持 (EN/ZH/TH) |
| **音频播放** | wavesurfer.js v7.12.5 | 交互式音频波形渲染与播放控制 |
| **动画效果** | GSAP v3.15.0 + Framer Motion | 优雅的微交互与转场动画 |
| **后端服务** | Supabase (PostgreSQL + pgvector) | 实时数据库、身份验证与存储服务 |

---

## 📦 测试与运行验证

项目各核心组件均经过单元与集成测试。

### 1. 运行测试套件
```bash
pnpm test
```

### 2. 本地开发运行
```bash
pnpm install
pnpm dev
```

---

*Made with ❤️ for the Senior Project. Fulfilling WCAG 2.2 AAA Accessibility Standard for Elders.*
