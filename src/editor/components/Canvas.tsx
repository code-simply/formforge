import React, { useState } from 'react'
import { useBuilderStore } from '../store/builderStore'
import { Button } from '../../ui/button'
import { DroppableColumn } from '../dnd/DroppableColumn'
import { RowSettingsDialog } from './RowSettingsDialog'
import {
  Plus,
  Trash2,
  Columns,
  ChevronUp,
  ChevronDown,
  Copy,
  Sliders,
} from 'lucide-react'
import { cn } from '../../ui/utils'

export const Canvas: React.FC = () => {
  const {
    schema,
    selectedPageId,
    selectPage,
    addPage,
    removePage,
    updatePage,
    selectedFieldId,
    selectField,
    removeField,
    duplicateField,
    addRow,
    removeRow,
    moveRow,
    updateRow,
    duplicateRow,
    setRowColumnWidths,
    addColumnToRow,
    removeColumnFromRow,
  } = useBuilderStore()

  const [activeRowSettingsId, setActiveRowSettingsId] = useState<string | null>(null)

  const currentPage =
    schema.pages[selectedPageId] || schema.pages[schema.pageOrder[0]]

  if (!currentPage) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 text-muted-foreground text-xs">
        No active page found.
      </div>
    )
  }

  const activeSettingsRow = activeRowSettingsId ? schema.rows[activeRowSettingsId] : null
  const activeSettingsRowWidths = activeSettingsRow
    ? activeSettingsRow.columnIds.map((id) => schema.columns[id]?.width || 12)
    : []

  return (
    <main className="flex-1 overflow-y-auto bg-muted/20 p-3 sm:p-6 flex flex-col items-center select-none">
      {/* Page / Stage Navigation Bar */}
      <div className="w-full max-w-4xl flex items-center justify-between mb-3 sm:mb-4 bg-background border rounded-lg p-1.5 shadow-sm">
        <div className="flex items-center space-x-1 overflow-x-auto no-scrollbar py-0.5">
          {schema.pageOrder.map((pageId, idx) => {
            const page = schema.pages[pageId]
            const isSelected = pageId === selectedPageId
            return (
              <div key={pageId} className="flex items-center shrink-0">
                <button
                  type="button"
                  onClick={() => selectPage(pageId)}
                  className={cn(
                    'flex items-center px-2.5 sm:px-3 py-1.5 text-xs font-medium rounded-md transition-colors shrink-0',
                    isSelected
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  <span className="mr-1 opacity-70">Step {idx + 1}:</span>
                  <span className="truncate max-w-[100px] sm:max-w-none">{page?.title || `Page ${idx + 1}`}</span>
                </button>
              </div>
            )
          })}

          <Button
            variant="ghost"
            size="sm"
            onClick={() => addPage()}
            className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground shrink-0"
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            Add Page
          </Button>
        </div>

        {schema.pageOrder.length > 1 && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              if (confirm('Delete this entire page and its elements?')) {
                removePage(currentPage.id)
              }
            }}
            className="h-7 w-7 text-muted-foreground hover:text-destructive shrink-0 ml-1"
            title="Delete current page"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>

      {/* Main Canvas Document Card */}
      <div className="w-full max-w-4xl bg-background border rounded-xl shadow-sm p-4 sm:p-6 space-y-5">
        {/* Page Header Configuration */}
        <div className="border-b pb-3.5 space-y-1.5">
          <input
            type="text"
            value={currentPage.title}
            onChange={(e) => updatePage(currentPage.id, { title: e.target.value })}
            placeholder="Page Title"
            className="w-full text-lg sm:text-xl font-bold bg-transparent focus:bg-muted/50 rounded px-1.5 py-0.5 outline-none tracking-tight text-foreground"
          />
          <input
            type="text"
            value={currentPage.description || ''}
            onChange={(e) =>
              updatePage(currentPage.id, { description: e.target.value })
            }
            placeholder="Add an optional section description or instructions..."
            className="w-full text-xs sm:text-sm text-muted-foreground bg-transparent focus:bg-muted/50 rounded px-1.5 py-0.5 outline-none"
          />
        </div>

        {/* Rows List */}
        <div className="space-y-4">
          {currentPage.rowIds.map((rowId, rIdx) => {
            const row = schema.rows[rowId]
            if (!row) return null

            const colCount = row.columnIds.length
            const colWidths = row.columnIds.map((id) => schema.columns[id]?.width || 12)

            return (
              <div
                key={rowId}
                className={cn(
                  'group/row relative border rounded-lg p-2.5 sm:p-3 transition-all bg-card',
                  row.fieldset
                    ? 'border-foreground/30 shadow-xs'
                    : 'border-dashed border-border hover:border-foreground/40'
                )}
              >
                {/* Fieldset Legend Header (if enabled) */}
                {(row.fieldset || row.title) && (
                  <div className="flex items-center space-x-2 mb-2 pb-1.5 border-b border-border/40">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground px-1.5 py-0.5 rounded bg-muted">
                      Legend
                    </span>
                    <input
                      type="text"
                      value={row.title || ''}
                      onChange={(e) => updateRow(rowId, { title: e.target.value })}
                      placeholder="Row Title / Fieldset Legend..."
                      className="text-xs font-semibold text-foreground bg-transparent border-none outline-none focus:bg-muted/50 rounded px-1 flex-1 truncate"
                    />
                  </div>
                )}

                {/* Floating Row Control Toolbar */}
                <div className="absolute -top-3.5 right-2 sm:right-3 opacity-95 sm:opacity-0 group-hover/row:opacity-100 transition-opacity bg-background border rounded-md shadow-md px-1 py-0.5 flex items-center space-x-0.5 z-20">
                  <span className="text-[9px] font-semibold text-muted-foreground px-1 uppercase tracking-wider">
                    Row
                  </span>

                  {/* Add Column Button (up to 4 cols) */}
                  {colCount < 4 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => addColumnToRow(rowId)}
                      className="h-6 w-6 text-muted-foreground hover:text-foreground"
                      title="Add column to this row"
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  )}

                  {/* Quick Layout Presets for 2 and 3 columns */}
                  {colCount === 2 && (
                    <div className="flex items-center space-x-0.5 border-x px-1">
                      <button
                        type="button"
                        onClick={() => setRowColumnWidths(rowId, [6, 6])}
                        className={cn(
                          'text-[9px] font-mono px-1 py-0.5 rounded',
                          colWidths[0] === 6 && colWidths[1] === 6
                            ? 'bg-foreground text-background font-bold'
                            : 'text-muted-foreground hover:bg-muted'
                        )}
                        title="50% / 50%"
                      >
                        6:6
                      </button>
                      <button
                        type="button"
                        onClick={() => setRowColumnWidths(rowId, [4, 8])}
                        className={cn(
                          'text-[9px] font-mono px-1 py-0.5 rounded',
                          colWidths[0] === 4 && colWidths[1] === 8
                            ? 'bg-foreground text-background font-bold'
                            : 'text-muted-foreground hover:bg-muted'
                        )}
                        title="33% / 67%"
                      >
                        4:8
                      </button>
                      <button
                        type="button"
                        onClick={() => setRowColumnWidths(rowId, [8, 4])}
                        className={cn(
                          'text-[9px] font-mono px-1 py-0.5 rounded',
                          colWidths[0] === 8 && colWidths[1] === 4
                            ? 'bg-foreground text-background font-bold'
                            : 'text-muted-foreground hover:bg-muted'
                        )}
                        title="67% / 33%"
                      >
                        8:4
                      </button>
                    </div>
                  )}

                  {/* Row & Column Settings Dialog Button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setActiveRowSettingsId(rowId)}
                    className="h-6 w-6 text-muted-foreground hover:text-foreground"
                    title="Row Settings & Column Presets"
                  >
                    <Sliders className="h-3 w-3" />
                  </Button>

                  {/* Duplicate Row */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => duplicateRow(currentPage.id, rowId)}
                    className="h-6 w-6 text-muted-foreground hover:text-foreground"
                    title="Duplicate Row"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>

                  {/* Reorder Up */}
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={rIdx === 0}
                    onClick={() => moveRow(currentPage.id, rowId, rIdx - 1)}
                    className="h-6 w-6 text-muted-foreground hover:text-foreground disabled:opacity-30"
                    title="Move Row Up"
                  >
                    <ChevronUp className="h-3.5 w-3.5" />
                  </Button>

                  {/* Reorder Down */}
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={rIdx === currentPage.rowIds.length - 1}
                    onClick={() => moveRow(currentPage.id, rowId, rIdx + 1)}
                    className="h-6 w-6 text-muted-foreground hover:text-foreground disabled:opacity-30"
                    title="Move Row Down"
                  >
                    <ChevronDown className="h-3.5 w-3.5" />
                  </Button>

                  {/* Delete Row */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeRow(rowId)}
                    className="h-6 w-6 text-muted-foreground hover:text-destructive"
                    title="Delete Row"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>

                {/* Columns Grid with Drag Column Resizing */}
                <div className="canvas-row-grid grid grid-cols-12 gap-2.5 sm:gap-3 pt-1">
                  {row.columnIds.map((colId, cIdx) => {
                    const col = schema.columns[colId]
                    if (!col) return null
                    const nextColId = row.columnIds[cIdx + 1]
                    const nextCol = nextColId ? schema.columns[nextColId] : undefined

                    return (
                      <DroppableColumn
                        key={colId}
                        column={col}
                        nextColumn={nextCol}
                        fields={schema.fields}
                        selectedFieldId={selectedFieldId}
                        canRemove={row.columnIds.length > 1}
                        onSelectField={(fId) => selectField(fId)}
                        onDuplicateField={(fId) => duplicateField(fId)}
                        onRemoveField={(fId) => removeField(fId)}
                        onResizeAdjacent={(newLeft, newRight) => {
                          const newWidths = [...row.columnIds.map((id) => schema.columns[id]?.width || 12)]
                          newWidths[cIdx] = newLeft
                          newWidths[cIdx + 1] = newRight
                          setRowColumnWidths(rowId, newWidths)
                        }}
                        onRemoveColumn={() => removeColumnFromRow(rowId, colId)}
                      />
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>

        {/* Add Row Controls Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-3 border-t gap-2 text-xs">
          <span className="text-muted-foreground flex items-center font-medium">
            <Columns className="h-3.5 w-3.5 mr-1.5" />
            Add Row Layout:
          </span>

          <div className="flex flex-wrap items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => addRow(currentPage.id, [12])}
              className="h-7 text-xs px-2.5"
            >
              1 Col (Full)
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => addRow(currentPage.id, [6, 6])}
              className="h-7 text-xs px-2.5"
            >
              2 Cols (1/2 + 1/2)
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => addRow(currentPage.id, [4, 4, 4])}
              className="h-7 text-xs px-2.5"
            >
              3 Cols (1/3 each)
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => addRow(currentPage.id, [8, 4])}
              className="h-7 text-xs px-2.5"
            >
              2 Cols (2/3 + 1/3)
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => addRow(currentPage.id, [3, 3, 3, 3])}
              className="h-7 text-xs px-2.5"
            >
              4 Cols (1/4 each)
            </Button>
          </div>
        </div>
      </div>

      {/* Row & Column Settings Dialog */}
      <RowSettingsDialog
        isOpen={!!activeRowSettingsId}
        onClose={() => setActiveRowSettingsId(null)}
        row={activeSettingsRow}
        columnWidths={activeSettingsRowWidths}
        onSaveRow={(rowId, partial) => updateRow(rowId, partial)}
        onApplyPreset={(rowId, widths) => setRowColumnWidths(rowId, widths)}
        onAddColumn={(rowId) => addColumnToRow(rowId)}
        onRemoveColumn={(rowId, colId) => removeColumnFromRow(rowId, colId)}
      />
    </main>
  )
}
