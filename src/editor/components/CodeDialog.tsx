import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../../ui/dialog'
import { Button } from '../../ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs'
import { Textarea } from '../../ui/textarea'
import { FormBuilderSchema } from '../../core/types'
import { Copy, Check, Code2, Globe, Server, FileCode2 } from 'lucide-react'

export interface CodeDialogProps {
  isOpen: boolean
  onClose: () => void
  schema: FormBuilderSchema
}

export const CodeDialog: React.FC<CodeDialogProps> = ({
  isOpen,
  onClose,
  schema,
}) => {
  const [activeTab, setActiveTab] = useState<'react' | 'embed' | 'server' | 'zod'>('react')
  const [copied, setCopied] = useState(false)

  const schemaJson = JSON.stringify(schema, null, 2)
  const schemaVarName = schema.title.replace(/[^a-zA-Z0-9]/g, '') || 'Custom'

  const reactCode = `import React from 'react'
import { FormRenderer } from 'shadcn-form-builder/renderer'
import { FormBuilderSchema } from 'shadcn-form-builder/core'
import 'shadcn-form-builder/style.css'

// Form schema definition
const formSchema: FormBuilderSchema = ${schemaJson}

export function GeneratedForm() {
  const handleSubmit = (values: Record<string, unknown>) => {
    console.log('Form submitted successfully:', values)
    // Send to backend API:
    // await fetch('/api/submit', { method: 'POST', body: JSON.stringify(values) })
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-4 sm:p-6">
      <FormRenderer
        schema={formSchema}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
`

  const embedCode = `<!-- FormBuilder Responsive Embed Widget -->
<!-- Paste this snippet into Webflow, WordPress, Shopify, or any HTML webpage -->
<div id="form-embed-wrapper" style="width: 100%; max-width: 800px; margin: 0 auto; padding: 16px 0;">
  <iframe
    id="form-iframe-${schema.id}"
    src="https://forms.yourdomain.com/f/${schema.id}?embed=true"
    width="100%"
    height="700"
    frameborder="0"
    scrolling="auto"
    allow="clipboard-write"
    style="border: 1px solid rgba(0,0,0,0.1); border-radius: 12px; box-shadow: 0 4px 20px -2px rgba(0,0,0,0.06); background: #ffffff;"
    title="${schema.title}"
  ></iframe>
</div>

<!-- Optional auto-resizing script for dynamic step heights -->
<script>
  window.addEventListener('message', function(event) {
    if (event.data && event.data.type === 'formbuilder-resize') {
      var iframe = document.getElementById('form-iframe-${schema.id}');
      if (iframe && event.data.height) {
        iframe.style.height = event.data.height + 'px';
      }
    }
  });
</script>
`

  const serverActionCode = `// app/actions/submitForm.ts (Next.js Server Action)
'use server'

import { z } from 'zod'
import { ${schemaVarName}FormSchema } from '@/lib/schemas'

export async function handleFormSubmission(prevState: any, formData: FormData) {
  const rawValues = Object.fromEntries(formData.entries())
  
  // Validate against generated Zod schema
  const result = ${schemaVarName}FormSchema.safeParse(rawValues)
  
  if (!result.success) {
    return {
      success: false,
      errors: result.error.flatten().fieldErrors,
    }
  }

  // Secure server-side processing (e.g. database insert, CRM webhook, email alert)
  console.log('Validated payload:', result.data)

  return {
    success: true,
    submissionId: 'sub_' + Date.now(),
    message: 'Form submitted and verified successfully.',
  }
}
`

  const zodCode = `import { z } from 'zod'

// Inferred validation schema for "${schema.title}"
export const ${schemaVarName}FormSchema = z.object({
${Object.values(schema.fields)
  .filter((f) => !['heading', 'paragraph', 'separator', 'button', 'logo', 'image', 'avatar'].includes(f.type))
  .map((f) => {
    const key = f.name || f.id
    let typeStr = 'z.string()'
    if (f.type === 'number') typeStr = 'z.coerce.number()'
    else if (f.type === 'email') typeStr = 'z.string().email()'
    else if (f.type === 'url') typeStr = 'z.string().url()'
    else if (f.type === 'checkbox' || f.type === 'switch') typeStr = 'z.boolean()'
    else if (f.type === 'multi-select' || f.type === 'checkbox-group') typeStr = 'z.array(z.string())'

    if (f.required) {
      if (typeStr === 'z.string()') typeStr += '.min(1, { message: "Required" })'
    } else {
      typeStr += '.optional()'
    }

    return `  ${JSON.stringify(key)}: ${typeStr},`
  })
  .join('\n')}
})

export type FormValues = z.infer<typeof ${schemaVarName}FormSchema>
`

  const codeMap = {
    react: reactCode,
    embed: embedCode,
    server: serverActionCode,
    zod: zodCode,
  }

  const activeCode = codeMap[activeTab]

  const handleCopy = () => {
    navigator.clipboard.writeText(activeCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <div className="flex items-center space-x-2">
            <Code2 className="h-5 w-5 text-foreground" />
            <DialogTitle>Export Code & Embed Snippets</DialogTitle>
          </div>
          <DialogDescription>
            Integrate this form into React apps, embed into any website, or use Next.js server actions.
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={(v: any) => setActiveTab(v)}
          className="w-full pt-2"
        >
          <div className="flex items-center justify-between pb-2">
            <TabsList className="grid grid-cols-4">
              <TabsTrigger value="react" className="text-xs flex items-center gap-1">
                <FileCode2 className="h-3.5 w-3.5" />
                <span>React</span>
              </TabsTrigger>
              <TabsTrigger value="embed" className="text-xs flex items-center gap-1">
                <Globe className="h-3.5 w-3.5" />
                <span>Embed iFrame</span>
              </TabsTrigger>
              <TabsTrigger value="server" className="text-xs flex items-center gap-1">
                <Server className="h-3.5 w-3.5" />
                <span>Server Action</span>
              </TabsTrigger>
              <TabsTrigger value="zod" className="text-xs flex items-center gap-1">
                <Code2 className="h-3.5 w-3.5" />
                <span>Zod Schema</span>
              </TabsTrigger>
            </TabsList>

            <Button variant="outline" size="sm" onClick={handleCopy} className="h-8 text-xs">
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 mr-1 text-emerald-500" />
                  Copied Snippet
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5 mr-1" />
                  Copy Snippet
                </>
              )}
            </Button>
          </div>

          <TabsContent value="react" className="mt-0">
            <Textarea
              readOnly
              value={reactCode}
              rows={15}
              className="font-mono text-xs bg-muted/40 text-foreground"
            />
          </TabsContent>

          <TabsContent value="embed" className="mt-0">
            <Textarea
              readOnly
              value={embedCode}
              rows={15}
              className="font-mono text-xs bg-muted/40 text-foreground"
            />
          </TabsContent>

          <TabsContent value="server" className="mt-0">
            <Textarea
              readOnly
              value={serverActionCode}
              rows={15}
              className="font-mono text-xs bg-muted/40 text-foreground"
            />
          </TabsContent>

          <TabsContent value="zod" className="mt-0">
            <Textarea
              readOnly
              value={zodCode}
              rows={15}
              className="font-mono text-xs bg-muted/40 text-foreground"
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
