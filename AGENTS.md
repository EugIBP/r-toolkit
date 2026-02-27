# AGENTS.md

This file contains guidelines for AI agents working in the g-toolkit repository.

## Project Overview

G-ToolKit is a Tauri-based desktop application with a React + TypeScript frontend and Rust backend.
- **Frontend**: React 19, TypeScript 5.8, Vite 7, Tailwind CSS 4
- **Backend**: Rust with Tauri 2.0
- **Package Manager**: Bun
- **UI Library**: shadcn/ui (New York style)
- **State Management**: Zustand

## Build Commands

```bash
# Development (frontend only)
bun run dev

# Production build (frontend)
bun run build

# Tauri development (frontend + Rust)
bun run tauri dev

# Tauri production build
bun run tauri build

# Type checking
bun run tsc

# Preview production build
bun run preview
```

## Project Structure

```
src/                    # React frontend
├── components/         # React components
│   ├── ui/            # shadcn/ui components
│   ├── layout/        # Layout components
│   ├── dashboard/     # Dashboard view components
│   ├── composer/      # Composer view components
│   └── canvas/        # Canvas components
├── views/             # Page-level views
├── store/             # Zustand stores
├── lib/               # Utility functions
└── assets/            # Static assets

src-tauri/             # Rust backend
├── src/               # Rust source files
│   ├── main.rs        # Main entry + Tauri commands
│   └── lib.rs         # Library exports
├── Cargo.toml         # Rust dependencies
└── tauri.conf.json    # Tauri configuration
```

## Code Style Guidelines

### TypeScript/React

- Use functional components with hooks
- Use double quotes for JSX attributes, single quotes for imports
- Use semicolons
- Prefer `interface` over `type` for object shapes
- Use strict TypeScript settings
- Import order: React → External libs → Internal (@/*) → Relative

```typescript
import { useEffect } from "react";
import { create } from "zustand";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/store/useAppStore";
```

### Naming Conventions

- **Components**: PascalCase (e.g., `DashboardView`, `AppSidebar`)
- **Hooks**: camelCase starting with "use" (e.g., `useAppStore`, `useProjectStore`)
- **Stores**: `use{Feature}Store.ts` pattern
- **Utility functions**: camelCase (e.g., `cn` for class merging)
- **Types/Interfaces**: PascalCase (e.g., `RecentProject`, `AppStore`)
- **Constants**: UPPER_SNAKE_CASE for true constants

### File Organization

- One component per file (except small related components)
- Co-locate hooks with components or in dedicated hooks folder
- Store files in `src/store/` with naming `use{Feature}Store.ts`
- UI primitives in `src/components/ui/`
- Feature components grouped in subfolders

### Styling (Tailwind CSS)

- Use Tailwind CSS v4 with `@theme inline` syntax
- Use the `cn()` utility from `@/lib/utils` for conditional classes
- Follow shadcn/ui conventions for component variants
- Use CSS variables for theme colors (--primary, --background, etc.)
- Dark theme is default (bg-[#050505] for main background)

```tsx
// Example usage
<div className={cn("flex items-center gap-2", className)}>
```

### Rust

- Use `snake_case` for functions and variables
- Use `PascalCase` for types and structs
- Error handling: Return `Result<T, String>` for Tauri commands
- Organize commands in `main.rs`
- Use `?` operator for error propagation

```rust
#[tauri::command]
fn load_project(file_path: String) -> Result<String, String> {
    std::fs::read_to_string(&file_path).map_err(|e| e.to_string())
}
```

### Error Handling

- **Frontend**: Use try/catch for async operations, console.error for debugging
- **Backend**: Return Result types, use map_err for error conversion
- User-facing errors should be shown via toast notifications (sonner)

### State Management

- Use Zustand for global state
- Create stores with clear interface definitions
- Use TypeScript for type safety
- Async actions should handle loading states

```typescript
interface AppStore {
  currentView: "dashboard" | "composer" | "dither";
  setCurrentView: (view: "dashboard" | "composer" | "dither") => void;
}
```

### Tauri Commands

- Register commands in `main.rs` with `#[tauri::command]`
- Add to invoke_handler array in main function
- Use window.emit for progress updates
- Commands should be snake_case

### Import Aliases

- `@/` maps to `src/` directory
- Use for all internal imports
- Configured in `tsconfig.json` and `vite.config.ts`

## Testing

No test framework is currently configured. If adding tests:
- Consider Vitest for unit testing
- Use @testing-library/react for component tests

## Key Dependencies

- `@tauri-apps/api` - Tauri JS API
- `@tauri-apps/plugin-*` - Tauri plugins
- `zustand` - State management
- `lucide-react` - Icons
- `radix-ui` - Headless UI primitives
- `class-variance-authority` - Component variants
- `tailwind-merge` + `clsx` - Class merging

## Development Notes

- Frontend runs on port 1420 in dev mode
- HMR uses port 1421 when TAURI_DEV_HOST is set
- Tauri ignores `src-tauri/` directory for file watching
- Uses Bun for fast package management
