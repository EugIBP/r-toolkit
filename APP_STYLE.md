# G-ToolKit UI Style Guide

## Design Philosophy

Dark, professional interface with high contrast and modern aesthetics. Inspired by development tools like VS Code and design software like Figma.

---

## Color Palette

### Background Colors

- **Primary BG (Sidebar)**: `#030303` - Deepest black for side navigation
- **Secondary BG (Panels)**: `#0a0a0a` - Main panel backgrounds
- **Tertiary BG (Elevated)**: `#121212` - Floating elements, modals, toolbars
- **Surface BG**: `#181818` - Input fields, cards
- **Canvas BG**: `#050505` - Work area background

### Border Colors

- **Subtle Border**: `border-white/5` (5% white opacity)
- **Standard Border**: `border-white/10` (10% white opacity)
- **Active Border**: `border-primary/30` or `border-primary/40`
- **Divider**: `bg-white/10` for vertical/horizontal separators

### Text Colors

- **Primary Text**: `text-white` - Headings, important labels
- **Secondary Text**: `text-muted-foreground` - Descriptions, hints
- **Tertiary Text**: `text-white/60`, `text-white/70` - Subtle labels
- **Inverted Text**: `text-[#0a0a0a]` - On primary/bright backgrounds

### Accent Colors

- **Primary Accent**: `primary` (defined in CSS variables) - Active states, CTAs
- **Success**: `text-emerald-400` / `bg-emerald-500/20` / `ring-emerald-500/30` - View mode, confirmations
- **Warning**: `text-amber-400` / `bg-amber-500/20` / `ring-amber-500/30` - Edit mode, warnings
- **Danger**: `text-red-400` / `bg-red-500/20` - Delete actions, errors
- **Info**: `text-blue-400` / `bg-blue-500/20` / `ring-blue-500/30` - Drag & Drop, informational states

---

## Typography

### Font Sizes

- **Page Title**: `text-2xl`, `text-3xl` - Dashboard headings
- **Section Title**: `text-lg`, `text-xl` - Panel headers
- **Card Title**: `text-sm` - Component labels
- **Body**: `text-xs`, `text-[13px]` - Content, list items
- **Caption**: `text-[10px]`, `text-[9px]` - Labels, hints
- **Micro**: `text-[8px]` - Status badges

### Font Weights

- **Bold**: `font-semibold` - Active items, buttons
- **Semibold**: `font-semibold` - Section headers
- **Medium**: `font-medium` - Standard text
- **Black/Heavy**: `font-bold` - Labels with `uppercase` and `tracking`

### Text Styling

- **Labels**: `uppercase tracking-widest` (for section headers)
- **Labels**: `uppercase tracking-wide` (for list items)
- **Monospace**: `font-mono` - Paths, hex codes, technical data
- **Truncation**: `truncate` - For long names with ellipsis

---

## Panel Structure

### Standard Panel (320px width)

```tsx
<div className="w-80 border-r border-white/10 flex flex-col bg-[#0a0a0a] z-30 h-full overflow-hidden">
  {/* Content */}
</div>
```

### Panel Header

```tsx
<div className="flex flex-col gap-2 px-3 py-3 border-b border-white/5 bg-white/[0.01] shrink-0">
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-2 ml-1">
      <Icon className="w-3.5 h-3.5 text-muted-foreground" />
      <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
        Section Title
      </span>
    </div>
    {/* Action buttons */}
  </div>
</div>
```

### Panel Content Area

```tsx
<ScrollArea className="flex-1 h-full">
  <div className="p-3 space-y-2 pb-20">{/* List items */}</div>
</ScrollArea>
```

---

## Buttons

### Primary Action Button (Enabled)

```tsx
<button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors bg-primary/20 text-primary hover:bg-primary/30">
  <Plus className="w-3.5 h-3.5" /> Add Item
</button>
```

### Primary Action Button (Disabled)

```tsx
<button
  disabled
  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors bg-white/5 text-muted-foreground cursor-not-allowed opacity-50"
>
  <Plus className="w-3.5 h-3.5" /> Add Item
</button>
```

### List Item Button (Default)

```tsx
<button className="flex-1 flex items-center gap-3 px-3 py-2.5 text-[13px] rounded-xl cursor-pointer transition-all bg-white/5 border border-transparent hover:bg-white/10">
  <Icon className="w-5 h-5 shrink-0 opacity-60" />
  <span className="truncate text-xs font-semibold">Item Name</span>
</button>
```

### List Item Button (Active/Selected)

```tsx
<button className="flex-1 flex items-center gap-3 px-3 py-2.5 text-[13px] rounded-xl cursor-pointer transition-all bg-primary/15 border border-primary/30 shadow-sm">
  <Icon className="w-5 h-5 shrink-0 opacity-60" />
  <span className="truncate text-xs font-semibold">Item Name</span>
</button>
```

### Icon Button

```tsx
<button className="p-2 text-muted-foreground hover:text-white hover:bg-white/10 rounded-lg transition-all">
  <Icon className="w-4 h-4" />
</button>
```

### Danger Button

```tsx
<button className="w-full flex items-center justify-center gap-2 py-2.5 bg-red-500/5 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all">
  <Trash2 className="w-3.5 h-3.5" /> Delete
</button>
```

---

## Input Fields

### Text Input

```tsx
<div className="relative group">
  <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
  <input
    className="w-full bg-[#181818] border border-white/5 rounded-lg py-2.5 pl-9 pr-3 text-xs font-bold text-white outline-none focus:border-primary/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
    placeholder="Placeholder..."
  />
</div>
```

### Search Input

```tsx
<div className="relative flex items-center bg-white/5 rounded-xl h-9 px-3 w-48 border border-white/5 focus-within:border-primary/50 transition-colors">
  <Search className="w-3.5 h-3.5 text-muted-foreground mr-2 shrink-0" />
  <input
    className="bg-transparent border-none outline-none text-xs font-medium text-white w-full placeholder:text-white/20"
    placeholder="Find asset..."
  />
</div>
```

---

## Tab Switchers

### Pill-style Tabs (in panels)

```tsx
<TabsList className="w-full grid grid-cols-3 h-11 bg-black/40 border border-white/10">
  <TabsTrigger className="text-xs font-semibold data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
    Tab 1
  </TabsTrigger>
</TabsList>
```

### Mode Button (floating toolbar)

Кнопки переключения режимов в плавающих тулбарах. Активное состояние — цветное `bg + text + ring-1`, неактивное — `text-muted-foreground` с hover.

```tsx
<button
  onClick={...}
  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
    active
      ? "bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/30"
      : "text-muted-foreground hover:text-white hover:bg-white/5"
  }`}
>
  <Icon className="w-3.5 h-3.5" /> Label
</button>
```

**Цвета по режиму:**

| Режим       | bg                  | text              | ring                  |
|-------------|---------------------|-------------------|-----------------------|
| View        | `bg-emerald-500/20` | `text-emerald-400`| `ring-emerald-500/30` |
| Edit        | `bg-amber-500/20`   | `text-amber-400`  | `ring-amber-500/30`   |
| Drag & Drop | `bg-blue-500/20`    | `text-blue-400`   | `ring-blue-500/30`    |
| Primary     | `bg-primary/20`     | `text-primary`    | `ring-primary/30`     |

### Filter Button (icon-only, floating toolbar)

```tsx
<button
  title={title}
  className={`p-1.5 rounded-lg transition-all ${
    active
      ? "bg-primary/20 text-primary shadow-sm ring-1 ring-primary/30"
      : "text-muted-foreground hover:text-white hover:bg-white/10"
  }`}
>
  <Icon className="w-4 h-4" />
</button>
```

---

## Floating Toolbars

Все плавающие тулбары используют единый визуальный стиль: `bg-[#121212]/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl`.

### Assets Toolbar (top-left)

Поиск + фильтры ассетов. Позиционируется симметрично ZoomToolbar.

```tsx
<div className="absolute top-6 left-8 z-50 flex items-center p-1.5 bg-[#121212]/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl gap-2">
  {/* Search input */}
  <div className="relative flex items-center bg-white/5 rounded-xl h-9 px-3 w-44 border border-white/5 focus-within:border-primary/50 transition-colors">
    <Search className="w-3.5 h-3.5 text-muted-foreground mr-2 shrink-0" />
    <input ... />
  </div>
  <div className="w-px h-6 bg-white/10" />
  {/* Filter icon buttons */}
  <div className="flex items-center gap-0.5">
    <FilterBtn ... />
  </div>
</div>
```

### Mode Toolbar (top-center)

Переключение режимов канваса. Строго по центру.

```tsx
<div className="absolute top-6 left-1/2 -translate-x-1/2 z-50 flex items-center p-1.5 bg-[#121212]/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl gap-1">
  <ModeBtn active={canvasMode === "view"} activeClass="bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/30" ... />
  <ModeBtn active={canvasMode === "edit"} activeClass="bg-amber-500/20 text-amber-400 ring-1 ring-amber-500/30" ... />
  <div className="w-px h-6 bg-white/10 mx-0.5" />
  <ModeBtn active={allowDnd} activeClass="bg-blue-500/20 text-blue-400 ring-1 ring-blue-500/30" ... />
</div>
```

### Zoom Toolbar (top-right)

```tsx
<div className="absolute top-6 right-8 z-50 flex items-center p-1.5 bg-[#121212]/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl gap-1">
  <Button variant="ghost" size="icon"><ZoomOut /></Button>
  <div className="min-w-[60px] flex items-center justify-center px-3 py-1.5 bg-white/5 rounded-xl text-sm font-mono text-white">
    {zoom}%
  </div>
  <Button variant="ghost" size="icon"><ZoomIn /></Button>
  <div className="w-px h-5 bg-white/10 mx-1" />
  <Button variant="ghost" size="icon"><RotateCcw /></Button>
</div>
```

### Toolbar Layout Rules

- Отступы от краёв: `top-6` (24px сверху), `left-8` / `right-8` (32px от боковых краёв)
- Центрирование: `left-1/2 -translate-x-1/2`
- Внутренний padding: `p-1.5`
- Разделитель между группами: `<div className="w-px h-6 bg-white/10" />`
- Gap между кнопками режима: `gap-1`; между секциями тулбара: `gap-2`

---

## Empty States

```tsx
<div className="py-10 text-center opacity-30 text-[10px] uppercase tracking-widest font-medium">
  No items defined
</div>
```

---

## Icons

### Standard Sizes

- **Tiny**: `w-3 h-3` - Inline icons, status indicators
- **Small**: `w-3.5 h-3.5` - Buttons, inputs
- **Medium**: `w-4 h-4`, `w-5 h-5` - List items, navigation
- **Large**: `w-8 h-8` - Inspector previews, empty states

### Standard Opacity

- **Active**: Full opacity or `opacity-80`
- **Default**: `opacity-60` for list icons
- **Muted**: `text-muted-foreground` class

---

## Shadows & Effects

### Panel Shadow

```tsx
className = "shadow-xl";
```

### Toolbar Shadow

```tsx
className = "shadow-2xl";
```

### Backdrop Blur

```tsx
className = "backdrop-blur-xl";
className = "backdrop-blur-md";
className = "backdrop-blur-sm";
```

### Inner Glow

```tsx
className = "shadow-inner";
```

### Glow Effects (for active items)

```tsx
className = "shadow-[0_0_100px_rgba(0,0,0,0.5)]";
className = "shadow-[0_0_10px_rgba(var(--primary),0.5)]";
```

---

## Animations

### Slide In (for panels)

```tsx
className = "animate-in slide-in-from-right duration-300";
className = "animate-in slide-in-from-left duration-300";
```

### Fade In

```tsx
className = "animate-in fade-in duration-300";
```

### Combined Animation (Inspector)

```tsx
className = "animate-in fade-in slide-in-from-right-4 duration-300";
```

### Transition

```tsx
className = "transition-all";
className = "transition-colors";
```

---

## Layout Spacing

### Panel Padding

- **Container**: `p-3` or `p-4`
- **List items**: `py-2.5 px-3` or `py-3 px-4`
- **Gap between items**: `space-y-2`, `gap-2`, `gap-3`

### Form Spacing

- **Label to input**: `space-y-2`
- **Form groups**: `space-y-6`
- **Section dividers**: `pt-4 border-t border-white/5`

---

## Z-Index Layers

- **Sidebar**: `z-50` (highest)
- **Panels**: `z-30`
- **Floating Toolbars**: `z-50`
- **Canvas Content**: `z-10`
- **Canvas Icons**: `z-10` / `z-100` (selected)
- **Modals**: Default or higher

---

## Component Examples

### Info Box

```tsx
<div className="p-4 bg-primary/5 border border-primary/10 rounded-xl">
  <p className="text-[10px] text-muted-foreground leading-relaxed italic">
    <span className="text-primary font-bold">Note:</span> Description text
  </p>
</div>
```

### Danger Zone

```tsx
<div className="pt-4 border-t border-white/5 space-y-3">
  <span className="text-[9px] font-black uppercase tracking-widest text-red-500/50 ml-1">
    Danger Zone
  </span>
  {/* Danger actions */}
</div>
```

### Dropdown Menu

```tsx
<DropdownMenuContent className="bg-[#121212] border-white/10 text-white min-w-[160px]">
  <DropdownMenuItem className="gap-2 cursor-pointer focus:bg-white/10">
    <Icon className="w-4 h-4 opacity-70" /> Action
  </DropdownMenuItem>
  <div className="h-px bg-white/5 my-1" />
  <DropdownMenuItem className="gap-2 cursor-pointer text-red-400 focus:text-red-400 focus:bg-red-400/10">
    <Icon className="w-4 h-4" /> Delete
  </DropdownMenuItem>
</DropdownMenuContent>
```

---

## shadcn/ui Components

This project uses shadcn/ui components. Always prefer these over custom styles.

### Button

```tsx
import { Button } from "@/components/ui/button";
```

**Variants:**
- `default` - Primary actions (blue background)
- `outline` - Secondary actions (border only)
- `ghost` - Subtle actions, icon buttons
- `destructive` - Delete, dangerous actions (red)
- `secondary` - Alternative to default
- `link` - Text link style

**Sizes:**
- `default` - h-9 px-4
- `sm` - h-8 px-3 (use for compact buttons)
- `lg` - h-10 px-6
- `icon` - square, for icons only
- `icon-sm` - smaller icon button

**Examples:**
```tsx
// Primary action
<Button variant="default">
  <Plus className="w-3.5 h-3.5" /> Add Item
</Button>

// Secondary action
<Button variant="outline" size="sm">
  Cancel
</Button>

// Icon button
<Button variant="ghost" size="icon">
  <Settings className="w-4 h-4" />
</Button>

// Danger action
<Button variant="destructive">
  <Trash2 className="w-3.5 h-3.5" /> Delete
</Button>

// Disabled state
<Button disabled>
  Action
</Button>
```

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

**Usage:**
```tsx
<Tabs value={activeTab} onValueChange={setActiveTab}>
  <TabsList>
    <TabsTrigger value="tab1">Tab 1</TabsTrigger>
    <TabsTrigger value="tab2">Tab 2</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1">Content 1</TabsContent>
  <TabsContent value="tab2">Content 2</TabsContent>
</Tabs>
```

### ScrollArea

```tsx
import { ScrollArea } from "@/components/ui/scroll-area";
```

**Usage:**
```tsx
<ScrollArea className="h-[200px]">
  <div>Scrollable content</div>
</ScrollArea>
```

---

## Usage Rules

1. **Use shadcn components**: Prefer Button, Input, Tabs over custom implementations
2. **Always use semantic colors**: Use `primary`, `success`, `danger` classes instead of hardcoded hex values
3. **Consistent spacing**: Use standard spacing utilities (2, 3, 4, 5) consistently
4. **Text hierarchy**: Bold for active/names, semibold for headers, regular for content
5. **Uppercase tracking**: Use for section labels and action buttons
6. **Icons**: Use opacity-60 for consistency, full opacity only for active states
7. **Borders**: Prefer subtle borders (white/5 or white/10) over hard edges
8. **Hover states**: Always provide hover feedback on interactive elements
9. **Mode buttons**: Use `rounded-xl` + `ring-1` active state pattern (not `rounded-lg` + plain bg) for all toolbar mode switchers
10. **Floating toolbar positions**: Assets → `left-8`, Modes → `left-1/2 -translate-x-1/2`, Zoom → `right-8`; all at `top-6`
