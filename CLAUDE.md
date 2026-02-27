# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**G-ToolKit** is a Tauri 2.0 desktop app for managing game/UI resource files (assets, icons, sprites, screens). Despite the repo name `gtk-studio`, this is not a GTK app. Project files are JSON-based with `Objects[]` (assets) and `Screens[].Icons[]` (instances).

## Commands

```bash
bun run dev          # Frontend only (Vite, port 1420)
bun run tauri dev    # Full app dev mode (preferred)
bun run build        # tsc + vite build
bun run tauri build  # Production bundle
bun run tsc          # Type-check only (no emit)
```

Package manager is **Bun** (not npm/yarn/pnpm).

## Architecture

**Frontend** (`src/`): React 19 + TypeScript + Vite + Tailwind CSS v4 + shadcn/ui (New York style)

**Backend** (`src-tauri/src/main.rs`): Single Rust file with all Tauri commands. Key commands: `load_project`, `save_text_file`, `copy_asset_file`, `move_asset_file`, `scan_project_assets`, `delete_project_file`, `file_exists`, `process_images`.

### Three Views

- **Dashboard** (`views/DashboardView.tsx`): Recent projects list with grid/list toggle
- **Composer** (`views/ComposerView.tsx`): Main IDE layout — Explorer (left), Canvas (center), Inspector (right)
- **Dither** (`views/DitherView.tsx`): Batch image processor using Bayer-matrix ordered dithering (565/4444/1555 modes), heavy lifting done in Rust with `rayon` + `image` crate

### State Management (Zustand)

Three stores in `src/store/`:
- `useAppStore.ts` — active view (`dashboard | composer | dither`), recent projects (persisted to `settings.json` via `tauri-plugin-store`), settings, global confirm dialog
- `useProjectStore.ts` — loaded project data, all CRUD for assets/screens/icons/instances
- `useCanvasStore.ts` — canvas pan/zoom/selection state

### Canvas

`components/canvas/layers/IconsLayer.tsx` renders icon instances at X/Y positions. `components/canvas/entities/SmartIcon.tsx` is the individual icon entity.

## Code Style

**TypeScript/React:**
- Functional components + hooks only
- Double quotes for JSX attributes, single quotes for string literals and imports
- Semicolons required
- `interface` over `type` for object shapes
- Import order: React → external libs → internal (`@/*`) → relative
- Naming: `PascalCase` components, `useXxx` hooks, `use{Feature}Store.ts` stores, `UPPER_SNAKE_CASE` constants

**Styling:**
- Tailwind v4 with `@theme inline` syntax; use `cn()` from `@/lib/utils`
- Dark-first palette: `#050505` main canvas, `#0a0a0a` panels, `#030303` sidebar
- CSS variables for theming

**Rust:**
- All Tauri commands return `Result<T, String>`; use `?` for error propagation
- `snake_case` functions, `PascalCase` structs

**Import alias:** `@/` maps to `src/`

## No Tests

No test framework is currently configured.
