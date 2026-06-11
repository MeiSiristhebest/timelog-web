# TimeLog Web - Developer Guide (CLAUDE.md)

This guide outlines the development commands, architectural patterns, and code style guidelines for the TimeLog Web project.

## 🛠️ Development Commands

### Package Manager
This project uses **pnpm** (v10.33.0) as the package manager. Do not use `npm` or `yarn`.

### Core Scripts
- **Start Development Server**: `pnpm dev` (uses Turbopack by default)
- **Start Dev Server with Webpack**: `pnpm dev:webpack` (use if Turbopack has issues on Windows)
- **Start Dev Server on Host**: `pnpm dev:host` (exposes to local network)
- **Build Production Bundle**: `pnpm build`
- **Start Production Server**: `pnpm start`
- **Run Linter**: `pnpm lint` (runs ESLint with zero-warnings enforcement)
- **Run Typechecker**: `pnpm typecheck` (runs `tsc --noEmit`)
- **Run Unit Tests**: `pnpm test` (runs Vitest)
- **Full Quality Gate Check**: `pnpm check` (runs lint, typecheck, test, and build sequentially)

---

## 🏗️ Architectural Patterns

### 1. Feature-Based Directory Structure
Code is organized by business domain under `src/features/` rather than technical roles. Each feature folder should contain its own:
- `components/`: Feature-specific UI components
- `actions.ts`: Server Actions for mutations
- `queries.ts`: Server-side data fetching queries
- `store.ts` (optional): Zustand state stores

### 2. Server vs. Client Components
- **Server Components (Default)**: Use for data fetching, page layouts, and SEO-sensitive content.
- **Client Components**: Mark with `"use client"` at the very top. Use only when React hooks (`useState`, `useEffect`), browser APIs, or interactive libraries (like WaveSurfer.js, GSAP) are required.
- **Server Actions**: Use inline `"use server"` or separate action files for mutations. Ensure all user-facing responses are localized.

### 3. Supabase Integration & RLS Bypass
- **Client-Side**: Use `src/lib/supabase/client.ts` for client-side operations.
- **Server-Side**: Use `src/lib/supabase/server.ts` for Server Components and Server Actions.
- **Admin Operations (RLS Bypass)**: Use `src/lib/supabase/admin.ts` (which uses `SUPABASE_SECRET_KEY`) ONLY when bypassing Row Level Security is absolutely necessary (e.g., generating signed playback URLs for family members who do not own the storyteller's audio files).

---

## 🌐 Localization (i18n) Guidelines

- **No Hardcoded Strings**: Never hardcode user-facing text in components, queries, or Server Actions.
- **Translation Files**: Add all keys to `messages/en.json`, `messages/zh.json`, and `messages/th.json`.
- **Server-Side Translation**: Use `getTranslations` from `next-intl/server` in Server Components and Server Actions.
- **Client-Side Translation**: Use `useTranslations` hook in Client Components.
- **Dynamic Dates**: Format dates dynamically using the active locale (e.g., `getLocale()`) rather than forcing hardcoded English/Chinese formats.

---

## 🎨 Styling & UI Guidelines

- **Tailwind CSS v4**: Use modern Tailwind v4 utility classes. Avoid legacy v3 configurations.
- **Design System**: Adhere to the **Premium Listening Room** theme defined in `DESIGN.md`.
  - Background: Deep Onyx (`#11100d`) / Elevated Obsidian (`#1a1814`)
  - Text: Antique Parchment (`#f4efe6`) / Muted Driftwood (`#a79d89`)
  - Accent: Golden Sand (`#d4b67a`)
- **WCAG 2.2 AAA**: Ensure all text-to-background contrast ratios meet AAA standards. Use high-contrast focus rings and accessible interactive states.
- **Animations**: Use GSAP or Framer Motion for smooth, tactile micro-interactions and transitions.

---

## 🧪 Testing Guidelines

- **Vitest**: Used for unit and integration testing.
- **Component Testing**: Use `@testing-library/react` and `@testing-library/jest-dom` for testing React components.
- **Mocking**: Mock external services (like Supabase) in tests to ensure fast, deterministic test runs.
