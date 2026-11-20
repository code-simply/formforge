import React from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { FormColumn, FormField } from '../../core/types'
import { SortableFieldCard } from './SortableFieldCard'
import { ColumnResizeHandle } from '../components/ColumnResizeHandle'
import { Trash2 } from 'lucide-react'
import { cn } from '../../ui/utils'

export interface DroppableColumnProps {
  column: FormColumn
  nextColumn?: FormColumn
  fields: Record<string, FormField>
  selectedFieldId: string | null
  canRemove?: boolean
  onSelectField: (id: string) => void
  onDuplicateField: (id: string) => void
  onRemoveField: (id: string) => void
  onResizeAdjacent?: (leftWidth: number, rightWidth: number) => void
  onRemoveColumn?: () => void
}

export const DroppableColumn: React.FC<DroppableColumnProps> = ({
  column,
  nextColumn,
  fields,
  selectedFieldId,
  canRemove,
  onSelectField,
  onDuplicateField,
  onRemoveField,
  onResizeAdjacent,
  onRemoveColumn,
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

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'relative min-h-[85px] rounded-lg border border-dashed p-2 flex flex-col space-y-2 transition-all group/column',
        colSpanClass,
        isOver
          ? 'border-foreground/80 bg-muted/40 ring-1 ring-foreground/20'
          : 'border-border bg-muted/10'
      )}
    >
      {/* Column Width & Action Bar */}
      <div className="flex items-center justify-between text-[10px] text-muted-foreground pb-1 px-1 border-b border-border/40 opacity-70 group-hover/column:opacity-100 transition-opacity select-none">
        <span className="font-mono font-medium text-foreground/80">
          Col {span}/12 ({Math.round((span / 12) * 100)}%)
        </span>

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

      {/* Sortable Field Items */}
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
