import React from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { FormField } from '../../core/types'
import { Button } from '../../ui/button'
import { Badge } from '../../ui/badge'
import { FIELD_REGISTRY } from '../registry'
import { GripVertical, Copy, Trash2, Layers } from 'lucide-react'
import { cn } from '../../ui/utils'

export interface SortableFieldCardProps {
  field: FormField
  columnId: string
  isSelected: boolean
  onSelect: () => void
  onDuplicate: () => void
  onRemove: () => void
}

export const SortableFieldCard: React.FC<SortableFieldCardProps> = ({
  field,
  columnId,
  isSelected,
  onSelect,
  onDuplicate,
  onRemove,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: field.id,
    data: {
      type: 'canvas-field',
      fieldId: field.id,
      columnId,
    },
  })

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition,
  }

  const fieldDef = FIELD_REGISTRY.find((r) => r.type === field.type)
  const Icon = fieldDef?.icon || Layers

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={(e) => {
        e.stopPropagation()
        onSelect()
      }}
      className={cn(
        'group/field relative rounded-lg border bg-background p-2.5 sm:p-3 transition-all cursor-pointer shadow-sm select-none',
        isSelected
          ? 'border-foreground ring-1 ring-foreground/20 bg-muted/20'
          : 'hover:border-foreground/30',
        isDragging && 'opacity-30 border-dashed border-foreground'
      )}
    >
      {/* Field Header */}
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center space-x-1.5 sm:space-x-2 overflow-hidden">
          {/* Drag Handle */}
          <div
            {...attributes}
            {...listeners}
            onClick={(e) => e.stopPropagation()}
            className="cursor-grab active:cursor-grabbing text-muted-foreground/60 hover:text-foreground p-0.5 rounded shrink-0"
            title="Drag to reorder"
          >
            <GripVertical className="h-3.5 w-3.5" />
          </div>

          <Icon className="h-3.5 w-3.5 text-foreground shrink-0" />
          <span className="text-xs font-semibold text-foreground truncate">
            {field.label}
          </span>
          {field.required && (
            <span className="text-foreground/70 font-bold text-xs shrink-0">*</span>
          )}
          {field.conditions && field.conditions.length > 0 && (
            <Badge variant="outline" className="text-[9px] h-4 px-1 shrink-0 font-normal">
              Rule
            </Badge>
          )}
        </div>

        {/* Quick Actions */}
        <div className="opacity-80 sm:opacity-0 group-hover/field:opacity-100 flex items-center space-x-0.5 transition-opacity shrink-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation()
              onDuplicate()
            }}
            className="h-6 w-6 text-muted-foreground hover:text-foreground"
            title="Duplicate"
          >
            <Copy className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation()
              onRemove()
            }}
            className="h-6 w-6 text-muted-foreground hover:text-destructive"
            title="Delete"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Field Mock Preview */}
      <div className="text-[11px] text-muted-foreground/70 border border-border/70 rounded px-2.5 py-1 bg-muted/15 truncate font-normal">
        {field.placeholder || `[${field.type}]`}
      </div>
    </div>
  )
}
