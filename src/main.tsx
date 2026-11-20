import React, { useState } from 'react'
import ReactDOM from 'react-dom/client'
import { FormBuilder } from './editor/FormBuilder'
import { FormRenderer } from './renderer/FormRenderer'
import { useBuilderStore } from './editor/store/builderStore'
import { TEMPLATES } from './editor/templates'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import {
  Layers,
  Columns2,
  Eye,
  Sparkles,
  Sun,
  Moon,
  CheckCircle2,
} from 'lucide-react'
import './styles/index.css'

function StudioApp() {
  const { schema, setSchema } = useBuilderStore()
  const [viewMode, setViewMode] = useState<'builder' | 'split' | 'preview' | 'code'>('builder')
  const [isDark, setIsDark] = useState(false)
  const [submittedPayload, setSubmittedPayload] = useState<{
    timestamp: string
    data: Record<string, unknown>
  } | null>(null)

  const toggleTheme = () => {
    setIsDark(!isDark)
    if (!isDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  const totalFields = Object.keys(schema.fields).length
  const totalPages = schema.pageOrder.length

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-background">
      {/* Studio Navigation Bar */}
      <nav className="h-13 border-b bg-card px-4 flex items-center justify-between shrink-0 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 font-bold text-primary">
            <Layers className="h-5 w-5" />
            <span className="text-sm tracking-tight font-extrabold">Shadcn FormBuilder Studio</span>
          </div>

          <div className="flex items-center space-x-1.5 pl-2">
            <Badge variant="outline" className="text-[11px] font-mono font-normal">
              {totalPages} {totalPages === 1 ? 'Page' : 'Pages'}
            </Badge>
            <Badge variant="secondary" className="text-[11px] font-mono font-normal">
              {totalFields} {totalFields === 1 ? 'Field' : 'Fields'}
            </Badge>
          </div>
        </div>

        {/* View Switcher Controls */}
        <div className="flex items-center space-x-1 bg-muted p-1 rounded-lg">
          <button
            type="button"
            onClick={() => setViewMode('builder')}
            className={`px-3 py-1 text-xs rounded-md font-medium transition-all flex items-center space-x-1.5 ${
              viewMode === 'builder'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>Builder</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('split')}
            className={`px-3 py-1 text-xs rounded-md font-medium transition-all flex items-center space-x-1.5 ${
              viewMode === 'split'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Columns2 className="h-3.5 w-3.5" />
            <span>Split View</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('preview')}
            className={`px-3 py-1 text-xs rounded-md font-medium transition-all flex items-center space-x-1.5 ${
              viewMode === 'preview'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Eye className="h-3.5 w-3.5" />
            <span>Live Form</span>
          </button>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center space-x-2">
          {/* Quick Template Picker */}
          <div className="flex items-center space-x-1">
            <span className="text-[11px] text-muted-foreground mr-1 hidden sm:inline">Templates:</span>
            {TEMPLATES.map((tmpl) => (
              <Button
                key={tmpl.id}
                variant="outline"
                size="sm"
                onClick={() => setSchema(tmpl.schema)}
                className="h-7 text-[11px] px-2.5"
              >
                <Sparkles className="h-3 w-3 mr-1 text-amber-500" />
                {tmpl.title.split(' ')[0]}
              </Button>
            ))}
          </div>

          <div className="h-4 w-[1px] bg-border mx-1" />

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="h-8 w-8"
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4 text-slate-700" />}
          </Button>
        </div>
      </nav>

      {/* Main Studio Viewport */}
      <div className="flex-1 overflow-hidden">
        {viewMode === 'builder' && <FormBuilder />}

        {viewMode === 'split' && (
          <div className="flex h-full w-full overflow-hidden">
            {/* Left: Form Builder */}
            <div className="w-1/2 border-r h-full overflow-hidden">
              <FormBuilder />
            </div>

            {/* Right: Live Interactive Renderer */}
            <div className="w-1/2 h-full overflow-y-auto bg-muted/40 p-6 flex flex-col items-center space-y-6">
              <div className="w-full max-w-xl">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold tracking-tight text-foreground flex items-center">
                    <Eye className="h-4 w-4 mr-1.5 text-primary" />
                    Live Consumer Form Preview
                  </h3>
                  <Badge variant="outline" className="text-[10px] bg-background">
                    Updates in real-time
                  </Badge>
                </div>

                <FormRenderer
                  schema={schema}
                  onSubmit={(values) => {
                    setSubmittedPayload({
                      timestamp: new Date().toLocaleTimeString(),
                      data: values,
                    })
                  }}
                />

                {submittedPayload && (
                  <div className="mt-4 p-4 rounded-lg border bg-card shadow-sm space-y-2 animate-in fade-in-50">
                    <div className="flex items-center space-x-1.5 text-xs font-semibold text-green-600 dark:text-green-400">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Form Submitted at {submittedPayload.timestamp}</span>
                    </div>
                    <pre className="p-2.5 rounded bg-muted/60 font-mono text-xs overflow-x-auto text-foreground">
                      {JSON.stringify(submittedPayload.data, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {viewMode === 'preview' && (
          <div className="h-full overflow-y-auto bg-muted/40 p-8 flex justify-center">
            <div className="w-full max-w-2xl space-y-4">
              <FormRenderer
                schema={schema}
                onSubmit={(values) => {
                  setSubmittedPayload({
                    timestamp: new Date().toLocaleTimeString(),
                    data: values,
                  })
                }}
              />

              {submittedPayload && (
                <div className="p-4 rounded-lg border bg-card shadow-sm space-y-2">
                  <div className="flex items-center space-x-1.5 text-xs font-semibold text-green-600">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Submitted Payload ({submittedPayload.timestamp}):</span>
                  </div>
                  <pre className="p-3 rounded bg-muted font-mono text-xs overflow-x-auto">
                    {JSON.stringify(submittedPayload.data, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <StudioApp />
  </React.StrictMode>
)
