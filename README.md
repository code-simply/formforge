# shadcn-form-builder

A modern, 100% TypeScript drag-and-drop form builder and form renderer built on **shadcn/ui**, **Tailwind CSS**, **React Hook Form**, and **Zod**. Recreated from the core concepts and features of Formeo with modern reactive architecture.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18%20%7C%2019-blue)](https://react.dev/)

---

## ✨ Features

- 🎯 **Visual Drag-and-Drop Form Builder**: Intuitive visual editor with live canvas, element palette, and property inspector.
- 🚀 **Zero-Baggage Form Renderer**: Separate, lightweight runtime component `<FormRenderer />` that renders schemas with zero builder overhead.
- 📐 **4-Tier Responsive Layout**:
  $$\text{Pages (Multi-Step)} \longrightarrow \text{Rows} \longrightarrow \text{Columns (1-12 Grid)} \longrightarrow \text{Fields}$$
- 🎨 **Shadcn UI & Tailwind CSS**: Built natively on Radix UI primitives and styled with Tailwind design tokens. Full dark mode support out of the box.
- ⚡ **Dynamic Conditional Logic**: Show/hide, enable/disable, or require fields dynamically based on user input with AND/OR rule groups.
- 🔒 **Native Zod Validation**: Generates dynamic Zod validation schemas for active, visible form fields at runtime.
- 📦 **Multi-Format Modern Distribution**: Clean subpath exports for `shadcn-form-builder`, `shadcn-form-builder/renderer`, and `shadcn-form-builder/core` with full TypeScript declaration types.
- ⏪ **Undo / Redo & History**: Built-in state history stack for quick undo and redo actions.
- 📄 **Multi-Page & Multi-Step Forms**: Multi-step wizard navigation with progress bars, step validation, and previous/next navigation.
- 🔄 **Portable JSON Schema**: Import and export standard, normalized JSON definitions.

---

## 📦 Installation

```bash
npm install shadcn-form-builder zod react-hook-form
# or with pnpm
pnpm add shadcn-form-builder zod react-hook-form
# or with yarn
yarn add shadcn-form-builder zod react-hook-form
```

Ensure Tailwind CSS and CSS variables are set up in your application (standard shadcn/ui configuration).

---

## 🚀 Quick Start

### 1. Visual Form Builder (`<FormBuilder />`)

Embed the visual builder into your application or admin panel:

```tsx
import React, { useState } from 'react'
import { FormBuilder } from 'shadcn-form-builder'
import { FormBuilderSchema } from 'shadcn-form-builder/core'
import 'shadcn-form-builder/style.css'

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

Render saved form schemas for end-users without loading the builder interface:

```tsx
import React from 'react'
import { FormRenderer } from 'shadcn-form-builder/renderer'
import { FormBuilderSchema } from 'shadcn-form-builder/core'
import 'shadcn-form-builder/style.css'

export function UserForm({ schema }: { schema: FormBuilderSchema }) {
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

## 🏗️ Architecture & Subpath Exports

| Export Path | Content & Purpose |
| :--- | :--- |
| `shadcn-form-builder` | Main package containing the full visual builder, renderer, and core engine. |
| `shadcn-form-builder/renderer` | Lightweight runtime renderer (`<FormRenderer />`, `<FormFieldRenderer />`, `useFormEngine`). |
| `shadcn-form-builder/core` | Pure TypeScript schemas, types, condition evaluation engine, and normalization utilities. |
| `shadcn-form-builder/editor` | Visual editor components (`Canvas`, `PaletteSidebar`, `PropertiesPanel`, `useBuilderStore`). |

---

## 🧩 Supported Form Controls

- **Standard Inputs**: Text, Email, Password, Number, Phone, URL, Textarea
- **Choices**: Select Dropdown, Radio Group, Checkbox, Switch, Range Slider
- **Advanced Controls**: Date Picker, Time Picker, Table Matrix, Repeatable Rows
- **Layout & Static**: Section Headings, Paragraphs, Dividers, Action Buttons

---

## 🛠️ Development & Testing

```bash
# Start local development playground
npm run dev

# Run unit tests
npm test

# Run TypeScript typechecks
npm run lint

# Build library distribution
npm run build
```

---

## 📄 License

MIT © Draggable
