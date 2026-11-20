# Migrating from Formeo (v5) to `shadcn-form-builder`

If you are upgrading from **Formeo (v5)**, this guide explains how your existing form definitions and architecture map to `shadcn-form-builder`.

---

## 1. Key Architectural Differences

| Formeo (v5) | `shadcn-form-builder` | Why it Changed |
| :--- | :--- | :--- |
| Imperative DOM (`dom.js`) | Declarative React + Radix UI Primitives | Modern reactivity, accessibility, and zero DOM hacks |
| Manual `.d.ts` types | 100% Strict TypeScript & Zod schemas | Strict type safety and compile-time verification |
| Single monolithic package | Modular subpaths (`/core`, `/renderer`, `/editor`) | Smaller bundle size for end users |
| Custom CSS / SCSS | Tailwind CSS & CSS design variables | Modern design systems and instant theme toggling |
| Stages | Pages (Multi-Step Forms) | Intuitive step-by-step form wizards |

---

## 2. Automated Schema Migration

`shadcn-form-builder` includes a built-in migration utility that converts legacy Formeo JSON into modern `FormBuilderSchema`:

```typescript
import { migrateLegacyFormeoSchema } from 'shadcn-form-builder/core'

const legacyFormeoJson = {
  stages: {
    stage_1: { children: ['row_1'] }
  },
  rows: {
    row_1: { children: ['col_1'] }
  },
  columns: {
    col_1: { width: 12, children: ['f_1'] }
  },
  fields: {
    f_1: { tag: 'input', attrs: { type: 'text', label: 'First Name' } }
  }
}

// Automatically converts to modern FormBuilderSchema:
const modernSchema = migrateLegacyFormeoSchema(legacyFormeoJson)
```

---

## 3. UI Migration in the Editor

In the visual editor, open the **Import** dialog and paste your legacy Formeo JSON definition. The editor will automatically detect the legacy schema structure, migrate it to the modern format, and display a migration confirmation badge.
