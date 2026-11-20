import React from 'react'
import { FIELD_REGISTRY } from '../registry'
import { useBuilderStore } from '../store/builderStore'
import { FieldType } from '../../core/types'
import { DraggablePaletteItem } from '../dnd/DraggablePaletteItem'
import { Type, CheckSquare, SlidersHorizontal, LayoutTemplate, Sparkles } from 'lucide-react'

export const PaletteSidebar: React.FC = () => {
  const { addField, schema, selectedPageId } = useBuilderStore()

  const categories = [
    { id: 'input', label: 'Inputs & Text', icon: Type },
    { id: 'choice', label: 'Selections & Choices', icon: CheckSquare },
    { id: 'advanced', label: 'Advanced & Complex', icon: SlidersHorizontal },
    { id: 'layout', label: 'Layout & Content', icon: LayoutTemplate },
  ]

  // Add field to the first available column of active page
  const handleAddField = (type: FieldType) => {
    const page = schema.pages[selectedPageId] || schema.pages[schema.pageOrder[0]]
    if (!page || page.rowIds.length === 0) return

    const firstRow = schema.rows[page.rowIds[0]]
    if (!firstRow || firstRow.columnIds.length === 0) return

    const firstColId = firstRow.columnIds[0]
    addField(firstColId, type)
  }

  return (
    <aside className="w-full lg:w-64 border-r bg-card flex flex-col h-full overflow-hidden shrink-0 select-none">
      <div className="p-3 border-b bg-muted/20">
        <div className="flex items-center space-x-1.5">
          <Sparkles className="h-3.5 w-3.5 text-foreground" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground">
            Component Library
          </h3>
        </div>
        <p className="text-[11px] text-muted-foreground mt-0.5">Drag to canvas or click to add</p>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {categories.map((cat) => {
          const items = FIELD_REGISTRY.filter((f) => f.category === cat.id)
          if (items.length === 0) return null
          const CatIcon = cat.icon

          return (
            <div key={cat.id} className="space-y-1.5">
              <div className="flex items-center space-x-1.5 px-0.5 text-muted-foreground">
                <CatIcon className="h-3.5 w-3.5" />
                <span className="text-[11px] font-semibold uppercase tracking-wider">
                  {cat.label}
                </span>
              </div>
              <div className="grid grid-cols-1 gap-1.5">
                {items.map((item) => (
                  <DraggablePaletteItem
                    key={item.type}
                    item={item}
                    onClick={() => handleAddField(item.type)}
                  />
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </aside>
  )
}
