# 🌐 TimeLog Web Architecture Blueprint

<p align="center">
  <b>English | <a href="./ARCHITECTURE_zh.md">简体中文</a></b>
</p>

This document details the Next.js 16, Supabase Row-Level Security, and cross-generational storytelling curation dashboard powering **TimeLog Web**.

```mermaid
graph TD
    Client[Browser / Next.js 16 Client] -->|Server Actions / SSR| Server[Next.js App Router Server]

    subgraph "Next.js 16 Web Application"
        Server --> AuthGuard[Supabase SSR Auth Guard]
        Server --> VoicePlayer[WaveSurfer Audio Player]
        Server --> Timeline[Family Storyline Timeline Engine]
    end

    subgraph "Supabase Backend Infrastructure"
        AuthGuard --> RLS[Row-Level Security Policies]
        RLS --> DB[(Supabase Postgres Database)]
        VoicePlayer --> StorageBucket[(Supabase Audio Storage)]
    end
```

---

## 🛡️ 1. Zero-Trust Row-Level Security (RLS)
- Ensures family story archives and private voice journals are strictly accessible only by verified family members via Postgres database-level RLS policies.

---

## 🎵 2. WaveSurfer Audio Waveform Visualization
- Renders high-fidelity audio waveforms with synchronous text-to-audio highlighting for immersive storytelling review.

---

<sub>© 2026 TimeLog Web. Licensed under the MIT License.</sub>
