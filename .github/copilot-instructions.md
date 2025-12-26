# CRM CLAIO Frontend — AI Agent Instructions

## Architecture Overview

**Tech Stack**: React 19, React Router 7, Zustand, date-fns, jsPDF/docx (reporting)  
**Language**: Polish UI + English code

### Core Architecture Pattern

The app is a **modular, feature-based CRM** organized as:

```
src/
├── app/                    # Core routing & layout
│   ├── routes/            # buildAppRoutes(), PATHS constants
│   ├── providers/         # AppDataProvider (global state), theme/modal providers
│   ├── layout/            # MainLayout, navigation bars
│   └── pages/             # HomePage only
├── features/              # Feature modules (board, equipment, tasks, etc.)
│   └── [feature]/
│       ├── index.js       # Barrel exports (pages, components, hooks)
│       ├── pages/         # Feature page components
│       ├── components/    # Feature-specific UI
│       ├── hooks/         # Custom hooks (useBoardLogic, etc.)
│       ├── forms/         # Feature forms
│       ├── styles/        # Feature CSS
│       └── config/ or utils/
└── shared/                # Global utilities & components
    ├── modals/            # GlobalModalProvider, ChangePasswordModal
    ├── components/        # Reusable UI atoms
    ├── forms/             # Global form components
    ├── tables/            # Reusable table components
    ├── ui/                # Design system (buttons, inputs, etc.)
    ├── utils/             # Helpers (date, API, validation)
    └── draftsStore.js     # Zustand drafts store
```

### Key Design Principles

1. **Feature Isolation**: Each feature is self-contained and responsible for its own state, forms, hooks, and styles.
2. **Route Building**: Routes are built dynamically via `buildAppRoutes(deps)` where `deps` = AppData context. See [src/app/routes/index.jsx](src/app/routes/index.jsx).
3. **Provider Stack**: Multiple providers wrap the app (Confirm, Notifications, Messages, Modal, PasswordModal). Check [src/app/App.jsx](src/app/App.jsx) for nesting order.
4. **Fixture-Based Demo Data**: [src/app/__fixtures__/appData.fixtures.js](src/app/__fixtures__/appData.fixtures.js) provides all initial state.

## State Management

**AppDataProvider** ([src/app/providers/AppDataProvider.jsx](src/app/providers/AppDataProvider.jsx)) is the single source of truth:
- Holds orders, tasks, samples, clients, schedule, employees, etc.
- Provides `useAppData()` hook to all children
- Setters are passed down: `setOrdersRegister`, `setTasks`, `setSamples`, etc.
- **No API calls**—this is a demo CRM. All data starts from fixtures.

**Zustand stores** (e.g., [src/shared/draftsStore.js](src/shared/draftsStore.js)) handle non-critical, side-effect state (drafts, UI toggles).

## Routing & Navigation

**Static Paths**: [src/app/routes/paths.js](src/app/routes/paths.js) defines all routes as constants with helpers:
```javascript
PATHS.HOME              // '/'
PATHS.SEARCH.searchUrl(q)  // '/szukaj?q=...'
PATHS.BOARD.ROOT        // '/tablica'
PATHS.OPERATIONS.ROOT   // '/operacje'
```
Use `withQuery()` and `seg()` helpers for safe URL building.

**Dynamic Routes**: Each feature exports `buildXxxRoutes(deps)` functions (e.g., [src/app/routes/board.routes.jsx](src/app/routes/board.routes.jsx)). These accept AppData deps and return route arrays.

## Feature Module Pattern

When adding or modifying a feature, follow this structure:

```jsx
// src/features/[feature]/index.js
export { default as FeaturePage } from './pages/FeaturePage.jsx'
export { default as FeatureComponent } from './components/FeatureComponent.jsx'
export { useFeatureLogic } from './hooks/useFeatureLogic.js'

// src/features/[feature]/pages/FeaturePage.jsx
import { useAppData } from '../../../app/providers/AppDataProvider.jsx'
import { useFeatureLogic } from '../hooks/useFeatureLogic.js'

export default function FeaturePage() {
  const { items, setItems } = useAppData()
  const { selectedItem, handleSelect } = useFeatureLogic(items)
  return (...)
}
```

## Common Patterns

### Custom Hooks Pattern
Hooks encapsulate logic state (selected items, filters, modals). Example: [src/features/board/hooks/useBoardLogic.js](src/features/board/hooks/useBoardLogic.js)
- Use `useState` for component-local state
- Use `useCallback` for stable function refs
- Export as named function (not default)

### Modal & Confirmation Flow
Use providers: [src/app/providers/ConfirmProvider.jsx](src/app/providers/ConfirmProvider.jsx), [GlobalModalProvider.jsx](src/app/providers/GlobalModalProvider.jsx)
```javascript
const { confirm } = useConfirm()
confirm('Delete?', () => { setItems(items.filter(i => i.id !== id)) })
```

### Data Updates
Always use setter functions from AppData:
```javascript
const { ordersRegister, setOrdersRegister } = useAppData()
setOrdersRegister([...ordersRegister, newOrder])  // immutable update
```

## Development Workflow

- **Start**: `npm start` (CRA dev server on port 3000)
- **Test**: `npm test` (Jest via react-scripts)
- **Build**: `npm run build` (production bundle)
- **Lint**: ESLint config in package.json (extends react-app)

Polish language is used in UI text and comments. Keep English for code structure.

## Polish Domain Context

The CRM is for a testing laboratory (laboratorium badań). Key entities:
- **Zlecenia** (Orders) — test requests
- **Próbki** (Samples) — specimens for testing
- **Badania** (Tests) — individual test procedures
- **PB** (Programy Badań) — test programs
- **KB** (Karty Badań) — test cards/specifications
- **Wyposażenie** (Equipment) — lab instruments
- **Metody badawcze** (Test Methods) — procedures

Command palette (Cmd+K style) appears in many features ([src/shared/command-palette](src/shared/command-palette)). It uses the `commands` array passed to `AppRouter`.

## Files to Study First

1. [src/app/App.jsx](src/app/App.jsx) — Provider hierarchy & command setup
2. [src/app/routes/index.jsx](src/app/routes/index.jsx) — Route assembly
3. [src/app/providers/AppDataProvider.jsx](src/app/providers/AppDataProvider.jsx) — Global state shape
4. [src/app/routes/paths.js](src/app/routes/paths.js) — Path constants
5. [src/features/board](src/features/board) — Exemplar feature (complete implementation)

