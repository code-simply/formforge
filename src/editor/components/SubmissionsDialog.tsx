import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../../ui/dialog'
import { Button } from '../../ui/button'
import { Input } from '../../ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs'
import { FormBuilderSchema, FormSubmissionRecord } from '../../core/types'
import { useBuilderStore } from '../store/builderStore'
import {
  exportSubmissionsToCsv,
  exportSubmissionsToJson,
  downloadFile,
} from '../../core/submissions'
import {
  Inbox,
  FileSpreadsheet,
  FileJson,
  Trash2,
  Search,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  ChevronRight,
  SendHorizontal,
} from 'lucide-react'

export interface SubmissionsDialogProps {
  isOpen: boolean
  onClose: () => void
  schema: FormBuilderSchema
}

export const SubmissionsDialog: React.FC<SubmissionsDialogProps> = ({
  isOpen,
  onClose,
  schema,
}) => {
  const { submissions, deleteSubmission, clearSubmissions } = useBuilderStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSubId, setSelectedSubId] = useState<string | null>(null)
  const [jsonCopied, setJsonCopied] = useState(false)
  const [detailTab, setDetailTab] = useState<'fields' | 'json' | 'webhook'>('fields')

  // Filter submissions by current form title or search query
  const filteredSubmissions = submissions.filter((s) => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    if (s.id.toLowerCase().includes(q)) return true
    return Object.values(s.values || {}).some((v) =>
      String(v).toLowerCase().includes(q)
    )
  })

  const activeSubmission: FormSubmissionRecord | undefined =
    submissions.find((s) => s.id === selectedSubId) || filteredSubmissions[0]

  const handleExportCsv = () => {
    const csv = exportSubmissionsToCsv(submissions, schema)
    const filename = `${schema.title.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}_submissions.csv`
    downloadFile(csv, filename, 'text/csv;charset=utf-8;')
  }

  const handleExportJson = () => {
    const json = exportSubmissionsToJson(submissions)
    const filename = `${schema.title.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}_submissions.json`
    downloadFile(json, filename, 'application/json')
  }

  const handleCopyJson = () => {
    if (!activeSubmission) return
    navigator.clipboard.writeText(JSON.stringify(activeSubmission, null, 2))
    setJsonCopied(true)
    setTimeout(() => setJsonCopied(false), 2000)
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col p-4 sm:p-6">
        <DialogHeader>
          <div className="flex items-center space-x-2">
            <Inbox className="h-5 w-5 text-foreground" />
            <DialogTitle>Form Submissions Records</DialogTitle>
          </div>
          <DialogDescription>
            View, inspect, and export responses collected from live and preview form submissions.
          </DialogDescription>
        </DialogHeader>

        {/* Action Controls & Search Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 pb-3 border-b">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search responses by keyword or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 pl-8 text-xs"
            />
          </div>

          <div className="flex items-center space-x-1.5 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCsv}
              disabled={submissions.length === 0}
              className="h-8 text-xs px-2.5"
              title="Download CSV file"
            >
              <FileSpreadsheet className="h-3.5 w-3.5 mr-1 text-emerald-600 dark:text-emerald-400" />
              <span>Export CSV</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportJson}
              disabled={submissions.length === 0}
              className="h-8 text-xs px-2.5"
              title="Download JSON file"
            >
              <FileJson className="h-3.5 w-3.5 mr-1 text-blue-600 dark:text-blue-400" />
              <span>Export JSON</span>
            </Button>

            {submissions.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (confirm('Clear all recorded submissions for this session?')) {
                    clearSubmissions()
                    setSelectedSubId(null)
                  }
                }}
                className="h-8 text-xs px-2 text-destructive hover:bg-destructive/10"
                title="Clear all submissions"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>

        {/* Content Body */}
        {filteredSubmissions.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-3">
            <div className="p-3 rounded-full bg-muted/60 text-muted-foreground">
              <Inbox className="h-8 w-8" />
            </div>
            <div>
              <p className="font-semibold text-sm text-foreground">No Submissions Recorded</p>
              <p className="text-xs text-muted-foreground max-w-sm mt-1">
                Responses submitted through the Preview mode or live form renderer will be captured and displayed here.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-3 min-h-[350px] overflow-hidden pt-2">
            {/* Left Master List (5 cols) */}
            <div className="md:col-span-5 border rounded-lg overflow-y-auto divide-y max-h-[500px]">
              {filteredSubmissions.map((sub) => {
                const isSelected = activeSubmission?.id === sub.id
                const dateStr = new Date(sub.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                })
                const dateDay = new Date(sub.timestamp).toLocaleDateString()

                const fieldKeys = Object.keys(sub.values || {})
                const firstVal = fieldKeys[0] ? String(sub.values[fieldKeys[0]]) : 'Empty'

                return (
                  <div
                    key={sub.id}
                    onClick={() => setSelectedSubId(sub.id)}
                    className={`p-2.5 text-xs cursor-pointer transition-colors flex items-center justify-between ${
                      isSelected
                        ? 'bg-accent font-medium text-foreground'
                        : 'hover:bg-muted/50 text-muted-foreground'
                    }`}
                  >
                    <div className="space-y-0.5 truncate pr-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-[11px] text-foreground font-semibold">
                          {sub.id}
                        </span>
                        {sub.webhookStatus?.attempted && (
                          <span
                            className={`text-[9px] uppercase font-mono px-1 py-0.2 rounded font-semibold ${
                              sub.webhookStatus.success
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                : 'bg-destructive/10 text-destructive'
                            }`}
                          >
                            {sub.webhookStatus.success ? 'Hook 200' : 'Hook Err'}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] truncate text-foreground/80">
                        {firstVal}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {dateDay} {dateStr}
                      </p>
                    </div>

                    <div className="flex items-center space-x-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteSubmission(sub.id)
                          if (selectedSubId === sub.id) setSelectedSubId(null)
                        }}
                        className="h-6 w-6 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                      <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Right Detail Inspector (7 cols) */}
            {activeSubmission && (
              <div className="md:col-span-7 border rounded-lg p-3 flex flex-col overflow-hidden max-h-[500px]">
                <div className="flex items-center justify-between pb-2 border-b">
                  <div>
                    <p className="text-xs font-semibold text-foreground">
                      Submission Details: <span className="font-mono font-normal">{activeSubmission.id}</span>
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      Submitted at {new Date(activeSubmission.timestamp).toLocaleString()}
                    </p>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyJson}
                    className="h-7 text-xs font-mono"
                  >
                    {jsonCopied ? (
                      <>
                        <Check className="h-3 w-3 mr-1 text-emerald-500" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3 mr-1" />
                        Copy JSON
                      </>
                    )}
                  </Button>
                </div>

                <Tabs
                  value={detailTab}
                  onValueChange={(v: any) => setDetailTab(v)}
                  className="flex-1 flex flex-col min-h-0 pt-2"
                >
                  <TabsList className="grid grid-cols-3 mb-2">
                    <TabsTrigger value="fields" className="text-xs">Form Fields</TabsTrigger>
                    <TabsTrigger value="json" className="text-xs">Raw JSON</TabsTrigger>
                    <TabsTrigger value="webhook" className="text-xs">Webhook Pipeline</TabsTrigger>
                  </TabsList>

                  {/* TAB 1: FORM FIELDS */}
                  <TabsContent value="fields" className="mt-0 flex-1 overflow-y-auto space-y-2 pr-1">
                    {Object.entries(activeSubmission.values || {}).map(([key, val]) => {
                      const field = Object.values(schema.fields).find(
                        (f) => (f.name || f.id) === key
                      )
                      const label = field?.label || key

                      return (
                        <div key={key} className="p-2 rounded-md bg-muted/30 border space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-foreground">{label}</span>
                            <code className="text-[10px] font-mono text-muted-foreground">{key}</code>
                          </div>
                          <div className="text-xs text-foreground font-mono bg-background/80 p-1.5 rounded border">
                            {typeof val === 'object' && val !== null ? (
                              <pre className="text-[11px] overflow-x-auto whitespace-pre-wrap">
                                {JSON.stringify(val, null, 2)}
                              </pre>
                            ) : (
                              String(val === '' ? '<empty>' : val)
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </TabsContent>

                  {/* TAB 2: RAW JSON */}
                  <TabsContent value="json" className="mt-0 flex-1 overflow-y-auto">
                    <pre className="p-3 rounded bg-muted/60 border font-mono text-xs overflow-x-auto text-foreground">
                      {JSON.stringify(activeSubmission.values, null, 2)}
                    </pre>
                  </TabsContent>

                  {/* TAB 3: WEBHOOK PIPELINE */}
                  <TabsContent value="webhook" className="mt-0 flex-1 overflow-y-auto space-y-3">
                    {activeSubmission.webhookStatus?.attempted ? (
                      <div className="space-y-3">
                        <div
                          className={`p-3 rounded-lg border text-xs flex items-center justify-between ${
                            activeSubmission.webhookStatus.success
                              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                              : 'bg-destructive/10 border-destructive/20 text-destructive'
                          }`}
                        >
                          <div className="flex items-center space-x-2">
                            {activeSubmission.webhookStatus.success ? (
                              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                            ) : (
                              <AlertCircle className="h-4 w-4 shrink-0 text-destructive" />
                            )}
                            <span className="font-semibold">
                              HTTP {activeSubmission.webhookStatus.status || 0}:{' '}
                              {activeSubmission.webhookStatus.message}
                            </span>
                          </div>
                        </div>

                        {activeSubmission.remappedValues && (
                          <div className="space-y-1">
                            <span className="text-[11px] font-semibold uppercase text-muted-foreground">
                              Transformed Payload (Dispatched to URL)
                            </span>
                            <pre className="p-2.5 rounded bg-muted/60 border font-mono text-xs overflow-x-auto">
                              {JSON.stringify(activeSubmission.remappedValues, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="p-6 text-center text-xs text-muted-foreground border rounded-lg border-dashed">
                        <SendHorizontal className="h-6 w-6 mx-auto mb-2 opacity-50" />
                        <p className="font-medium text-foreground">Webhook Not Active on This Submission</p>
                        <p className="text-[11px] mt-1">
                          Configure an HTTP endpoint in the Webhook dialog to automatically forward future form submissions.
                        </p>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
