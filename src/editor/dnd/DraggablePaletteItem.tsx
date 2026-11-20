import React from 'react'
import { useDraggable } from '@dnd-kit/core'
import { FieldDefinition } from '../registry'
import { Plus, GripVertical } from 'lucide-react'
import { cn } from '../../ui/utils'

export interface DraggablePaletteItemProps {
  item: FieldDefinition
  onClick: () => void
}

export const DraggablePaletteItem: React.FC<DraggablePaletteItemProps> = ({
  item,
  onClick,
}) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette_${item.type}`,
    data: {
      type: 'palette-item',
      fieldType: item.type,
    },
  })

  const Icon = item.icon

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'group flex items-center justify-between p-2 rounded-lg border border-border/70 bg-card hover:bg-accent/40 hover:border-foreground/30 text-left transition-all shadow-xs select-none',
        isDragging && 'opacity-40 border-foreground border-dashed ring-1 ring-foreground/20'
      )}
    >
      <div
        className="flex items-center space-x-2.5 flex-1 cursor-pointer overflow-hidden"
        onClick={onClick}
      >
        <div className="h-7 w-7 rounded-md bg-muted border border-border/80 text-foreground flex items-center justify-center group-hover:bg-foreground group-hover:text-background transition-colors shrink-0 shadow-2xs">
          <Icon className="h-3.5 w-3.5" />
        </div>
        <div className="truncate pr-1">
          <p className="text-xs font-semibold leading-none text-foreground truncate">
            {item.label}
          </p>
          <p className="text-[10px] text-muted-foreground mt-0.5 truncate">
            {item.description}
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-1 shrink-0">
        <button
          type="button"
          onClick={onClick}
          className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted opacity-0 group-hover:opacity-100 transition-opacity"
          title="Click to add to canvas"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>

        <div
          {...attributes}
          {...listeners}
          className="p-1 rounded cursor-grab active:cursor-grabbing text-muted-foreground/60 hover:text-foreground hover:bg-muted opacity-60 group-hover:opacity-100 transition-opacity"
          title="Drag onto canvas"
        >
          <GripVertical className="h-3.5 w-3.5" />
        </div>
      </div>
    </div>
  )
}
