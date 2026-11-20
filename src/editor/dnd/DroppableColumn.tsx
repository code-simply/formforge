import React from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { FormColumn, FormField } from '../../core/types'
import { SortableFieldCard } from './SortableFieldCard'
import { ColumnResizeHandle } from '../components/ColumnResizeHandle'
import { Trash2, Columns2, Columns3, FoldHorizontal } from 'lucide-react'
import { cn } from '../../ui/utils'

export interface DroppableColumnProps {
  column: FormColumn
  nextColumn?: FormColumn
  columns: Record<string, FormColumn>
  fields: Record<string, FormField>
  selectedFieldId: string | null
  canRemove?: boolean
  isSubColumn?: boolean
  onSelectField: (id: string) => void
  onDuplicateField: (id: string) => void
  onRemoveField: (id: string) => void
  onResizeAdjacent?: (leftWidth: number, rightWidth: number) => void
  onRemoveColumn?: () => void
  onSplitColumn?: (columnId: string, count: number) => void
  onUnsplitColumn?: (columnId: string) => void
  onSetSubColumnWidths?: (parentColId: string, widths: number[]) => void
}

export const DroppableColumn: React.FC<DroppableColumnProps> = ({
  column,
  nextColumn,
  columns,
  fields,
  selectedFieldId,
  canRemove,
  isSubColumn,
  onSelectField,
  onDuplicateField,
  onRemoveField,
  onResizeAdjacent,
  onRemoveColumn,
  onSplitColumn,
  onUnsplitColumn,
  onSetSubColumnWidths,
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `col_${column.id}`,
    data: {
      type: 'column',
      columnId: column.id,
    },
  })

  const span = Math.min(Math.max(column.width || 12, 1), 12)
  const colSpanClass =
    span === 1
      ? 'col-span-12 sm:col-span-1'
      : span === 2
      ? 'col-span-12 sm:col-span-2'
      : span === 3
      ? 'col-span-12 sm:col-span-3'
      : span === 4
      ? 'col-span-12 sm:col-span-4'
      : span === 5
      ? 'col-span-12 sm:col-span-5'
      : span === 6
      ? 'col-span-12 sm:col-span-6'
      : span === 7
      ? 'col-span-12 sm:col-span-7'
      : span === 8
      ? 'col-span-12 sm:col-span-8'
      : span === 9
      ? 'col-span-12 sm:col-span-9'
      : span === 10
      ? 'col-span-12 sm:col-span-10'
      : span === 11
      ? 'col-span-12 sm:col-span-11'
      : 'col-span-12'

  const hasSubColumns = Boolean(column.columnIds && column.columnIds.length > 0)

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'relative min-h-[85px] rounded-lg border border-dashed p-2 flex flex-col space-y-2 transition-all group/column',
        colSpanClass,
        isSubColumn ? 'bg-background/80 border-border/80' : 'bg-muted/10 border-border',
        isOver
          ? 'border-foreground/80 bg-muted/40 ring-1 ring-foreground/20'
          : ''
      )}
    >
      {/* Column Width & Action Bar */}
      <div className="flex items-center justify-between text-[10px] text-muted-foreground pb-1 px-1 border-b border-border/40 opacity-75 group-hover/column:opacity-100 transition-opacity select-none">
        <div className="flex items-center space-x-1.5 truncate">
          <span className="font-mono font-medium text-foreground/80">
            {isSubColumn ? 'Sub-Col' : 'Col'} {span}/12 ({Math.round((span / 12) * 100)}%)
          </span>
          {hasSubColumns && (
            <span className="text-[9px] uppercase px-1 py-0.2 rounded bg-muted font-mono font-semibold text-foreground/70">
              {column.columnIds!.length} Sub-Cols
            </span>
          )}
        </div>

        <div className="flex items-center space-x-1 shrink-0">
          {/* If already split, allow merging back */}
          {hasSubColumns && onUnsplitColumn && (
            <button
              type="button"
              onClick={() => onUnsplitColumn(column.id)}
              className="text-[10px] px-1.5 py-0.5 rounded border border-border/70 hover:bg-muted font-medium text-muted-foreground hover:text-foreground flex items-center space-x-1 transition-colors"
              title="Merge sub-columns back into single column"
            >
              <FoldHorizontal className="h-3 w-3" />
              <span>Merge</span>
            </button>
          )}

          {/* If NOT split, allow splitting into 2 or 3 sub-columns */}
          {!hasSubColumns && !isSubColumn && onSplitColumn && (
            <div className="flex items-center space-x-0.5">
              <button
                type="button"
                onClick={() => onSplitColumn(column.id, 2)}
                className="text-[10px] font-medium px-1.5 py-0.5 rounded border border-border/60 hover:bg-muted text-muted-foreground hover:text-foreground flex items-center gap-0.5 transition-colors"
                title="Split this column into 2 sub-columns (50/50)"
              >
                <Columns2 className="h-3 w-3" />
                <span>Split 2</span>
              </button>
              <button
                type="button"
                onClick={() => onSplitColumn(column.id, 3)}
                className="text-[10px] font-medium px-1.5 py-0.5 rounded border border-border/60 hover:bg-muted text-foreground bg-accent/50 flex items-center gap-0.5 transition-colors font-semibold"
                title="Split this column into 3 sub-columns (1/3 each)"
              >
                <Columns3 className="h-3 w-3" />
                <span>Split 3</span>
              </button>
            </div>
          )}

          {canRemove && onRemoveColumn && (
            <button
              type="button"
              onClick={onRemoveColumn}
              className="text-muted-foreground hover:text-destructive p-0.5 rounded hover:bg-destructive/10 transition-colors"
              title="Delete this column"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      {/* BODY: If Column has Sub-Columns, render nested grid */}
      {hasSubColumns ? (
        <div className="canvas-row-grid grid grid-cols-12 gap-2 w-full pt-1">
          {column.columnIds!.map((subColId, sIdx) => {
            const subCol = columns[subColId]
            if (!subCol) return null
            const nextSubColId = column.columnIds![sIdx + 1]
            const nextSubCol = nextSubColId ? columns[nextSubColId] : undefined

            return (
              <DroppableColumn
                key={subColId}
                column={subCol}
                nextColumn={nextSubCol}
                columns={columns}
                fields={fields}
                selectedFieldId={selectedFieldId}
                canRemove={false}
                isSubColumn={true}
                onSelectField={onSelectField}
                onDuplicateField={onDuplicateField}
                onRemoveField={onRemoveField}
                onResizeAdjacent={(newLeft, newRight) => {
                  const currentSubWidths = column.columnIds!.map((id) => columns[id]?.width || 4)
                  currentSubWidths[sIdx] = newLeft
                  currentSubWidths[sIdx + 1] = newRight
                  onSetSubColumnWidths?.(column.id, currentSubWidths)
                }}
              />
            )
          })}
        </div>
      ) : (
        /* Standard Fields List inside this column */
        <SortableContext
          items={column.fieldIds}
          strategy={verticalListSortingStrategy}
        >
          {column.fieldIds.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-3 text-center rounded text-muted-foreground/60 select-none">
              <p className="text-[11px] font-medium text-foreground/60">Empty Column</p>
              <p className="text-[10px] text-muted-foreground">Drop form elements here</p>
            </div>
          ) : (
            column.fieldIds.map((fId) => {
              const field = fields[fId]
              if (!field) return null

              return (
                <SortableFieldCard
                  key={fId}
                  field={field}
                  columnId={column.id}
                  isSelected={selectedFieldId === fId}
                  onSelect={() => onSelectField(fId)}
                  onDuplicate={() => onDuplicateField(fId)}
                  onRemove={() => onRemoveField(fId)}
                />
              )
            })
          )}
        </SortableContext>
      )}

      {/* Interactive Drag Resize Handle between this column and its right neighbor */}
      {nextColumn && onResizeAdjacent && (
        <ColumnResizeHandle
          leftColumn={column}
          rightColumn={nextColumn}
          onResize={onResizeAdjacent}
        />
      )}
    </div>
  )
}
