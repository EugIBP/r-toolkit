# Dashboard UX Research

## Текущее состояние

### Проблемы

1. **Скролл не работает** - конфликт flexbox + Radix UI ScrollArea
   - `flex-1 flex flex-col min-h-0` не наследуется корректно
   - ScrollBar скрыт (`scrollbar-hide`)
   - Для 500 проектов это критично

2. **Лимит 15 проектов** в storage (можно расширить)

3. **Нет навигации** по большому количеству проектов

### Компоненты

- `DashboardView.tsx` - главная страница
- `RecentProjects.tsx` - список проектов (grid/list)
- `ProjectCard.tsx` / `ProjectRow.tsx` - карточка/строка проекта
- `ToolsSection.tsx` - секция инструментов
- Store: `useAppStore` - состояние (viewMode, recentProjects)

---

## UX Рекомендации

### 1. Исправить скролл (Приоритет: КРИТИЧНО)

**Причина:** Конфликт Radix ScrollArea с flexbox

- ScrollArea viewport имеет фиксированную высоту
- `scrollbar-hide` скрывает и функциональность

**Решение:**

- Добавить `h-0 min-h-0 overflow-hidden` на контейнер
- Кастомизировать ScrollBar: 4px, полупрозрачный, появляется при hover
- Возможно заменить на нативный overflow с кастомным скроллбаром

---

### 2. Пагинация

Для 500+ проектов нужна стандартная пагинация:

**UI Элементы:**

- Кнопки: Предыдущая / Следующая
- Показ: "Страница X из Y"
- Jump to page: поле ввода номера

**Рекомендации:**

- Размер страницы: рассчитывается от Density
  - Small: 24 карточки
  - Medium: 12 карточек
  - Large: 8 карточек
- **Sticky панель пагинации ВНИЗУ** - зафиксирована, контент скроллится под ней
- Состояние: "1-{N} из {total}"

---

### 3. Настройки сетки

| Опция            | Варианты              | По умолчанию |
| ---------------- | --------------------- | ------------ |
| **View Mode**    | Grid / List           | Grid         |
| **Grid Density** | Small / Medium / Large | Medium       |
| **Сортировка**   | По дате / По имени    | По дате      |

**Grid Density влияет на размер карточек и количество на странице:**

- Small: компактные карточки, 24 на страницу
- Medium: баланс, 12 на страницу
- Large: крупные превью, 8 на страницу

---

### 4. Сортировка

Текущая: только по `lastOpened` (descending)

**Расширить:**

- `lastOpened` - по дате открытия (по умолчанию)
- `name` - по алфавиту (A-Z / Z-A)
- `dateCreated` - по дате создания (если есть в метаданных)

**UI:**

- Dropdown в toolbar: "Сортировать: Недавно открытые"
- Иконка стрелки для asc/desc

---

### 5. Favorites (Закреплённые)

**Функционал:**

- Звездочка на карточке проекта
- Закреплённые проекты всегда сверху
- Хранить массив IDs в store

**UI:**

- При клике на звездочку - добавить в favorites
- Секция "Закреплённые" перед остальными
- Фильтр "Показать только избранное"

---

### 6. Bulk Actions

Для большого количества проектов полезно массово управлять:

**UI:**

- Чекбокс появляется при hover на карточке
- При выделении любой карточки → активируется режим массовых действий
- В режиме: чекбоксы видны на всех карточках + панель действий
- Панель действий: Удалить / Добавить в избранное
- "Выбрать все на странице"

**Выход из режима:** снять выделение со всех карточек

---

### 7. Визуальные улучшения

| Элемент           | Текущее           | Рекомендуемое            |
| ----------------- | ----------------- | ------------------------ |
| Hover на карточке | border-primary/30 | + shadow + scale(1.02)   |
| Selection         | Нет               | Явный border + bg        |
| Loading           | Нет               | Skeleton                 |
| Empty state       | FolderOpen иконка | Полезная подсказка + CTA |

---

### 8. Расширенный поиск

Текущий: простой поиск по имени

**Улучшения:**

- Поиск по пути
- Фильтры: Только избранные / За последнюю неделю
- Debounce (300ms)
- "Нет результатов" с suggestions

---

## Архитектура решения

```
DashboardView
├── Header Section
│   ├── PageTitle + Version
│   ├── Search Input
│   ├── Workspace/Tools tabs
│   └── [+ New] Dropdown
├── Controls Bar
│   ├── Sort Dropdown
│   ├── Density Toggle (S/M/L)
│   └── View Mode (Grid/List)
├── Content Area (scrollable)
│   └── ProjectGrid/List
└── Pagination Bar (sticky bottom)
    ├── Prev/Next buttons
    ├── Page indicator
    └── Jump to page
```

---

## State расширение

```typescript
interface AppStore {
  // ... existing
  density: "small" | "medium" | "large";
  currentPage: number;
  sortBy: "lastOpened" | "name";
  sortOrder: "asc" | "desc";

  setDensity: (density: "small" | "medium" | "large") => void;
  setCurrentPage: (page: number) => void;
  setSortBy: (sort: string) => void;
}

// Computed: pageSize зависит от density
const getPageSize = (density) => ({
  small: 24,
  medium: 12,
  large: 8,
}[density]);
```

---

## Приоритеты реализации

1. **Sprint 1: Скролл + Пагинация**
   - Исправить ScrollArea
   - Добавить sticky пагинацию внизу
   - PageSize рассчитывается от Density (8/12/24)

2. **Sprint 2: Контроль сетки**
   - Density (S/M/L) с размерами карточек
   - Сортировка

3. **Sprint 3: Bulk Actions**
   - Чекбокс по hover
   - Активация режима при выделении
   - Панель действий

4. **Sprint 4 (отложено): Favorites, Визуальные улучшения**

---

## Аналоги для вдохновения

- **Figma** - Recent Files, хорошая пагинация + grid/list
- **VS Code** - Recent + folders + search
- **Linear** - S/M/L density toggle
- **Notion** - Grid view с настраиваемыми колонками
