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
import { Textarea } from '../../ui/textarea'
import { FormBuilderSchema } from '../../core/types'
import { FormBuilderSchemaZod } from '../../core/schema'
import { migrateLegacyFormeoSchema } from '../../core/legacyMigrator'
import { Copy, Check, Sparkles } from 'lucide-react'

export interface JsonDialogProps {
  isOpen: boolean
  onClose: () => void
  mode: 'export' | 'import'
  schema: FormBuilderSchema
  onImport: (schema: FormBuilderSchema) => void
}

export const JsonDialog: React.FC<JsonDialogProps> = ({
  isOpen,
  onClose,
  mode,
  schema,
  onImport,
}) => {
  const [text, setText] = useState('')
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [migratedNotice, setMigratedNotice] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setError(null)
      setMigratedNotice(false)
      if (mode === 'export') {
        setText(JSON.stringify(schema, null, 2))
      } else {
        setText('')
      }
    }
  }, [isOpen, mode, schema])

  const handleCopy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleApplyImport = () => {
    try {
      const parsed = JSON.parse(text)

      // Auto-detect legacy Formeo schema format and migrate
      if (parsed.stages || (parsed.fields && Object.values(parsed.fields).some((f: any) => f?.tag || f?.attrs))) {
        const migrated = migrateLegacyFormeoSchema(parsed)
        onImport(migrated)
        setMigratedNotice(true)
        setTimeout(() => onClose(), 800)
        return
      }

      const validated = FormBuilderSchemaZod.parse(parsed)
      onImport(validated as FormBuilderSchema)
      onClose()
    } catch (err: any) {
      setError(err?.message || 'Invalid form schema JSON format.')
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {mode === 'export' ? 'Export Form Schema' : 'Import Form Schema'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'export'
              ? 'Copy this portable JSON schema to persist or render your form definition anywhere.'
              : 'Paste a modern schema or a legacy Formeo JSON schema below. Legacy schemas will be auto-migrated.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 py-2">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            readOnly={mode === 'export'}
            rows={14}
            className="font-mono text-xs"
            placeholder={mode === 'import' ? 'Paste form schema JSON here (modern or legacy Formeo)...' : ''}
          />
          {migratedNotice && (
            <p className="text-xs text-primary font-medium flex items-center">
              <Sparkles className="h-3.5 w-3.5 mr-1" />
              Detected legacy Formeo schema: successfully migrated to modern format!
            </p>
          )}
          {error && <p className="text-xs text-destructive font-medium">{error}</p>}
        </div>

        <DialogFooter className="flex justify-between items-center sm:justify-between">
          {mode === 'export' ? (
            <Button variant="outline" size="sm" onClick={handleCopy}>
              {copied ? (
                <>
                  <Check className="h-4 w-4 mr-1 text-green-600" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-1" />
                  Copy to Clipboard
                </>
              )}
            </Button>
          ) : (
            <Button size="sm" onClick={handleApplyImport}>
              Apply Schema
            </Button>
          )}

          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
