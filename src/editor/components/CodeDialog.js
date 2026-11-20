import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, } from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { Textarea } from '../../ui/textarea';
import { Copy, Check, Code2 } from 'lucide-react';
export const CodeDialog = ({ isOpen, onClose, schema, }) => {
    const [activeTab, setActiveTab] = useState('react');
    const [copied, setCopied] = useState(false);
    const schemaJson = JSON.stringify(schema, null, 2);
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
`;
    const zodCode = `import { z } from 'zod'

// Inferred validation schema for "${schema.title}"
export const ${schema.title.replace(/[^a-zA-Z0-9]/g, '') || 'Custom'}FormSchema = z.object({
${Object.values(schema.fields)
        .filter((f) => !['heading', 'paragraph', 'separator', 'button'].includes(f.type))
        .map((f) => {
        const key = f.name || f.id;
        let typeStr = 'z.string()';
        if (f.type === 'number')
            typeStr = 'z.coerce.number()';
        else if (f.type === 'email')
            typeStr = 'z.string().email()';
        else if (f.type === 'url')
            typeStr = 'z.string().url()';
        else if (f.type === 'checkbox' || f.type === 'switch')
            typeStr = 'z.boolean()';
        else if (f.type === 'multi-select' || f.type === 'checkbox-group')
            typeStr = 'z.array(z.string())';
        if (f.required) {
            if (typeStr === 'z.string()')
                typeStr += '.min(1, { message: "Required" })';
        }
        else {
            typeStr += '.optional()';
        }
        return `  ${JSON.stringify(key)}: ${typeStr},`;
    })
        .join('\n')}
})

export type FormValues = z.infer<typeof ${schema.title.replace(/[^a-zA-Z0-9]/g, '') || 'Custom'}FormSchema>
`;
    const activeCode = activeTab === 'react' ? reactCode : zodCode;
    const handleCopy = () => {
        navigator.clipboard.writeText(activeCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    return (_jsx(Dialog, { open: isOpen, onOpenChange: (open) => !open && onClose(), children: _jsxs(DialogContent, { className: "max-w-3xl", children: [_jsxs(DialogHeader, { children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Code2, { className: "h-5 w-5 text-primary" }), _jsx(DialogTitle, { children: "Export Code" })] }), _jsx(DialogDescription, { children: "Copy and paste this production-ready code directly into your Next.js, Vite, or React application." })] }), _jsxs(Tabs, { value: activeTab, onValueChange: (v) => setActiveTab(v), className: "w-full pt-2", children: [_jsxs("div", { className: "flex items-center justify-between pb-2", children: [_jsxs(TabsList, { children: [_jsx(TabsTrigger, { value: "react", children: "React Component" }), _jsx(TabsTrigger, { value: "zod", children: "Zod Schema" })] }), _jsx(Button, { variant: "outline", size: "sm", onClick: handleCopy, children: copied ? (_jsxs(_Fragment, { children: [_jsx(Check, { className: "h-4 w-4 mr-1 text-green-600" }), "Copied!"] })) : (_jsxs(_Fragment, { children: [_jsx(Copy, { className: "h-4 w-4 mr-1" }), "Copy Code"] })) })] }), _jsx(TabsContent, { value: "react", className: "mt-0", children: _jsx(Textarea, { readOnly: true, value: reactCode, rows: 15, className: "font-mono text-xs bg-muted/40" }) }), _jsx(TabsContent, { value: "zod", className: "mt-0", children: _jsx(Textarea, { readOnly: true, value: zodCode, rows: 15, className: "font-mono text-xs bg-muted/40" }) })] })] }) }));
};
