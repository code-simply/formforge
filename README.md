# FormForge 🔨

> **`formforge`** — Modern, 100% TypeScript drag-and-drop form builder, multi-step wizard, and runtime renderer built on **shadcn/ui**, **Tailwind CSS**, **React Hook Form**, and **Zod**.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18%20%7C%2019-blue)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS%20v4-blue)](https://tailwindcss.com/)

---

## ✨ Features

- 🎯 **Visual Drag-and-Drop Form Builder**: Clean, single-header studio navbar with live canvas, drag-and-drop element palette, and property inspector.
- 🚀 **Zero-Baggage Form Renderer**: Separate, lightweight runtime component `<FormRenderer />` that renders schemas with zero builder overhead.
- 📐 **Responsive 4-Tier Layout Grid**:
  $$\text{Multi-Step Pages} \longrightarrow \text{Rows} \longrightarrow \text{Columns (1-12)} \longrightarrow \text{Fields}$$
  Supports custom widths (`50:50`, `33:33:33`, `25:75`, etc.), sub-columns, and native CSS container queries (`@container`).
- 🎨 **Shadcn UI & Zinc Aesthetic**: Built natively on Radix UI primitives and styled with Tailwind design tokens. Complete dark & light mode support out of the box.
- 🔀 **Conditional Logic & Step Branching**:
  - Show/hide, enable/disable, or require fields dynamically based on user inputs.
  - Multi-step wizard branching: route users dynamically to different pages based on their answers.
- 🔒 **Dynamic Zod Validation**: Generates type-safe Zod validation schemas for active, visible form fields at runtime.
- ⚡ **Webhook Pipeline & Payload Remapping**: Live test webhook dispatcher, latency analyzer, cURL snippet generator, and key-remapping engine.
- 📊 **Submissions Manager**: In-app submission records viewer, search, and one-click export to CSV & JSON.
- 📦 **Subpath Exports**: Clean modular exports for `formforge`, `formforge/renderer`, and `formforge/core`.
- ⏪ **Undo / Redo History**: Full state history stack with keyboard shortcuts (`Ctrl+Z` / `Ctrl+Y`).
- 🔄 **Portable JSON Schema**: Import, export, and embed schemas anywhere.

---

## 📦 Installation

```bash
npm install formforge zod react-hook-form
# or with pnpm
pnpm add formforge zod react-hook-form
# or with yarn
yarn add formforge zod react-hook-form
```

Ensure Tailwind CSS is configured in your project (standard shadcn/ui setup).

---

## 🚀 Quick Start

### 1. Visual Form Builder (`<FormBuilder />`)

Embed the full visual studio directly into your application or admin panel:

```tsx
import React, { useState } from 'react'
import { FormBuilder } from 'formforge'
import { FormBuilderSchema } from 'formforge/core'
import 'formforge/style.css'

export function FormBuilderPage() {
  const [schema, setSchema] = useState<FormBuilderSchema>()

  return (
    <div className="h-screen w-full">
      <FormBuilder
        initialSchema={schema}
        onChange={(updatedSchema) => {
          setSchema(updatedSchema)
        }}
      />
    </div>
  )
}
```

### 2. Runtime Form Renderer (`<FormRenderer />`)

Render saved schemas for consumers without loading the builder bundle:

```tsx
import React from 'react'
import { FormRenderer } from 'formforge/renderer'
import { FormBuilderSchema } from 'formforge/core'
import 'formforge/style.css'

export function ConsumerForm({ schema }: { schema: FormBuilderSchema }) {
  const handleSubmit = (values: Record<string, unknown>) => {
    console.log('Submitted Form Values:', values)
  }

  return (
    <div className="max-w-2xl mx-auto py-10">
      <FormRenderer
        schema={schema}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
```

---

## 🏗️ Subpath Exports

| Export Path | Content & Purpose |
| :--- | :--- |
| `formforge` | Main entry point containing `<FormBuilder />`, `<HeaderBar />`, and studio shell. |
| `formforge/renderer` | Lightweight runtime renderer (`<FormRenderer />`, `<FormFieldRenderer />`, `useFormEngine`). |
| `formforge/core` | Pure TypeScript schemas, types, Zod generators, webhook remapping, and normalization. |
| `formforge/editor` | Visual editor components (`Canvas`, `PaletteSidebar`, `PropertiesPanel`, `useBuilderStore`). |
| `formforge/style.css` | Compiled standalone CSS stylesheets. |

---

## 🛠️ Development & Contributing

Contributions are warmly welcomed! Anyone can clone the repository, run the development environment, and contribute:

```bash
# Clone the repository
git clone https://github.com/code-simply/formforge.git
cd formforge

# Install dependencies
npm install

# Start local interactive studio
npm run dev

# Run test suite (59 unit tests)
npm test

# Build production library distribution
npm run build
```

---

## 📄 License

MIT © [Parthiban (code-simply)](https://github.com/code-simply)
