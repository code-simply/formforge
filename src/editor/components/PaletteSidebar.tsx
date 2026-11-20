import React from 'react'
import { FIELD_REGISTRY } from '../registry'
import { useBuilderStore } from '../store/builderStore'
import { FieldType } from '../../core/types'
import { DraggablePaletteItem } from '../dnd/DraggablePaletteItem'

export const PaletteSidebar: React.FC = () => {
  const { addField, schema, selectedPageId } = useBuilderStore()

  const categories = [
    { id: 'input', label: 'Inputs & Text' },
    { id: 'choice', label: 'Selections & Choices' },
    { id: 'advanced', label: 'Advanced & Complex' },
    { id: 'layout', label: 'Layout & Content' },
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
    <aside className="w-64 border-r bg-card flex flex-col h-full overflow-hidden shrink-0">
      <div className="p-3 border-b">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Form Elements
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5">Drag to canvas or click to add</p>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-5">
        {categories.map((cat) => {
          const items = FIELD_REGISTRY.filter((f) => f.category === cat.id)
          if (items.length === 0) return null

          return (
            <div key={cat.id} className="space-y-2">
              <span className="text-xs font-medium text-muted-foreground">
                {cat.label}
              </span>
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
