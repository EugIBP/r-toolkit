# Resource Toolkit UI Style Guide

## Design Philosophy

Dark, professional interface with high contrast and modern aesthetics. Inspired by development tools like VS Code and design software like Figma.

> **Note:** This style guide reflects the actual implementation in the codebase. All patterns are extracted from real components.

---

## Color Palette

### Background Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `bg-canvas` | `#050505` | Main workspace background (all views) |
| `bg-sidebar` | `#030303` | Left sidebar (Explorer in Composer) |
| `bg-panel` | `#0a0a0a` | Right panel (Inspector), Explorer, Cards |
| `bg-elevated` | `#121212` | Modals, Dropdowns, Floating toolbars |
| `bg-surface` | `#181818` | Input fields |

### Border Colors

| Token | Opacity | Usage |
|-------|---------|-------|
| `border-subtle` | `white/5` | Input fields, subtle separators |
| `border-default` | `white/10` | Panels, cards, modals |
| `border-active` | `white/20` | Active/focused states |
| `border-focus` | `primary/40` | Focus ring on inputs |

### Text Colors

| Token | Class | Usage |
|-------|-------|-------|
| Primary | `text-white` | Headings, important labels |
| Secondary | `text-muted-foreground` | Descriptions, hints |
| Tertiary | `text-white/60` | Subtle labels, secondary info |
| Muted | `text-white/40` | Disabled, placeholders |
| Mono | `text-white/80` | Paths, code, technical data |

### Accent Colors

| Accent | Background | Text | Ring |
|--------|------------|------|------|
| Primary | `bg-primary/20` | `text-primary` | `ring-primary/30` |
| Emerald (View) | `bg-emerald-500/20` | `text-emerald-400` | `ring-emerald-500/30` |
| Amber (Edit) | `bg-amber-500/20` | `text-amber-400` | `ring-amber-500/30` |
| Blue (DnD) | `bg-blue-500/20` | `text-blue-400` | `ring-blue-500/30` |
| Red (Danger) | `bg-red-500/20` | `text-red-400` | `ring-red-500/30` |

---

## Typography

### Font Sizes

| Size | Class | Usage |
|------|-------|-------|
| Page Title | `text-2xl`, `text-4xl` | Dashboard, DitherView header |
| Section | `text-sm` | Modal headers |
| **Body** | **`text-xs`** | **Main size used everywhere** |
| Label | `text-[10px]` | Section labels |
| Badge | `text-[8px]` | Status indicators |

### Font Weights

| Weight | Class | Usage |
|--------|-------|-------|
| Bold | `font-bold` | Card titles, primary actions |
| Semibold | `font-semibold` | Buttons, labels, active items |
| Medium | `font-medium` | Body text |
| Mono | `font-mono` | Paths, hex codes, numbers |

### Text Patterns

```tsx
// Section Label (most common)
<span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
  Section Title
</span>

// Body Text
<span className="text-xs text-muted-foreground">
  Description text
</span>

// Item Name
<span className="text-xs font-semibold text-white truncate">
  Item Name
</span>

// Mono/Path
<span className="text-xs font-mono text-white/80">
  /path/to/file.png
</span>

// Empty State
<div className="py-10 text-center opacity-30 text-xs uppercase tracking-widest font-medium">
  No items found
</div>
```

---

## Component Patterns

### Page Container

```tsx
<div className="h-full w-full flex flex-col items-center justify-center bg-[#050505] relative overflow-hidden">
  {/* Page content */}
</div>
```

### Back Button

```tsx
<button className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-muted-foreground hover:text-white hover:bg-white/5 transition-colors rounded-lg">
  <ArrowLeft className="w-3.5 h-3.5" />
  Back to Workspace
</button>
```

### Panel (Left/Right)

```tsx
// Left Panel (Explorer)
<div className="w-80 border-r border-white/10 flex flex-col bg-[#0a0a0a] z-30 h-full overflow-hidden">
  {/* Content */}
</div>

// Right Panel (Inspector)
<div className="w-80 border-l border-white/10 flex flex-col bg-[#0a0a0a] z-30 h-full overflow-hidden">
  {/* Content */}
</div>
```

### Panel Header

```tsx
<div className="h-12 border-b border-white/10 flex items-center px-5 bg-white/[0.02] shrink-0">
  <Icon className="w-4 h-4 text-primary mr-2 opacity-80" />
  <span className="text-xs font-bold uppercase tracking-widest text-white/90">
    Panel Title
  </span>
</div>
```

### Floating Toolbar

```tsx
<div className="absolute top-6 left-8 z-50 flex items-center p-1.5 bg-[#121212]/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl gap-2">
  {/* Toolbar content */}
</div>
```

**Toolbar Positions:**
- Assets: `top-6 left-8`
- Mode: `top-6 left-1/2 -translate-x-1/2`
- Zoom: `top-6 right-8` or `bottom-6 right-8`
- History: `top-6 right-8`

### Toolbar Divider

```tsx
<div className="w-px h-6 bg-white/10 mx-0.5" />
```

### Card

```tsx
<div className="bg-[#0a0a0a] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
  <div className="border-b border-white/10 p-6 bg-white/[0.02]">
    {/* Header */}
  </div>
  <div className="p-6">
    {/* Content */}
  </div>
</div>
```

### Input with Icon

```tsx
<div className="relative">
  <FolderInput className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
  <input
    className="w-full bg-[#181818] border border-white/5 rounded-lg py-2.5 pl-9 pr-3 text-xs font-mono text-white outline-none focus:border-primary/40 transition-all"
    placeholder="Select folder..."
  />
</div>
```

### Search Input (in toolbar)

```tsx
<div className="relative flex items-center bg-white/5 rounded-xl h-9 px-3 w-44 border border-white/5 focus-within:border-primary/50 transition-colors">
  <Search className="w-3.5 h-3.5 text-muted-foreground mr-2 shrink-0" />
  <input
    className="bg-transparent border-none outline-none text-xs font-medium text-white w-full placeholder:text-white/20"
    placeholder="Find asset..."
  />
</div>
```

---

## Button Patterns

### Primary Button (Enabled)

```tsx
<button className="flex items-center gap-2 px-4 py-2.5 bg-primary/20 text-primary hover:bg-primary/30 rounded-xl text-xs font-semibold transition-all">
  <Plus className="w-3.5 h-3.5" /> Add Item
</button>
```

### Primary Button (Disabled)

```tsx
<button disabled className="flex items-center gap-2 px-4 py-2.5 bg-white/5 text-muted-foreground rounded-xl text-xs font-semibold transition-all opacity-50 cursor-not-allowed">
  <Plus className="w-3.5 h-3.5" /> Add Item
</button>
```

### Icon Button

```tsx
<button className="p-2 text-muted-foreground hover:text-white hover:bg-white/10 rounded-lg transition-all">
  <Icon className="w-4 h-4" />
</button>
```

### Mode Button (Active)

```tsx
<button className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-all bg-primary/20 text-primary ring-1 ring-primary/30">
  <Icon className="w-3.5 h-3.5" /> Label
</button>
```

### Mode Button (Inactive)

```tsx
<button className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-all text-muted-foreground hover:text-white hover:bg-white/5">
  <Icon className="w-3.5 h-3.5" /> Label
</button>
```

### Filter Button (Icon-only, Active)

```tsx
<button className="p-1.5 rounded-lg transition-all bg-primary/20 text-primary shadow-sm ring-1 ring-primary/30">
  <Icon className="w-4 h-4" />
</button>
```

### Filter Button (Icon-only, Inactive)

```tsx
<button className="p-1.5 rounded-lg transition-all text-muted-foreground hover:text-white hover:bg-white/10">
  <Icon className="w-4 h-4" />
</button>
```

### Danger Button

```tsx
<button className="w-full flex items-center justify-center gap-2 py-2.5 bg-red-500/5 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl text-xs font-bold uppercase tracking-widest transition-all">
  <Trash2 className="w-3.5 h-3.5" /> Delete
</button>
```

---

## Tab Patterns

### Pill Tabs (Explorer)

```tsx
<TabsList className="w-full grid grid-cols-3 h-11 bg-black/40 border border-white/10">
  <TabsTrigger className="text-xs font-semibold data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:ring-1 data-[state=active]:ring-primary/30">
    Tab Name
  </TabsTrigger>
</TabsList>
```

### Mode Switcher (in toolbar)

```tsx
<div className="flex bg-black/40 border border-white/10 rounded-xl p-1">
  <button className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${active ? "bg-primary/20 text-primary ring-1 ring-primary/30" : "text-muted-foreground hover:text-white hover:bg-white/5"}`}>
    Label
  </button>
</div>
```

---

## Dropdown Menu

```tsx
<DropdownMenuContent className="bg-[#121212] border-white/10 text-white min-w-[180px] p-1.5 rounded-xl shadow-2xl z-50">
  <DropdownMenuItem className="gap-2 cursor-pointer focus:bg-white/10 py-3 rounded-lg">
    <Icon className="w-4 h-4 opacity-70" /> Action
  </DropdownMenuItem>
  <div className="h-px bg-white/5 my-1.5" />
  <DropdownMenuItem className="gap-2 cursor-pointer text-red-400 focus:text-red-400 focus:bg-red-400/10 py-3 rounded-lg">
    <Icon className="w-4 h-4" /> Delete
  </DropdownMenuItem>
</DropdownMenuContent>
```

---

## Card Patterns

### Tool Card (Dashboard)

```tsx
<button className="group flex items-start gap-4 p-5 bg-white/[0.02] border border-white/5 rounded-xl hover:bg-white/[0.05] hover:border-white/10 transition-all text-left">
  <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:border-primary/30 group-hover:bg-primary/10 transition-colors">
    <Icon className="w-5 h-5 text-primary/70" />
  </div>
  <div className="flex-1 min-w-0">
    <h3 className="text-sm font-medium text-white truncate">Title</h3>
    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">Description</p>
  </div>
</button>
```

### Project Card (Dashboard Grid)

```tsx
<div className="group relative bg-[#121212] border border-white/5 hover:border-primary/30 rounded-2xl overflow-hidden transition-all cursor-pointer flex flex-col">
  {/* Thumbnail */}
  <div className="aspect-video bg-[#0a0a0a]">
    {/* Preview */}
  </div>
  {/* Info */}
  <div className="p-4">
    <h3 className="font-bold text-white text-sm truncate">Project Name</h3>
    <p className="text-xs text-muted-foreground opacity-50">path/to/project</p>
  </div>
</div>
```

---

## Empty States

```tsx
<div className="py-20 flex flex-col items-center opacity-20">
  <Icon className="w-16 h-16 mb-4" />
  <p className="text-sm font-medium uppercase tracking-[0.2em]">
    No items found
  </p>
</div>
```

---

## Progress & Status

### Progress Bar

```tsx
<div className="h-1 bg-white/5 rounded-full overflow-hidden">
  <div className="h-full bg-primary transition-all duration-300" style={{ width: `${progress}%` }} />
</div>
```

### Status Badge

```tsx
<span className="text-[8px] px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 rounded font-bold uppercase">
  Active
</span>
```

### Info/Result Box

```tsx
<div className={`flex items-center gap-3 p-4 rounded-xl border ${success ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-400" : "bg-red-500/5 border-red-500/20 text-red-400"}`}>
  <Icon className="w-4 h-4" />
  <span className="text-xs font-medium">Status message</span>
</div>
```

---

## Icons

### Standard Sizes

| Size | Class | Usage |
|------|-------|-------|
| Tiny | `w-3 h-3` | Inline icons, status dots |
| Small | `w-3.5 h-3.5` | Buttons, inputs |
| Medium | `w-4 h-4` | List items, navigation |
| Large | `w-5 h-5` | Panel headers, tool cards |
| XLarge | `w-8 h-8` | Empty states |
| Hero | `w-16 h-16` | Page headers |

### Standard Opacity

| State | Opacity | Usage |
|-------|---------|-------|
| Default | `opacity-60` | List icons, inactive |
| Active | `opacity-100` | Selected items |
| Muted | `text-muted-foreground` | Labels, hints |

---

## Shadows & Effects

### Panel Shadow

```tsx
className = "shadow-xl"
```

### Toolbar Shadow

```tsx
className = "shadow-2xl"
```

### Canvas Shadow

```tsx
className = "shadow-[0_0_100px_rgba(0,0,0,0.5)]"
```

### Backdrop Blur

```tsx
className = "backdrop-blur-xl"  // Toolbars
className = "backdrop-blur-md"  // Modals
```

---

## Animations

### Fade In

```tsx
className = "animate-in fade-in duration-300"
```

### Slide In (Panels)

```tsx
className = "animate-in fade-in slide-in-from-right duration-300"
```

### Zoom In (Modals)

```tsx
className = "animate-in fade-in zoom-in-95 duration-200"
```

### Page Transitions

```tsx
className = "animate-in fade-in duration-1000"
```

---

## Z-Index Layers

| Layer | Z-Index | Usage |
|-------|---------|-------|
| Toolbars | `z-50` | Floating toolbars, dropdowns |
| Panels | `z-30` | Explorer, Inspector |
| Canvas | `z-10` | Canvas content |
| Canvas Icons | `z-1` / `z-100` | Normal / Selected |

---

## Layout Spacing

### Panel Padding

- Container: `p-3` or `p-4`
- List items: `py-2.5 px-3`
- Gap between items: `space-y-2`, `gap-2`

### Form Spacing

- Label to input: `space-y-2`
- Form groups: `space-y-6`
- Section dividers: `pt-4 border-t border-white/5`

### Page Padding

- Dashboard: `px-10 pt-[12vh] pb-20`
- DitherView: `p-6`

---

## shadcn/ui Components

This project uses shadcn/ui components. Prefer these over custom implementations.

### Button

```tsx
import { Button } from "@/components/ui/button";
```

**Variants:**
- `default` - Primary actions
- `outline` - Secondary actions
- `ghost` - Subtle actions, icon buttons
- `destructive` - Delete actions (red)
- `secondary` - Alternative styling

**Sizes:**
- `default` - h-9 px-4
- `sm` - h-8 px-3
- `lg` - h-10 px-6
- `icon` - square for icons
- `icon-sm` - smaller icon button
- `icon-xs` - smallest icon button

### Input

```tsx
import { Input } from "@/components/ui/input";
```

**Usage:**
```tsx
<Input placeholder="Search..." />
<Input type="number" />
<Input disabled />
```

### Tabs

```tsx
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
```

### ScrollArea

```tsx
import { ScrollArea } from "@/components/ui/scroll-area";
```

### DropdownMenu

```tsx
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
```

---

## Usage Rules

1. **Use shadcn components**: Prefer Button, Input, Tabs over custom implementations
2. **Use semantic colors**: Use `primary`, `emerald`, `amber`, `blue`, `red` for accent colors
3. **Consistent sizing**: Use `text-xs` as the main body size throughout
4. **Text hierarchy**: 
   - `font-bold` for card titles
   - `font-semibold` for buttons and labels
   - `font-medium` for body text
5. **Uppercase tracking**: Use `uppercase tracking-widest` for section labels
6. **Icons**: Use `opacity-60` for default state, full opacity for active
7. **Borders**: Use `white/5` for inputs, `white/10` for panels
8. **Hover states**: Always provide hover feedback on interactive elements
9. **Mode buttons**: Use `rounded-xl` + `ring-1` active state pattern
10. **Floating toolbar**: Use consistent positioning (`top-6`, `left-8`/`right-8`)
