import { FormBuilderSchema } from '../core/types'
import { TEMPLATES } from './templates'

export interface CookbookRecipe {
  id: string
  title: string
  category: 'recipes' | 'docs' | 'integrations'
  tags: string[]
  badge: string
  description: string
  schema?: FormBuilderSchema
  reactCode?: string
  nextjsCode?: string
  markdownContent?: string
}

export const COOKBOOK_ITEMS: CookbookRecipe[] = [
  // --- CORE DOCS ---
  {
    id: 'doc-overview',
    title: 'Overview & Architecture',
    category: 'docs',
    badge: 'Guide',
    tags: ['Architecture', 'Core', 'Concepts'],
    description: 'Learn the core philosophy, 4-tier layout model, and modular architecture of ShadForm.',
    markdownContent: `
### ShadForm Architecture Overview

ShadForm is built from the ground up on modern React, TypeScript, Tailwind CSS, and Zod. It divides form operations into two independent runtimes:

1. **The Visual Studio Editor (\`<FormBuilder />\`)**:
   - High-performance drag-and-drop canvas powered by \`@dnd-kit\`.
   - Floating row and column toolbars with instant alignment presets.
   - Comprehensive property inspector with dynamic field validations.
   - In-app Submissions Manager and Webhook Dispatch Inspector.

2. **The Zero-Baggage Runtime Renderer (\`<FormRenderer />\`)**:
   - Zero builder dependencies; ultra-lightweight bundle (~23KB gzip).
   - Dynamic runtime Zod schema generation and validation.
   - Reactive conditional logic (show/hide, require, enable/disable).
   - Multi-step wizard branching and path traversal.

#### The 4-Tier Layout Hierarchy
\`\`\`
Pages (Multi-Step Funnel)
  └── Rows (Flexbox alignment & spacing)
        └── Columns (1-12 responsive grid, sub-columns, container queries)
              └── Fields (Text, Select, Choices, Static Media, Custom Controls)
\`\`\`
`,
  },
  {
    id: 'doc-quickstart',
    title: 'Quick Start & Installation',
    category: 'docs',
    badge: 'Setup',
    tags: ['Install', 'npm', 'Setup'],
    description: 'Install ShadForm into your Next.js, Vite, or React application in 30 seconds.',
    markdownContent: `
### Installation

Install \`shadform\` along with its peer dependencies:

\`\`\`bash
npm install shadform zod react-hook-form
# or with pnpm
pnpm add shadform zod react-hook-form
# or with yarn
yarn add shadform zod react-hook-form
\`\`\`

### Styles Setup

Ensure Tailwind CSS is enabled in your project, then import the compiled stylesheet in your application root (\`App.tsx\` or \`layout.tsx\`):

\`\`\`tsx
import 'shadform/style.css'
\`\`\`

### Standalone Subpath Exports

ShadForm provides clean, tree-shakeable entrypoints for optimal bundle size:

- \`shadform\`: Full visual builder studio + editor components.
- \`shadform/renderer\`: Lightweight consumer form renderer (\`<FormRenderer />\`).
- \`shadform/core\`: Pure TypeScript schemas, types, Zod generators, and webhook normalizers.
`,
  },
  {
    id: 'doc-builder-api',
    title: '<FormBuilder /> API Reference',
    category: 'docs',
    badge: 'API',
    tags: ['Builder', 'Props', 'Editor'],
    description: 'Complete props, events, and configuration options for the visual builder component.',
    markdownContent: `
### \`<FormBuilder />\` Component Props

\`\`\`tsx
import { FormBuilder } from 'shadform'
import { FormBuilderSchema } from 'shadform/core'

export interface FormBuilderProps {
  // Initial schema to load into the builder canvas
  initialSchema?: FormBuilderSchema
  
  // Callback invoked whenever schema state changes
  onChange?: (schema: FormBuilderSchema) => void
  
  // Container styling
  className?: string
}
\`\`\`

#### Example Usage

\`\`\`tsx
import React, { useState } from 'react'
import { FormBuilder } from 'shadform'
import { FormBuilderSchema } from 'shadform/core'
import 'shadform/style.css'

export function AdminFormEditor() {
  const [schema, setSchema] = useState<FormBuilderSchema>()

  const handleSaveToDatabase = async () => {
    await fetch('/api/forms/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(schema),
    })
  }

  return (
    <div className="h-screen w-full">
      <FormBuilder
        initialSchema={schema}
        onChange={setSchema}
      />
    </div>
  )
}
\`\`\`
`,
  },
  {
    id: 'doc-renderer-api',
    title: '<FormRenderer /> API Reference',
    category: 'docs',
    badge: 'API',
    tags: ['Renderer', 'Props', 'Runtime'],
    description: 'Render forms for end-users with automatic Zod validation and conditional logic.',
    markdownContent: `
### \`<FormRenderer />\` Component Props

\`\`\`tsx
import { FormRenderer } from 'shadform/renderer'
import { FormBuilderSchema } from 'shadform/core'

export interface FormRendererProps {
  // The normalized form definition to render
  schema: FormBuilderSchema

  // Initial field values (optional)
  initialValues?: Record<string, unknown>

  // Callback on successful validation and submission
  onSubmit: (values: Record<string, unknown>) => void | Promise<void>

  // Optional live value change observer
  onChange?: (values: Record<string, unknown>) => void

  // Read-only inspection mode
  readOnly?: boolean

  // Custom container class
  className?: string
}
\`\`\`

#### Example Usage

\`\`\`tsx
import React from 'react'
import { FormRenderer } from 'shadform/renderer'
import { FormBuilderSchema } from 'shadform/core'
import 'shadform/style.css'

export function PublicContactForm({ schema }: { schema: FormBuilderSchema }) {
  const handleSubmit = async (values: Record<string, unknown>) => {
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    })
    if (res.ok) alert('Thank you! Your message has been sent.')
  }

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <FormRenderer
        schema={schema}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
\`\`\`
`,
  },

  // --- INTERACTIVE RECIPES ---
  {
    id: 'recipe-saas-onboarding',
    title: 'Multi-Step SaaS Onboarding (with Branching)',
    category: 'recipes',
    badge: 'Wizard',
    tags: ['Multi-Step', 'Conditional Branching', 'SaaS'],
    description: 'A dynamic 3-step setup funnel that branches to custom questions based on Starter vs Enterprise tier selection.',
    schema: TEMPLATES[0].schema,
    reactCode: `import React from 'react'
import { FormRenderer } from 'shadform/renderer'
import 'shadform/style.css'

export function SaaSOnboardingPage({ schema }) {
  return (
    <div className="max-w-3xl mx-auto py-10">
      <FormRenderer
        schema={schema}
        onSubmit={(values) => console.log('Onboarding complete:', values)}
      />
    </div>
  )
}`,
    nextjsCode: `// app/onboarding/page.tsx
'use client'

import { FormRenderer } from 'shadform/renderer'
import 'shadform/style.css'

export default function OnboardingPage() {
  const handleSubmit = async (values) => {
    'use server'
    // Server action ingestion logic
  }

  return (
    <main className="min-h-screen py-12 bg-muted/20">
      <FormRenderer schema={schema} onSubmit={handleSubmit} />
    </main>
  )
}`,
  },
  {
    id: 'recipe-event-registration',
    title: 'Modern Event Registration (Nested 50:50 & 33:33:33)',
    category: 'recipes',
    badge: 'Layout',
    tags: ['Grid', 'Nested Rows', 'Media', 'Webhooks'],
    description: 'Showcases responsive 2-column personal details, 3-column emergency contacts, host avatar branding, and banner.',
    schema: TEMPLATES[1].schema,
    reactCode: `import React from 'react'
import { FormRenderer } from 'shadform/renderer'
import 'shadform/style.css'

export function EventRegistrationForm({ schema }) {
  return (
    <div className="max-w-3xl mx-auto py-10">
      <FormRenderer
        schema={schema}
        onSubmit={(values) => alert('Registration confirmed!')}
      />
    </div>
  )
}`,
    nextjsCode: `// app/events/register/page.tsx
import { FormRenderer } from 'shadform/renderer'
import 'shadform/style.css'

export default function EventPage() {
  return (
    <div className="max-w-3xl mx-auto py-8">
      <FormRenderer schema={schema} onSubmit={async (v) => console.log(v)} />
    </div>
  )
}`,
  },
  {
    id: 'recipe-customer-feedback',
    title: 'Customer CSAT & Matrix Evaluation',
    category: 'recipes',
    badge: 'Survey',
    tags: ['Table Matrix', 'Slider', 'Rating', 'Conditional'],
    description: 'Features a table matrix evaluation grid, Net Promoter Score (NPS) slider, star ratings, and conditional follow-up checkboxes.',
    schema: TEMPLATES[2].schema,
    reactCode: `import React from 'react'
import { FormRenderer } from 'shadform/renderer'
import 'shadform/style.css'

export function FeedbackSurvey({ schema }) {
  return (
    <div className="max-w-2xl mx-auto py-10">
      <FormRenderer
        schema={schema}
        onSubmit={(values) => console.log('Feedback submitted:', values)}
      />
    </div>
  )
}`,
    nextjsCode: `// app/feedback/page.tsx
import { FormRenderer } from 'shadform/renderer'
import 'shadform/style.css'

export default function FeedbackPage() {
  return (
    <div className="max-w-2xl mx-auto py-8">
      <FormRenderer schema={schema} onSubmit={async (v) => console.log(v)} />
    </div>
  )
}`,
  },

  // --- INTEGRATION GUIDES ---
  {
    id: 'integration-server-actions',
    title: 'Next.js 14/15 Server Actions Integration',
    category: 'integrations',
    badge: 'Next.js',
    tags: ['Next.js', 'Server Actions', 'Zod', 'Database'],
    description: 'Safely validate and ingest form submissions directly on the server with Next.js Server Actions.',
    markdownContent: `
### Next.js Server Actions Integration

Combine ShadForm with Next.js Server Actions for full-stack, zero-API-boilerplate form processing.

\`\`\`typescript
// app/actions/submitForm.ts
'use server'

import { buildDynamicZodSchema } from 'shadform/core'

export async function submitFormAction(schema: any, rawData: Record<string, unknown>) {
  // 1. Generate runtime Zod schema
  const zodSchema = buildDynamicZodSchema(schema)

  // 2. Validate input on the server
  const result = zodSchema.safeParse(rawData)
  if (!result.success) {
    return { success: false, errors: result.error.format() }
  }

  // 3. Persist validated data to database (Prisma, Drizzle, Supabase)
  console.log('Server verified payload:', result.data)

  return { success: true }
}
\`\`\`

\`\`\`tsx
// app/contact/page.tsx
'use client'

import React from 'react'
import { FormRenderer } from 'shadform/renderer'
import { submitFormAction } from '../actions/submitForm'
import 'shadform/style.css'

export default function ContactPage({ schema }: { schema: any }) {
  const handleClientSubmit = async (values: Record<string, unknown>) => {
    const res = await submitFormAction(schema, values)
    if (res.success) {
      alert('Form successfully submitted!')
    }
  }

  return (
    <div className="max-w-xl mx-auto py-10">
      <FormRenderer schema={schema} onSubmit={handleClientSubmit} />
    </div>
  )
}
\`\`\`
`,
  },
  {
    id: 'integration-iframe-embed',
    title: 'iFrame Embed with Auto-Resize',
    category: 'integrations',
    badge: 'Embed',
    tags: ['iFrame', 'Embed', 'Cross-Origin', 'Resize'],
    description: 'Embed your form seamlessly into WordPress, Webflow, Shopify, or external sites with postMessage height synchronization.',
    markdownContent: `
### Cross-Origin iFrame Embed with Auto-Resize

ShadForm automatically broadcasts height change events via \`window.postMessage\`. Use this snippet on any parent website (Webflow, WordPress, Squarespace) to eliminate ugly iframe scrollbars:

\`\`\`html
<iframe 
  id="shadform-embed" 
  src="https://your-domain.com/embed/my-form" 
  style="width: 100%; border: none; overflow: hidden; min-height: 400px; transition: height 0.2s ease;"
  scrolling="no"
></iframe>

<script>
  window.addEventListener('message', function(event) {
    if (event.data && event.data.type === 'SHADFORM_RESIZE') {
      var iframe = document.getElementById('shadform-embed');
      if (iframe && event.data.height) {
        iframe.style.height = event.data.height + 'px';
      }
    }
  });
</script>
\`\`\`
`,
  },
  {
    id: 'integration-webhooks-discord',
    title: 'Webhook Pipelines (Discord, Slack, Zapier)',
    category: 'integrations',
    badge: 'Webhook',
    tags: ['Discord', 'Slack', 'Zapier', 'Pipelines'],
    description: 'Post submissions directly to Discord or Slack channels and trigger complex Zapier/n8n automations.',
    markdownContent: `
### Webhook Pipelines: Discord & Slack Direct Alerting

You can configure ShadForm to post directly into your team's Slack or Discord channel without writing any backend code:

#### Discord Webhook Configuration
1. In Discord: Channel Settings $\\to$ Integrations $\\to$ Webhooks $\\to$ Create Webhook $\\to$ Copy Webhook URL.
2. In ShadForm Studio: Click **Webhook** in the header.
   - **URL**: Paste Discord Webhook URL.
   - **Method**: \`POST\`
   - **Key Remapping**: Map your primary feedback or message field ID to \`content\`.
   - **Static Payload**:
     \`\`\`json
     {
       "username": "ShadForm Notifier"
     }
     \`\`\`
3. Click **Send Test Payload** to verify in real-time!
`,
  },
]
