import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../../ui/dialog'
import { Button } from '../../ui/button'
import { Input } from '../../ui/input'
import { Badge } from '../../ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs'
import { FormRenderer } from '../../renderer/FormRenderer'
import { COOKBOOK_ITEMS } from '../cookbookData'
import { FormBuilderSchema } from '../../core/types'
import {
  BookOpen,
  Search,
  Sparkles,
  Copy,
  Check,
  CheckCircle2,
  Code2,
  Eye,
  FileCode,
  Layers,
} from 'lucide-react'

export interface CookbookDialogProps {
  isOpen: boolean
  onClose: () => void
  onLoadSchema?: (schema: FormBuilderSchema) => void
}

export const CookbookDialog: React.FC<CookbookDialogProps> = ({
  isOpen,
  onClose,
  onLoadSchema,
}) => {
  const [selectedId, setSelectedId] = useState<string>('recipe-saas-onboarding')
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<'all' | 'recipes' | 'docs' | 'integrations'>('all')
  const [copiedCode, setCopiedCode] = useState(false)
  const [submittedData, setSubmittedData] = useState<{ timestamp: string; data: Record<string, unknown> } | null>(null)

  const selectedItem = COOKBOOK_ITEMS.find((item) => item.id === selectedId) || COOKBOOK_ITEMS[0]

  const filteredItems = COOKBOOK_ITEMS.filter((item) => {
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesCategory && matchesSearch
  })

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedCode(true)
    setTimeout(() => setCopiedCode(false), 2000)
  }

  const handleLoadRecipe = (schema?: FormBuilderSchema) => {
    if (schema && onLoadSchema) {
      onLoadSchema(schema)
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-6xl w-[96vw] h-[88vh] p-0 flex flex-col overflow-hidden gap-0 bg-background text-foreground border shadow-2xl">
        {/* Header Bar */}
        <DialogHeader className="px-5 py-3.5 border-b shrink-0 flex flex-row items-center justify-between bg-card">
          <div className="flex items-center space-x-2.5">
            <div className="h-8 w-8 rounded-lg bg-foreground text-background flex items-center justify-center shadow-xs">
              <BookOpen className="h-4 w-4" />
            </div>
            <div>
              <DialogTitle className="text-sm sm:text-base font-bold tracking-tight flex items-center gap-2">
                ShadForm Interactive Docs & Cookbook
                <Badge variant="outline" className="text-[10px] font-mono font-normal">
                  v1.0.1
                </Badge>
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Explore real-world recipes with interactive live previews, copyable code, and 1-click canvas loading.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Master-Detail Layout */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left Navigation Sidebar */}
          <div className="w-64 sm:w-72 lg:w-80 border-r bg-muted/20 flex flex-col shrink-0">
            {/* Search Input */}
            <div className="p-3 border-b space-y-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter recipes & docs..."
                  className="pl-8 h-8 text-xs bg-background"
                />
              </div>

              {/* Category Pills */}
              <div className="flex items-center space-x-1">
                {(
                  [
                    { id: 'all', label: 'All' },
                    { id: 'recipes', label: 'Recipes' },
                    { id: 'docs', label: 'Docs' },
                    { id: 'integrations', label: 'Guides' },
                  ] as const
                ).map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setActiveCategory(cat.id)}
                    className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                      activeCategory === cat.id
                        ? 'bg-foreground text-background font-semibold shadow-2xs'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Scrollable Item List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {filteredItems.map((item) => {
                const isSelected = item.id === selectedId
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setSelectedId(item.id)
                      setSubmittedData(null)
                    }}
                    className={`w-full text-left p-2.5 rounded-lg text-xs transition-all flex flex-col space-y-1 border ${
                      isSelected
                        ? 'bg-background border-border shadow-xs text-foreground font-medium'
                        : 'border-transparent text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-foreground text-[12px] truncate max-w-[190px]">
                        {item.title}
                      </span>
                      <Badge
                        variant={item.category === 'recipes' ? 'secondary' : 'outline'}
                        className="text-[9px] px-1 py-0 uppercase tracking-wider font-mono shrink-0"
                      >
                        {item.badge}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground line-clamp-1">
                      {item.description}
                    </p>
                  </button>
                )
              })}

              {filteredItems.length === 0 && (
                <div className="p-4 text-center text-xs text-muted-foreground">
                  No matches found for "{searchQuery}".
                </div>
              )}
            </div>
          </div>

          {/* Right Content Viewport */}
          <div className="flex-1 overflow-y-auto bg-background p-4 sm:p-6 flex flex-col">
            {selectedItem.category === 'recipes' && selectedItem.schema ? (
              <div className="space-y-4 max-w-4xl w-full mx-auto">
                {/* Recipe Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <h2 className="text-base sm:text-lg font-bold tracking-tight text-foreground">
                        {selectedItem.title}
                      </h2>
                      <Badge variant="secondary" className="text-xs">
                        {selectedItem.badge}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {selectedItem.description}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2 shrink-0">
                    <Button
                      size="sm"
                      onClick={() => handleLoadRecipe(selectedItem.schema)}
                      className="h-8 text-xs font-semibold shadow-xs"
                      title="Load this recipe into the visual editor canvas"
                    >
                      <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                      Load into Canvas
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopy(selectedItem.reactCode || '')}
                      className="h-8 text-xs"
                      title="Copy React Component Code"
                    >
                      {copiedCode ? (
                        <>
                          <Check className="h-3.5 w-3.5 mr-1.5 text-emerald-600" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5 mr-1.5" />
                          Copy Code
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Recipe Tabs: Preview vs Code */}
                <Tabs defaultValue="preview" className="w-full">
                  <TabsList className="h-8 p-0.5 bg-muted">
                    <TabsTrigger value="preview" className="text-xs h-7 px-3">
                      <Eye className="h-3.5 w-3.5 mr-1.5" />
                      Interactive Live Preview
                    </TabsTrigger>
                    <TabsTrigger value="react" className="text-xs h-7 px-3">
                      <Code2 className="h-3.5 w-3.5 mr-1.5" />
                      React Component
                    </TabsTrigger>
                    <TabsTrigger value="nextjs" className="text-xs h-7 px-3">
                      <FileCode className="h-3.5 w-3.5 mr-1.5" />
                      Next.js
                    </TabsTrigger>
                    <TabsTrigger value="json" className="text-xs h-7 px-3">
                      <Layers className="h-3.5 w-3.5 mr-1.5" />
                      JSON Schema
                    </TabsTrigger>
                  </TabsList>

                  {/* TAB: Interactive Live Preview */}
                  <TabsContent value="preview" className="pt-3 space-y-4">
                    <div className="p-4 sm:p-6 rounded-xl border bg-card shadow-xs">
                      <FormRenderer
                        schema={selectedItem.schema}
                        onSubmit={(values) => {
                          setSubmittedData({
                            timestamp: new Date().toLocaleTimeString(),
                            data: values,
                          })
                        }}
                      />
                    </div>

                    {submittedData && (
                      <div className="p-3.5 rounded-lg border bg-muted/40 space-y-2 animate-in fade-in">
                        <div className="flex items-center space-x-2 text-xs font-semibold text-foreground">
                          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                          <span>Submitted Values Captured ({submittedData.timestamp}):</span>
                        </div>
                        <pre className="p-2.5 rounded bg-background border font-mono text-[11px] overflow-x-auto text-foreground">
                          {JSON.stringify(submittedData.data, null, 2)}
                        </pre>
                      </div>
                    )}
                  </TabsContent>

                  {/* TAB: React Code */}
                  <TabsContent value="react" className="pt-3">
                    <div className="relative">
                      <pre className="p-4 rounded-xl border bg-muted/60 font-mono text-xs overflow-x-auto text-foreground leading-relaxed">
                        {selectedItem.reactCode}
                      </pre>
                    </div>
                  </TabsContent>

                  {/* TAB: Next.js Code */}
                  <TabsContent value="nextjs" className="pt-3">
                    <pre className="p-4 rounded-xl border bg-muted/60 font-mono text-xs overflow-x-auto text-foreground leading-relaxed">
                      {selectedItem.nextjsCode}
                    </pre>
                  </TabsContent>

                  {/* TAB: JSON Schema */}
                  <TabsContent value="json" className="pt-3">
                    <pre className="p-4 rounded-xl border bg-muted/60 font-mono text-[11px] overflow-x-auto text-foreground max-h-96">
                      {JSON.stringify(selectedItem.schema, null, 2)}
                    </pre>
                  </TabsContent>
                </Tabs>
              </div>
            ) : (
              /* Documentation & Guides View */
              <div className="space-y-4 max-w-3xl w-full mx-auto">
                <div className="pb-3 border-b">
                  <div className="flex items-center space-x-2">
                    <h2 className="text-lg font-bold tracking-tight text-foreground">
                      {selectedItem.title}
                    </h2>
                    <Badge variant="outline" className="text-xs">
                      {selectedItem.badge}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {selectedItem.description}
                  </p>
                </div>

                {/* Render Markdown / Guide Content */}
                <div className="prose prose-sm dark:prose-invert max-w-none text-foreground leading-relaxed text-xs sm:text-sm">
                  <div className="space-y-3 whitespace-pre-line font-sans text-muted-foreground">
                    {selectedItem.markdownContent}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
