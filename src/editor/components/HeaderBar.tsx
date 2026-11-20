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
    <header className="flex h-14 items-center justify-between border-b bg-card px-3 sm:px-4 shrink-0 select-none">
      {/* Title & Brand */}
      <div className="flex items-center space-x-2 sm:space-x-3 overflow-hidden">
        <div className="flex items-center space-x-2 font-bold text-foreground shrink-0">
          <Layers className="h-4 w-4 sm:h-5 sm:w-5" />
          <span className="text-xs sm:text-sm font-semibold tracking-tight hidden sm:inline">
            FormBuilder
          </span>
        </div>
        <span className="text-muted-foreground/60 hidden sm:inline">/</span>
        <input
          type="text"
          value={schema.title}
          onChange={(e) =>
            useBuilderStore.setState((state) => ({
              schema: { ...state.schema, title: e.target.value },
            }))
          }
          placeholder="Untitled Form"
          className="h-8 max-w-[130px] sm:max-w-[200px] md:max-w-xs bg-transparent px-2 text-xs sm:text-sm font-medium focus:bg-accent focus:outline-none rounded truncate"
        />
      </div>

      {/* Action Controls */}
      <div className="flex items-center space-x-1 sm:space-x-1.5 shrink-0">
        {/* Templates Selector */}
        <div className="relative">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowTemplatesMenu(!showTemplatesMenu)}
            className="h-8 px-2 sm:px-3 text-xs"
            title="Load Preset Template"
          >
            <Sparkles className="h-3.5 w-3.5 sm:mr-1.5" />
            <span className="hidden md:inline">Templates</span>
          </Button>

          {showTemplatesMenu && (
            <div className="absolute right-0 mt-1 w-64 rounded-lg border bg-popover p-1 shadow-xl z-50 text-xs">
              <div className="px-2 py-1.5 font-semibold text-muted-foreground border-b mb-1">
                Preset Templates
              </div>
              {TEMPLATES.map((tmpl) => (
                <button
                  key={tmpl.id}
                  type="button"
                  onClick={() => handleSelectTemplate(tmpl.id)}
                  className="w-full text-left px-2 py-1.5 rounded-md hover:bg-accent transition-colors"
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

        {/* Undo / Redo */}
        <div className="hidden sm:flex items-center space-x-0.5">
          <Button
            variant="ghost"
            size="icon"
            onClick={undo}
            disabled={history.length === 0}
            className="h-8 w-8"
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={redo}
            disabled={future.length === 0}
            className="h-8 w-8"
            title="Redo (Ctrl+Y)"
          >
            <Redo2 className="h-3.5 w-3.5" />
          </Button>
        </div>

        <div className="h-4 w-[1px] bg-border mx-0.5 sm:mx-1" />

        {/* Code Generator Modal */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCodeDialogOpen(true)}
          className="h-8 px-2 sm:px-3 text-xs"
          title="Get React & Zod Code"
        >
          <Code2 className="h-3.5 w-3.5 sm:mr-1.5" />
          <span className="hidden sm:inline">Code</span>
        </Button>

        {/* Export JSON */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setJsonDialogMode('export')
            setJsonDialogOpen(true)
          }}
          className="h-8 px-2 sm:px-2.5 text-xs"
          title="Export JSON Schema"
        >
          <Download className="h-3.5 w-3.5 sm:mr-1" />
          <span className="hidden md:inline">JSON</span>
        </Button>

        {/* Import JSON */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setJsonDialogMode('import')
            setJsonDialogOpen(true)
          }}
          className="h-8 px-2 sm:px-2.5 text-xs"
          title="Import JSON Schema"
        >
          <Upload className="h-3.5 w-3.5 sm:mr-1" />
          <span className="hidden md:inline">Import</span>
        </Button>

        {/* Clear Form */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            if (confirm('Are you sure you want to clear the entire form?')) {
              clear()
            }
          }}
          className="h-8 w-8 text-muted-foreground hover:text-destructive"
          title="Clear Form"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>

        {/* Dark/Light Mode Switcher */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="h-8 w-8 text-foreground"
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>

        <div className="h-4 w-[1px] bg-border mx-0.5 sm:mx-1" />

        {/* Preview Mode Toggle */}
        <Button
          variant={previewMode ? 'secondary' : 'default'}
          size="sm"
          onClick={() => setPreviewMode(!previewMode)}
          className="h-8 px-2.5 sm:px-3 text-xs font-medium"
        >
          {previewMode ? (
            <>
              <EyeOff className="h-3.5 w-3.5 sm:mr-1.5" />
              <span className="hidden sm:inline">Exit Preview</span>
            </>
          ) : (
            <>
              <Eye className="h-3.5 w-3.5 sm:mr-1.5" />
              <span className="hidden sm:inline">Preview</span>
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
