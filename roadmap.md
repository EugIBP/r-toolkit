# Roadmap

## Sprint 1: Scroll + Pagination

- [ ] Fix Radix ScrollArea (flex + h-0)
- [ ] Add sticky pagination at bottom
- [ ] PageSize: 8/12/24 (depends on Density)

## Sprint 2: Density + Sort

- [ ] Density toggle (S/M/L) with card sizes
- [ ] Sorting: by date / by name
- [ ] Reset currentPage on filter change

## Sprint 3: Bulk Actions

- [ ] Checkbox on hover
- [ ] Activate bulk mode on selection
- [ ] Action panel (delete, favorite)
- [ ] "Select all on page"

---

## Sprint 4 (deferred): Favorites + Visual

- [ ] Star on card
- [ ] Favorites section at top
- [ ] Improve hover/selection states

---

## Sprint 5 (deferred): SQLite Integration

### Goal

Replace JSON files with SQLite for blazing fast performance.

### Database Location

```
{Program installation directory}/
├── ResourceToolkit.exe
├── app.db           # Global: recent, favorites, settings
└── projects/
    └── {project_hash}.db  # Per-project data
```

### Database Schema

**app.db**

```sql
CREATE TABLE projects (
    id TEXT PRIMARY KEY,
    path TEXT NOT NULL,
    display_name TEXT NOT NULL,
    description TEXT,
    last_opened INTEGER NOT NULL,
    created_at INTEGER NOT NULL,
    is_favorite INTEGER DEFAULT 0,
    last_synced INTEGER
);

CREATE TABLE settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at INTEGER NOT NULL
);

CREATE INDEX idx_projects_last_opened ON projects(last_opened DESC);
CREATE INDEX idx_projects_favorite ON projects(is_favorite);
CREATE INDEX idx_projects_path ON projects(path);
```

**projects/{hash}.db**

```sql
CREATE TABLE canvas_state (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    icon_frames TEXT,
    icon_frame_counts TEXT,
    icon_orientations TEXT,
    selected_states TEXT,
    updated_at INTEGER NOT NULL
);

CREATE TABLE project_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at INTEGER NOT NULL
);

CREATE TABLE thumbnails (
    icon_name TEXT PRIMARY KEY,
    source_path TEXT NOT NULL,
    updated_at INTEGER NOT NULL
);
```

### SQLite vs Zustand

| Data             | SQLite         | Zustand    | Reason                     |
| ---------------- | -------------- | ---------- | -------------------------- |
| Recent projects  | ✅             | ❌         | Indexing, fast search      |
| Favorites        | ✅             | ❌         | SQL filtering              |
| Global settings  | ✅             | ❌         | Single source              |
| Project settings | ✅             | ❌         | Grid, snap, autosave       |
| Project metadata | ✅             | ❌         | Name, description          |
| Canvas state     | ✅ (sync)      | ✅ (cache) | Memory cache, sync to DB   |
| Thumbnails       | ✅ (path only) | ❌         | Reference to original file |
| Selection/Zoom   | ❌             | ✅         | Runtime only               |
| Undo/Redo        | ❌             | ✅         | Very frequent changes      |

### Migration Flow

```
1. User opens project
2. Check: does projects/{hash}.db exist?
   ├─ NO → Read .rtoolkit/canvas.json + settings.json
   │       ↓
   │   Toast: "Project updated. Please save to complete migration."
   │       ↓
   │   Create project.db, migrate data
   │
   └─ YES → Load from project.db

3. First "Save"
4. Dialog: "Remove old .json files from .rtoolkit/?"
5. If Yes → Delete canvas.json, settings.json
```

### Fallback (SQLite unavailable)

```
SQLite write error
    ↓
Save to Zustand (memory)
    ↓
Retry every 30 seconds
    ↓
Success → Clear memory
    ↓
On close: if unsaved in memory → warning
```

### Tauri Commands

```rust
// App-level (app.db)
#[tauri::command]
fn get_recent_projects(limit: i32) -> Result<Vec<ProjectMeta>, String>

#[tauri::command]
fn add_recent_project(path: String, name: String, desc: Option<String>) -> Result<(), String>

#[tauri::command]
fn remove_recent_project(id: String) -> Result<(), String>

#[tauri::command]
fn toggle_favorite(id: String) -> Result<bool, String>

#[tauri::command]
fn get_setting(key: String) -> Result<Option<String>, String>

#[tauri::command]
fn set_setting(key: String, value: String) -> Result<(), String>

// Project-level (project.db)
#[tauri::command]
fn load_canvas_state(project_path: String) -> Result<CanvasState, String>

#[tauri::command]
fn save_canvas_state(project_path: String, state: CanvasState) -> Result<(), String>

#[tauri::command]
fn get_project_settings(project_path: String) -> Result<HashMap<String, String>, String>

#[tauri::command]
fn set_project_setting(project_path: String, key: String, value: String) -> Result<(), String>

// Migration
#[tauri::command]
fn migrate_project(project_path: String) -> Result<MigrateResult, String>

#[tauri::command]
fn cleanup_old_files(project_path: String) -> Result<CleanupResult, String>
```

### Rust Modules Structure

```
src-tauri/src/
├── db/
│   ├── mod.rs
│   ├── app.rs
│   ├── project.rs
│   └── schema.rs
└── main.rs
```

### Dependencies (Cargo.toml)

```toml
rusqlite = { version = "0.31", features = ["bundled"] }
parking_lot = "0.12"
once_cell = "1.19"
```

### Todo List

- [ ] Add rusqlite to Cargo.toml
- [ ] Create db/ module in src-tauri
- [ ] Implement app.db (projects table)
- [ ] Implement app.db (settings table)
- [ ] Implement project.db (canvas_state table)
- [ ] Implement project.db (settings table)
- [ ] Implement project.db (thumbnails table)
- [ ] Write Tauri commands for all DB operations
- [ ] Create src/lib/dbAdapter.ts
- [ ] Update useAppStore: use dbAdapter
- [ ] Update workspaceSlice: use dbAdapter
- [ ] Implement migrate_project()
- [ ] Implement cleanup_old_files()
- [ ] Add fallback to useDatabase store
- [ ] Add periodic sync (30 sec)
- [ ] Add Toast on migration
- [ ] Add Dialog for cleanup
- [ ] Test migration
- [ ] Test fallback
