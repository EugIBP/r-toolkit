# G-ToolKit - Asset Management Plan

## Контекст

**Ассет (Asset):** Файл + имя в `Objects[]`
```json
{ "Name": "drl", "Path": "icons\\drl.png", "Type": "Ico" }
```

**Instance:** Использование ассета на экране в `Screens[].Icons[]`
```json
{ "Name": "drl", "X": 100, "Y": 200, "States": [...] }
```

**Один ассет → много instance:**
- `drl.png` может использоваться как `drl`, `drl_1`, `drl_2` (разные имена, один файл)

---

## Этапы реализации

### 1. Library → Global (ассеты)

**Поведение:**
- Показываем список всех ассетов (текущее поведение)
- При клике на ассет:
  - Открываем InspectorAsset
  - **Подсвечиваем ВСЕ instance** этого ассета на канвасе
  - Остальные instance затемнены (opacity: 0.15)

**InspectorAsset содержит:**
- Имя ассета (редактируемое)
- Путь к файлу
- Type (Icon/Sprite/Background)
- Кнопку конвертации (уже реализовано)
- **Кнопку "Add Instance"** (только в Edit режиме)

---

### 2. Library → Screen Only (instance)

**Поведение:**
- **Группировать instance по файлу ассета:**

```
Screen Only:
├─ ▼ drl.png (2 instances)
│   ├─ drl (X:100 Y:200)
│   └─ drl_1 (X:300 Y:400)
└─ gear.png (1 instance)
    └─ gear (X:500 Y:100)
```

- При клике на instance:
  - Открываем InspectorIcon
  - Выделяем instance на канвасе

---

### 3. Клик на канвасе

**Поведение:**
- Переключить Library в режим Screen Only
- Найти и выделить instance в списке
- Открыть InspectorIcon для редактирования

**InspectorIcon содержит:**
- Превью
- **Имя instance** (редактируемое только в Edit режиме)
- Координаты X, Y
- Sprite frame preview (если спрайт)
- Color States
- Секцию Asset Info (path, type, кнопка конвертации)

---

### 4. Добавление нового instance

**Модальное окно "Add Instance" содержит:**
- Имя instance (с проверкой уникальности **в рамках всего проекта**)
- Координаты X, Y
- Начальные состояния (States)

**Валидация:**
- Имя не должно совпадать с существующими именами в Objects[]
- Иначе ресурсы не соберутся

**Логика:**
1. Пользователь в Library → Global
2. Выбирает ассет
3. Нажимает "Add Instance"
4. Открывается модальное окно
5. Пользователь вводит:
   - Имя (обязательно, уникальное)
   - X, Y (опционально, по умолчанию центр экрана)
   - States (опционально, по умолчанию DEFAULT + WHITE)
6. Создаётся новый instance

---

### 5. Редактирование имени instance

**Логика:**
- Поле "Instance Name" в InspectorIcon
- Активно только в Edit режиме
- При изменении:
  - Обновляем имя в `Screens[].Icons[].Name`
  - **НЕ** обновляем имя ассета в Objects
  - Проверка уникальности в рамках проекта

---

### 6. Подсветка instance на канвасе

**Global режим:**
- Выбран ассет → все его instance подсвечены
- Остальные instance затемнены

**Screen Only режим:**
- Выбран instance → только он подсвечен
- Остальные затемнены

---

## Файловые изменения

### Frontend:

**`ExplorerAssets.tsx`:**
- Группировка instance в Screen Only режиме
- Подсветка instance при выборе ассета

**`InspectorAsset.tsx`:**
- Кнопка "Add Instance"

**`InspectorIcon.tsx`:**
- Поле "Instance Name"
- Секция Asset Info

**`AddInstanceModal.tsx`:** (новый файл)
- Модальное окно создания instance
- Поля: Name, X, Y, States
- Валидация уникальности имени

**`useProjectStore.ts`:**
- `addInstance(screenIdx, assetName, options)` - создать instance
- `renameInstance(screenIdx, iconIdx, newName)` - переименовать
- `getAssetInstances(assetName)` - получить все instance ассета
- `isNameUnique(name)` - проверка уникальности имени

**`ComposerView.tsx`:**
- Подсветка instance при выбранном ассете

---

## Порядок реализации

1. ✅ Конвертация ассетов (этап 4)
2. ✅ Модальное окно Add Instance
3. ✅ Подсветка instance на канвасе (Global режим)
4. ✅ Группировка в Screen Only
5. ✅ Редактирование имени instance
6. ✅ Интеграция InspectorIcon + Asset Info

---

## Примечания

- Имя instance должно быть уникальным **глобально** (в Objects[])
- При конвертации обновляются Path у **всех** instance данного файла
- Instance = конкретное использование ассета на экране
