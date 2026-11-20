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
import { FormRow } from '../../core/types'
import { Sliders, Columns, Plus, Trash2 } from 'lucide-react'

export interface RowSettingsDialogProps {
  isOpen: boolean
  onClose: () => void
  row: FormRow | null
  columnWidths: number[]
  onSaveRow: (rowId: string, partial: Partial<FormRow>) => void
  onApplyPreset: (rowId: string, widths: number[]) => void
  onAddColumn: (rowId: string) => void
  onRemoveColumn: (rowId: string, colId: string) => void
}

export const RowSettingsDialog: React.FC<RowSettingsDialogProps> = ({
  isOpen,
  onClose,
  row,
  columnWidths,
  onSaveRow,
  onApplyPreset,
  onAddColumn,
  onRemoveColumn,
}) => {
  const [title, setTitle] = useState('')
  const [fieldset, setFieldset] = useState(false)
  const [className, setClassName] = useState('')

  useEffect(() => {
    if (row && isOpen) {
      setTitle(row.title || '')
      setFieldset(!!row.fieldset)
      setClassName(row.className || '')
    }
  }, [row, isOpen])

  if (!row) return null

  const handleSave = () => {
    onSaveRow(row.id, {
      title: title.trim() || undefined,
      fieldset,
      className: className.trim() || undefined,
    })
    onClose()
  }

  // Predefined column layout presets based on column count
  const colCount = row.columnIds.length
  const presets: Array<{ label: string; widths: number[] }> =
    colCount === 1
      ? [{ label: 'Full Width (12/12)', widths: [12] }]
      : colCount === 2
      ? [
          { label: '50% / 50% (Equal)', widths: [6, 6] },
          { label: '33% / 67% (1/3 + 2/3)', widths: [4, 8] },
          { label: '67% / 33% (2/3 + 1/3)', widths: [8, 4] },
          { label: '25% / 75% (1/4 + 3/4)', widths: [3, 9] },
          { label: '75% / 25% (3/4 + 1/4)', widths: [9, 3] },
        ]
      : colCount === 3
      ? [
          { label: '33% / 33% / 33% (Equal)', widths: [4, 4, 4] },
          { label: '50% / 25% / 25%', widths: [6, 3, 3] },
          { label: '25% / 50% / 25%', widths: [3, 6, 3] },
          { label: '25% / 25% / 50%', widths: [3, 3, 6] },
        ]
      : [{ label: '25% / 25% / 25% / 25% (Equal)', widths: [3, 3, 3, 3] }]

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center space-x-2">
            <Sliders className="h-4 w-4 text-foreground" />
            <DialogTitle>Row & Column Settings</DialogTitle>
          </div>
          <DialogDescription>
            Configure layout columns, fieldset grouping, and section titles for this row.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2 text-xs">
          {/* Fieldset Wrapper */}
          <div className="flex items-center justify-between p-2.5 rounded-lg border bg-muted/30">
            <div>
              <Label className="text-xs font-semibold cursor-pointer">Group in Fieldset Border</Label>
              <p className="text-[11px] text-muted-foreground">
                Wraps row contents in a semantic HTML fieldset container with border and legend.
              </p>
            </div>
            <Switch checked={fieldset} onCheckedChange={setFieldset} />
          </div>

          {/* Row Legend / Title */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Row Title / Legend</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Personal Information, Billing Address"
              className="h-8 text-xs"
            />
            <p className="text-[10px] text-muted-foreground">
              Displayed as the legend banner at the top of the fieldset group.
            </p>
          </div>

          {/* Column Layout Presets */}
          <div className="space-y-2 pt-2 border-t">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold flex items-center gap-1.5">
                <Columns className="h-3.5 w-3.5 text-muted-foreground" />
                Column Width Presets ({colCount} Columns)
              </Label>
              {colCount < 4 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onAddColumn(row.id)}
                  className="h-6 px-2 text-[11px]"
                >
                  <Plus className="h-3 w-3 mr-1" /> Add Col
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 gap-1.5">
              {presets.map((preset, idx) => {
                const isSelected =
                  columnWidths.length === preset.widths.length &&
                  columnWidths.every((w, i) => w === preset.widths[i])

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => onApplyPreset(row.id, preset.widths)}
                    className={`flex items-center justify-between px-3 py-2 rounded-md border text-left text-xs transition-colors ${
                      isSelected
                        ? 'border-foreground bg-accent font-medium text-foreground'
                        : 'hover:bg-muted/60 text-muted-foreground'
                    }`}
                  >
                    <span>{preset.label}</span>
                    <span className="font-mono text-[10px] opacity-70">
                      [{preset.widths.join(', ')}]
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Column Management Table */}
          {colCount > 1 && (
            <div className="space-y-2 pt-2 border-t">
              <Label className="text-xs font-semibold">Columns in Row</Label>
              <div className="space-y-1.5">
                {row.columnIds.map((colId, cIdx) => (
                  <div
                    key={colId}
                    className="flex items-center justify-between p-2 rounded border bg-card text-xs"
                  >
                    <span className="font-medium text-foreground">
                      Column {cIdx + 1}: {columnWidths[cIdx] || 12}/12 span
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onRemoveColumn(row.id, colId)}
                      className="h-6 w-6 text-destructive hover:bg-destructive/10"
                      title="Remove Column"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Custom CSS Class */}
          <div className="space-y-1.5 pt-2 border-t">
            <Label className="text-xs font-medium">Custom CSS Class (optional)</Label>
            <Input
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              placeholder="e.g. shadow-sm my-4"
              className="h-8 text-xs font-mono"
            />
          </div>
        </div>

        <DialogFooter className="border-t pt-3 flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onClose} className="h-8 text-xs">
            Cancel
          </Button>
          <Button size="sm" onClick={handleSave} className="h-8 text-xs font-semibold">
            Apply Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
