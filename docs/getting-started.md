# Getting Started with `shadcn-form-builder`

`shadcn-form-builder` is an enterprise-grade form builder and runtime renderer built on **shadcn/ui**, **Tailwind CSS**, **React Hook Form**, and **Zod**.

---

## 1. Installation

Install the package alongside its peer dependencies:

```bash
npm install shadcn-form-builder react-hook-form zod
# or with pnpm
pnpm add shadcn-form-builder react-hook-form zod
# or with yarn
yarn add shadcn-form-builder react-hook-form zod
```

---

## 2. Setting Up Tailwind CSS & Design Tokens

Ensure your `tailwind.config.js` and CSS variables are configured (standard shadcn/ui setup):

```css
/* in your global styles.css or layout.tsx */
@import 'shadcn-form-builder/style.css';
```

---

## 3. Using the Visual Form Builder

Embed the visual builder into any page or admin dashboard:

```tsx
import React, { useState } from 'react'
import { FormBuilder } from 'shadcn-form-builder'
import { FormBuilderSchema } from 'shadcn-form-builder/core'
import 'shadcn-form-builder/style.css'

export function AdminFormEditor() {
  const [schema, setSchema] = useState<FormBuilderSchema>()

  return (
    <div className="h-screen w-full">
      <FormBuilder
        initialSchema={schema}
        onChange={(newSchema) => {
          setSchema(newSchema)
          // Autosave to your backend:
          // saveFormToApi(newSchema)
        }}
      />
    </div>
  )
}
```

---

## 4. Using the Lightweight Form Renderer

Render forms for end-users without loading the drag-and-drop builder overhead:

```tsx
import React from 'react'
import { FormRenderer } from 'shadcn-form-builder/renderer'
import { FormBuilderSchema } from 'shadcn-form-builder/core'
import 'shadcn-form-builder/style.css'

export function UserSurveyPage({ schema }: { schema: FormBuilderSchema }) {
  const handleSubmit = (values: Record<string, unknown>) => {
    console.log('Submitted values:', values)
    // Send to your backend API
  }

  return (
    <div className="max-w-xl mx-auto py-12">
      <FormRenderer
        schema={schema}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
```
