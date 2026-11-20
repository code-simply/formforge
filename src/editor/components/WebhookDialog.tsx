import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../ui/dialog'
import { Button } from '../../ui/button'
import { Input } from '../../ui/input'
import { Label } from '../../ui/label'
import { Switch } from '../../ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select'
import { FormBuilderSchema, WebhookConfig } from '../../core/types'
import { remapFormPayload } from '../../core/webhook'
import { Webhook, Plus, Trash2, ArrowRight, Code, CheckCircle2 } from 'lucide-react'

export interface WebhookDialogProps {
  isOpen: boolean
  onClose: () => void
  schema: FormBuilderSchema
  onSave: (config: WebhookConfig) => void
}

export const WebhookDialog: React.FC<WebhookDialogProps> = ({
  isOpen,
  onClose,
  schema,
  onSave,
}) => {
  const [enabled, setEnabled] = useState(false)
  const [url, setUrl] = useState('')
  const [method, setMethod] = useState<'POST' | 'PUT'>('POST')
  const [headers, setHeaders] = useState<Array<{ key: string; value: string }>>([])
  const [keyMapping, setKeyMapping] = useState<Record<string, string>>({})
  const [staticPayload, setStaticPayload] = useState<Array<{ key: string; value: string }>>([])
  const [activeTab, setActiveTab] = useState<'endpoint' | 'mapping' | 'static' | 'preview'>('endpoint')
  const [testSuccess, setTestSuccess] = useState<string | null>(null)

  // Initialize from schema settings when opened
  useEffect(() => {
    if (isOpen) {
      const config = schema.settings?.webhook
      setEnabled(config?.enabled ?? false)
      setUrl(config?.url ?? '')
      setMethod(config?.method ?? 'POST')

      if (config?.headers) {
        setHeaders(
          Object.entries(config.headers).map(([key, value]) => ({ key, value }))
        )
      } else {
        setHeaders([])
      }

      setKeyMapping(config?.keyMapping ? { ...config.keyMapping } : {})

      if (config?.staticPayload) {
        setStaticPayload(
          Object.entries(config.staticPayload).map(([key, value]) => ({
            key,
            value: String(value),
          }))
        )
      } else {
        setStaticPayload([])
      }
      setTestSuccess(null)
    }
  }, [isOpen, schema])

  // Get all user input fields from schema
  const formFields = Object.values(schema.fields).filter(
    (f) => !['heading', 'paragraph', 'separator', 'logo', 'image', 'avatar'].includes(f.type)
  )

  // Handle header list manipulation
  const handleAddHeader = () => {
    setHeaders([...headers, { key: '', value: '' }])
  }

  const handleUpdateHeader = (index: number, key: string, value: string) => {
    const next = [...headers]
    next[index] = { key, value }
    setHeaders(next)
  }

  const handleRemoveHeader = (index: number) => {
    setHeaders(headers.filter((_, i) => i !== index))
  }

  // Handle key mapping update
  const handleMappingChange = (fieldKey: string, targetKey: string) => {
    const next = { ...keyMapping }
    if (!targetKey.trim()) {
      delete next[fieldKey]
    } else {
      next[fieldKey] = targetKey.trim()
    }
    setKeyMapping(next)
  }

  // Handle static payload list manipulation
  const handleAddStatic = () => {
    setStaticPayload([...staticPayload, { key: '', value: '' }])
  }

  const handleUpdateStatic = (index: number, key: string, value: string) => {
    const next = [...staticPayload]
    next[index] = { key, value }
    setStaticPayload(next)
  }

  const handleRemoveStatic = (index: number) => {
    setStaticPayload(staticPayload.filter((_, i) => i !== index))
  }

  // Generate mock preview payload
  const mockRawData: Record<string, unknown> = {}
  formFields.forEach((f) => {
    mockRawData[f.name || f.id] = `Sample ${f.label}`
  })

  const staticPayloadRecord: Record<string, unknown> = {}
  staticPayload.forEach(({ key, value }) => {
    if (key.trim()) {
      staticPayloadRecord[key.trim()] = value
    }
  })

  const previewTransformed = remapFormPayload(mockRawData, keyMapping, staticPayloadRecord)

  const handleSave = () => {
    const headersRecord: Record<string, string> = {}
    headers.forEach(({ key, value }) => {
      if (key.trim()) headersRecord[key.trim()] = value
    })

    const finalConfig: WebhookConfig = {
      enabled,
      url: url.trim(),
      method,
      headers: Object.keys(headersRecord).length > 0 ? headersRecord : undefined,
      keyMapping: Object.keys(keyMapping).length > 0 ? keyMapping : undefined,
      staticPayload: Object.keys(staticPayloadRecord).length > 0 ? staticPayloadRecord : undefined,
    }

    onSave(finalConfig)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center space-x-2">
            <Webhook className="h-5 w-5 text-foreground" />
            <DialogTitle>Webhook & JSON Remapping Pipeline</DialogTitle>
          </div>
          <DialogDescription>
            Forward form submissions to an HTTP endpoint with custom headers, static properties, and JSON key remapping.
          </DialogDescription>
        </DialogHeader>

        {/* Global Enable Toggle */}
        <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/40 my-1">
          <div>
            <Label className="text-sm font-semibold cursor-pointer">Dispatch Submission to Webhook</Label>
            <p className="text-xs text-muted-foreground">
              When enabled, submissions trigger an asynchronous HTTP POST/PUT payload dispatch.
            </p>
          </div>
          <Switch checked={enabled} onCheckedChange={setEnabled} />
        </div>

        <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)} className="flex-1 flex flex-col min-h-0">
          <TabsList className="grid grid-cols-4">
            <TabsTrigger value="endpoint" className="text-xs">Endpoint</TabsTrigger>
            <TabsTrigger value="mapping" className="text-xs">
              Key Remap ({Object.keys(keyMapping).length})
            </TabsTrigger>
            <TabsTrigger value="static" className="text-xs">
              Static Data ({staticPayload.filter((p) => p.key.trim()).length})
            </TabsTrigger>
            <TabsTrigger value="preview" className="text-xs flex items-center gap-1">
              <Code className="h-3 w-3" /> Preview
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto py-3">
            {/* TAB: ENDPOINT */}
            <TabsContent value="endpoint" className="mt-0 space-y-4">
              <div className="grid grid-cols-4 gap-2">
                <div className="col-span-1 space-y-1.5">
                  <Label className="text-xs font-medium">Method</Label>
                  <Select value={method} onValueChange={(v: 'POST' | 'PUT') => setMethod(v)}>
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="POST">POST</SelectItem>
                      <SelectItem value="PUT">PUT</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="col-span-3 space-y-1.5">
                  <Label className="text-xs font-medium">Endpoint URL</Label>
                  <Input
                    placeholder="https://api.yourdomain.com/webhooks/form-submit"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="h-9 text-xs font-mono"
                  />
                </div>
              </div>

              {/* Custom Headers */}
              <div className="space-y-2 pt-2 border-t">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-xs font-medium">HTTP Request Headers</Label>
                    <p className="text-[11px] text-muted-foreground">Attach authentication tokens or custom headers</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleAddHeader} className="h-7 text-xs">
                    <Plus className="h-3 w-3 mr-1" /> Add Header
                  </Button>
                </div>

                {headers.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic py-2">No custom headers configured.</p>
                ) : (
                  <div className="space-y-2">
                    {headers.map((h, i) => (
                      <div key={i} className="flex items-center space-x-2">
                        <Input
                          placeholder="Header Name (e.g. Authorization)"
                          value={h.key}
                          onChange={(e) => handleUpdateHeader(i, e.target.value, h.value)}
                          className="h-8 text-xs font-mono"
                        />
                        <Input
                          placeholder="Value (e.g. Bearer token_123)"
                          value={h.value}
                          onChange={(e) => handleUpdateHeader(i, h.key, e.target.value)}
                          className="h-8 text-xs font-mono"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveHeader(i)}
                          className="h-8 w-8 text-destructive shrink-0"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* TAB: KEY REMAP */}
            <TabsContent value="mapping" className="mt-0 space-y-3">
              <div className="p-2.5 rounded-md bg-muted/30 border text-xs text-muted-foreground">
                <p className="font-semibold text-foreground mb-0.5">Dot-Notation Nesting Supported</p>
                Target keys with dots (e.g. <code className="bg-background px-1 py-0.5 rounded border font-mono">customer.email</code> or{' '}
                <code className="bg-background px-1 py-0.5 rounded border font-mono">meta.analytics.source</code>) will automatically be transformed into nested JSON objects before sending.
              </div>

              {formFields.length === 0 ? (
                <p className="text-xs text-muted-foreground italic py-4 text-center">
                  Add interactive fields to your form to configure key remapping.
                </p>
              ) : (
                <div className="border rounded-md divide-y overflow-hidden">
                  <div className="grid grid-cols-12 bg-muted/60 p-2 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    <div className="col-span-5">Form Field (Source)</div>
                    <div className="col-span-1 text-center"></div>
                    <div className="col-span-6">Destination JSON Key</div>
                  </div>
                  {formFields.map((field) => {
                    const fieldKey = field.name || field.id
                    const currentMapping = keyMapping[fieldKey] || ''
                    return (
                      <div key={field.id} className="grid grid-cols-12 items-center p-2 text-xs gap-2">
                        <div className="col-span-5 truncate">
                          <p className="font-medium truncate">{field.label}</p>
                          <code className="text-[10px] text-muted-foreground font-mono">{fieldKey}</code>
                        </div>
                        <div className="col-span-1 flex justify-center text-muted-foreground">
                          <ArrowRight className="h-3.5 w-3.5" />
                        </div>
                        <div className="col-span-6">
                          <Input
                            placeholder={fieldKey}
                            value={currentMapping}
                            onChange={(e) => handleMappingChange(fieldKey, e.target.value)}
                            className="h-8 text-xs font-mono"
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </TabsContent>

            {/* TAB: STATIC DATA */}
            <TabsContent value="static" className="mt-0 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-xs font-medium">Injected Static Properties</Label>
                  <p className="text-[11px] text-muted-foreground">
                    Static attributes appended to every submission payload (e.g. source, campaign, version).
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={handleAddStatic} className="h-7 text-xs">
                  <Plus className="h-3 w-3 mr-1" /> Add Property
                </Button>
              </div>

              {staticPayload.length === 0 ? (
                <p className="text-xs text-muted-foreground italic py-2">No static payload values configured.</p>
              ) : (
                <div className="space-y-2">
                  {staticPayload.map((item, idx) => (
                    <div key={idx} className="flex items-center space-x-2">
                      <Input
                        placeholder="Target Key (e.g. app.version)"
                        value={item.key}
                        onChange={(e) => handleUpdateStatic(idx, e.target.value, item.value)}
                        className="h-8 text-xs font-mono"
                      />
                      <Input
                        placeholder="Value (e.g. 2.4.0)"
                        value={item.value}
                        onChange={(e) => handleUpdateStatic(idx, item.key, e.target.value)}
                        className="h-8 text-xs font-mono"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveStatic(idx)}
                        className="h-8 w-8 text-destructive shrink-0"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* TAB: PREVIEW */}
            <TabsContent value="preview" className="mt-0 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-foreground">Live Payload Preview</span>
                <span className="text-[11px] text-muted-foreground">Generated with sample data</span>
              </div>
              <pre className="p-3 rounded-md bg-muted/60 border font-mono text-xs overflow-x-auto max-h-64 text-foreground">
                {JSON.stringify(previewTransformed, null, 2)}
              </pre>

              {testSuccess && (
                <div className="flex items-center space-x-1.5 text-xs text-emerald-600 bg-emerald-500/10 p-2 rounded border border-emerald-500/20">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>{testSuccess}</span>
                </div>
              )}
            </TabsContent>
          </div>
        </Tabs>

        <DialogFooter className="border-t pt-3 flex items-center justify-between sm:justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-xs text-muted-foreground">
              {enabled && url ? (
                <span className="inline-flex items-center text-foreground font-medium">
                  <span className="h-1.5 w-1.5 rounded-full bg-foreground mr-1.5 animate-pulse" />
                  {method} {url}
                </span>
              ) : (
                'Webhook not active'
              )}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={onClose} className="h-8 text-xs">
              Cancel
            </Button>
            <Button size="sm" onClick={handleSave} className="h-8 text-xs font-semibold">
              Save Webhook Configuration
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
