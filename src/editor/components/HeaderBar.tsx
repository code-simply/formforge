import React, { useState } from 'react'
import { useBuilderStore } from '../store/builderStore'
import { Button } from '../../ui/button'
import {
  Undo2,
  Redo2,
  Eye,
  EyeOff,
  Trash2,
  Download,
  Upload,
  Layers,
  Sparkles,
  Sun,
  Moon,
  Code2,
} from 'lucide-react'
import { JsonDialog } from './JsonDialog'
import { CodeDialog } from './CodeDialog'
import { TEMPLATES } from '../templates'

export const HeaderBar: React.FC = () => {
  const {
    schema,
    previewMode,
    setPreviewMode,
    undo,
    redo,
    history,
    future,
    clear,
    setSchema,
  } = useBuilderStore()

  const [jsonDialogOpen, setJsonDialogOpen] = useState(false)
  const [jsonDialogMode, setJsonDialogMode] = useState<'export' | 'import'>('export')
  const [codeDialogOpen, setCodeDialogOpen] = useState(false)
  const [isDark, setIsDark] = useState(false)
  const [showTemplatesMenu, setShowTemplatesMenu] = useState(false)

  const toggleTheme = () => {
    setIsDark(!isDark)
    if (!isDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  const handleSelectTemplate = (templateId: string) => {
    const tmpl = TEMPLATES.find((t) => t.id === templateId)
    if (tmpl) {
      setSchema(tmpl.schema)
      setShowTemplatesMenu(false)
    }
  }

  return (
    <header className="flex h-14 items-center justify-between border-b bg-card px-4 shrink-0">
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2 font-semibold text-primary">
          <Layers className="h-5 w-5" />
          <span className="text-sm font-bold tracking-tight">Shadcn FormBuilder</span>
        </div>
        <span className="text-muted-foreground">/</span>
        <input
          type="text"
          value={schema.title}
          onChange={(e) =>
            useBuilderStore.setState((state) => ({
              schema: { ...state.schema, title: e.target.value },
            }))
          }
          placeholder="Untitled Form"
          className="h-8 bg-transparent px-2 text-sm font-medium focus:bg-accent focus:outline-none rounded"
        />
      </div>

      <div className="flex items-center space-x-2">
        {/* Templates Selector */}
        <div className="relative">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowTemplatesMenu(!showTemplatesMenu)}
            className="text-xs"
          >
            <Sparkles className="h-3.5 w-3.5 mr-1.5 text-amber-500" />
            Templates
          </Button>

          {showTemplatesMenu && (
            <div className="absolute right-0 mt-1 w-64 rounded-md border bg-popover p-1 shadow-lg z-50 text-xs">
              <div className="px-2 py-1.5 font-semibold text-muted-foreground">
                Load Preset Template
              </div>
              {TEMPLATES.map((tmpl) => (
                <button
                  key={tmpl.id}
                  type="button"
                  onClick={() => handleSelectTemplate(tmpl.id)}
                  className="w-full text-left px-2 py-1.5 rounded hover:bg-accent transition-colors"
                >
                  <p className="font-medium text-foreground">{tmpl.title}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">
                    {tmpl.description}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="h-4 w-[1px] bg-border mx-1" />

        <Button
          variant="ghost"
          size="icon"
          onClick={undo}
          disabled={history.length === 0}
          title="Undo (Ctrl+Z)"
        >
          <Undo2 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={redo}
          disabled={future.length === 0}
          title="Redo (Ctrl+Y)"
        >
          <Redo2 className="h-4 w-4" />
        </Button>

        <div className="h-4 w-[1px] bg-border mx-1" />

        <Button
          variant="outline"
          size="sm"
          onClick={() => setCodeDialogOpen(true)}
          className="text-xs"
        >
          <Code2 className="h-3.5 w-3.5 mr-1.5 text-primary" />
          Get Code
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setJsonDialogMode('export')
            setJsonDialogOpen(true)
          }}
          className="text-xs"
        >
          <Download className="h-3.5 w-3.5 mr-1.5" />
          JSON
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setJsonDialogMode('import')
            setJsonDialogOpen(true)
          }}
          className="text-xs"
        >
          <Upload className="h-3.5 w-3.5 mr-1.5" />
          Import
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            if (confirm('Are you sure you want to clear the entire form?')) {
              clear()
            }
          }}
          className="text-destructive hover:bg-destructive/10 text-xs"
        >
          <Trash2 className="h-3.5 w-3.5 mr-1" />
          Clear
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>

        <div className="h-4 w-[1px] bg-border mx-1" />

        <Button
          variant={previewMode ? 'secondary' : 'default'}
          size="sm"
          onClick={() => setPreviewMode(!previewMode)}
        >
          {previewMode ? (
            <>
              <EyeOff className="h-4 w-4 mr-1.5" />
              Exit Preview
            </>
          ) : (
            <>
              <Eye className="h-4 w-4 mr-1.5" />
              Preview Form
            </>
          )}
        </Button>
      </div>

      <JsonDialog
        isOpen={jsonDialogOpen}
        onClose={() => setJsonDialogOpen(false)}
        mode={jsonDialogMode}
        schema={schema}
        onImport={(imported) => {
          setSchema(imported)
          setJsonDialogOpen(false)
        }}
      />

      <CodeDialog
        isOpen={codeDialogOpen}
        onClose={() => setCodeDialogOpen(false)}
        schema={schema}
      />
    </header>
  )
}
