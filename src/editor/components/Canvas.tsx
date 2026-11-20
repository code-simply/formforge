import React from 'react'
import { useBuilderStore } from '../store/builderStore'
import { Button } from '../../ui/button'
import { DroppableColumn } from '../dnd/DroppableColumn'
import {
  Plus,
  Trash2,
  Columns,
  ChevronUp,
  ChevronDown,
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
  } = useBuilderStore()

  const currentPage =
    schema.pages[selectedPageId] || schema.pages[schema.pageOrder[0]]

  if (!currentPage) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 text-muted-foreground">
        No active page found.
      </div>
    )
  }

  return (
    <main className="flex-1 overflow-y-auto bg-muted/30 p-6 flex flex-col items-center">
      {/* Page / Stage Navigation Bar */}
      <div className="w-full max-w-4xl flex items-center justify-between mb-4 bg-background border rounded-lg p-1.5 shadow-sm">
        <div className="flex items-center space-x-1 overflow-x-auto">
          {schema.pageOrder.map((pageId, idx) => {
            const page = schema.pages[pageId]
            const isSelected = pageId === selectedPageId
            return (
              <div key={pageId} className="flex items-center">
                <button
                  type="button"
                  onClick={() => selectPage(pageId)}
                  className={cn(
                    'flex items-center px-3 py-1.5 text-xs font-medium rounded-md transition-colors',
                    isSelected
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  <span className="mr-1.5 opacity-70">Step {idx + 1}:</span>
                  <span>{page?.title || `Page ${idx + 1}`}</span>
                </button>
              </div>
            )
          })}

          <Button
            variant="ghost"
            size="sm"
            onClick={() => addPage()}
            className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
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
            className="h-7 w-7 text-destructive hover:bg-destructive/10"
            title="Delete current page"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>

      {/* Main Canvas Document Card */}
      <div className="w-full max-w-4xl bg-background border rounded-xl shadow-sm p-6 space-y-6">
        {/* Page Header Configuration */}
        <div className="border-b pb-4 space-y-2">
          <input
            type="text"
            value={currentPage.title}
            onChange={(e) => updatePage(currentPage.id, { title: e.target.value })}
            placeholder="Page Title"
            className="w-full text-xl font-bold bg-transparent focus:bg-accent/50 rounded px-1.5 py-0.5 outline-none"
          />
          <input
            type="text"
            value={currentPage.description || ''}
            onChange={(e) =>
              updatePage(currentPage.id, { description: e.target.value })
            }
            placeholder="Add an optional section description or instructions..."
            className="w-full text-sm text-muted-foreground bg-transparent focus:bg-accent/50 rounded px-1.5 py-0.5 outline-none"
          />
        </div>

        {/* Rows List */}
        <div className="space-y-4">
          {currentPage.rowIds.map((rowId, rIdx) => {
            const row = schema.rows[rowId]
            if (!row) return null

            return (
              <div
                key={rowId}
                className="group/row relative border border-dashed border-border/80 rounded-lg p-3 hover:border-primary/50 transition-colors bg-card"
              >
                {/* Row Controls */}
                <div className="absolute -top-3 right-3 opacity-0 group-hover/row:opacity-100 transition-opacity bg-background border rounded-md shadow-sm px-1 py-0.5 flex items-center space-x-1 z-10">
                  <span className="text-[10px] font-semibold text-muted-foreground px-1 uppercase">
                    Row
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={rIdx === 0}
                    onClick={() => moveRow(currentPage.id, rowId, rIdx - 1)}
                    className="h-5 w-5"
                  >
                    <ChevronUp className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={rIdx === currentPage.rowIds.length - 1}
                    onClick={() => moveRow(currentPage.id, rowId, rIdx + 1)}
                    className="h-5 w-5"
                  >
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeRow(rowId)}
                    className="h-5 w-5 text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>

                {/* Columns Grid with Droppable Columns */}
                <div className="grid grid-cols-12 gap-3">
                  {row.columnIds.map((colId) => {
                    const col = schema.columns[colId]
                    if (!col) return null

                    return (
                      <DroppableColumn
                        key={colId}
                        column={col}
                        fields={schema.fields}
                        selectedFieldId={selectedFieldId}
                        onSelectField={(fId) => selectField(fId)}
                        onDuplicateField={(fId) => duplicateField(fId)}
                        onRemoveField={(fId) => removeField(fId)}
                      />
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>

        {/* Add Row Controls Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between pt-2 border-t gap-2">
          <span className="text-xs font-medium text-muted-foreground flex items-center">
            <Columns className="h-3.5 w-3.5 mr-1.5" />
            Add Row Layout:
          </span>

          <div className="flex items-center space-x-1.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => addRow(currentPage.id, [12])}
              className="h-7 text-xs"
            >
              1 Column (Full)
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => addRow(currentPage.id, [6, 6])}
              className="h-7 text-xs"
            >
              2 Columns (1/2 + 1/2)
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => addRow(currentPage.id, [4, 4, 4])}
              className="h-7 text-xs"
            >
              3 Columns (1/3 each)
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => addRow(currentPage.id, [8, 4])}
              className="h-7 text-xs"
            >
              2 Columns (2/3 + 1/3)
            </Button>
          </div>
        </div>
      </div>
    </main>
  )
}
