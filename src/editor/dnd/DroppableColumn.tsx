import React from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { FormColumn, FormField } from '../../core/types'
import { SortableFieldCard } from './SortableFieldCard'
import { cn } from '../../ui/utils'

export interface DroppableColumnProps {
  column: FormColumn
  fields: Record<string, FormField>
  selectedFieldId: string | null
  onSelectField: (id: string) => void
  onDuplicateField: (id: string) => void
  onRemoveField: (id: string) => void
}

export const DroppableColumn: React.FC<DroppableColumnProps> = ({
  column,
  fields,
  selectedFieldId,
  onSelectField,
  onDuplicateField,
  onRemoveField,
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
        'min-h-[75px] rounded-lg border border-dashed p-2 flex flex-col space-y-2 transition-all',
        colSpanClass,
        isOver
          ? 'border-foreground/80 bg-muted/40 ring-1 ring-foreground/20'
          : 'border-border bg-muted/10'
      )}
    >
      <SortableContext
        items={column.fieldIds}
        strategy={verticalListSortingStrategy}
      >
        {column.fieldIds.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-2.5 text-center rounded text-muted-foreground/60 select-none">
            <p className="text-[11px] font-medium text-foreground/70">Column ({column.width}/12)</p>
            <p className="text-[10px] text-muted-foreground">Drop elements here</p>
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
    </div>
  )
}
