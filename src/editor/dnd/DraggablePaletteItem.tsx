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
        'group flex items-center justify-between p-2 rounded-md border border-border/60 bg-background hover:bg-accent hover:border-primary/50 text-left transition-all shadow-sm select-none',
        isDragging && 'opacity-40 border-primary border-dashed'
      )}
    >
      <div
        className="flex items-center space-x-2.5 flex-1 cursor-pointer"
        onClick={onClick}
      >
        <div className="p-1 rounded bg-muted group-hover:bg-primary/10 group-hover:text-primary transition-colors">
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <p className="text-xs font-medium leading-none text-foreground">
            {item.label}
          </p>
          <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">
            {item.description}
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-1">
        <button
          type="button"
          onClick={onClick}
          className="p-1 text-muted-foreground hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity"
          title="Click to add to canvas"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>

        <div
          {...attributes}
          {...listeners}
          className="p-1 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground opacity-60 group-hover:opacity-100"
          title="Drag onto canvas"
        >
          <GripVertical className="h-3.5 w-3.5" />
        </div>
      </div>
    </div>
  )
}
