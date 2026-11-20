import React, { useEffect, useState } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  closestCenter,
} from '@dnd-kit/core'
import { FormBuilderSchema } from '../core/types'
import { useBuilderStore } from './store/builderStore'
import { HeaderBar } from './components/HeaderBar'
import { PaletteSidebar } from './components/PaletteSidebar'
import { Canvas } from './components/Canvas'
import { PropertiesPanel } from './components/PropertiesPanel'
import { FormRenderer } from '../renderer/FormRenderer'
import { FIELD_REGISTRY } from './registry'
import { Layers } from 'lucide-react'

export interface FormBuilderProps {
  initialSchema?: FormBuilderSchema
  onChange?: (schema: FormBuilderSchema) => void
  className?: string
}

export const FormBuilder: React.FC<FormBuilderProps> = ({
  initialSchema,
  onChange,
  className,
}) => {
  const {
    schema,
    setSchema,
    previewMode,
    addField,
    moveField,
    undo,
    redo,
    selectedFieldId,
    selectField,
    removeField,
  } = useBuilderStore()

  const [activeDragItem, setActiveDragItem] = useState<{
    type: 'palette-item' | 'canvas-field'
    label: string
    icon?: any
  } | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor)
  )

  useEffect(() => {
    if (initialSchema) {
      setSchema(initialSchema)
    }
  }, [initialSchema, setSchema])

  useEffect(() => {
    if (onChange) {
      onChange(schema)
    }
  }, [schema, onChange])

  // Global Keyboard Shortcuts (Ctrl+Z, Ctrl+Y, Escape, Delete)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      const isInput =
        target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        if (!isInput) {
          e.preventDefault()
          if (e.shiftKey) {
            redo()
          } else {
            undo()
          }
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        if (!isInput) {
          e.preventDefault()
          redo()
        }
      } else if (e.key === 'Escape') {
        selectField(null)
      } else if (e.key === 'Delete' && !isInput && selectedFieldId) {
        removeField(selectedFieldId)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [undo, redo, selectField, removeField, selectedFieldId])

  const handleDragStart = (event: DragStartEvent) => {
    const data = event.active.data.current
    if (!data) return

    if (data.type === 'palette-item') {
      const fieldDef = FIELD_REGISTRY.find((f) => f.type === data.fieldType)
      setActiveDragItem({
        type: 'palette-item',
        label: fieldDef?.label || data.fieldType,
        icon: fieldDef?.icon || Layers,
      })
    } else if (data.type === 'canvas-field') {
      const field = schema.fields[data.fieldId]
      const fieldDef = field ? FIELD_REGISTRY.find((f) => f.type === field.type) : null
      setActiveDragItem({
        type: 'canvas-field',
        label: field?.label || 'Field',
        icon: fieldDef?.icon || Layers,
      })
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveDragItem(null)

    if (!over) return

    const activeData = active.data.current
    const overData = over.data.current
    if (!activeData || !overData) return

    // Case 1: Palette item dropped onto canvas
    if (activeData.type === 'palette-item') {
      const fieldType = activeData.fieldType

      if (overData.type === 'column') {
        const columnId = overData.columnId
        addField(columnId, fieldType)
      } else if (overData.type === 'canvas-field') {
        const targetColId = overData.columnId
        const targetCol = schema.columns[targetColId]
        if (targetCol) {
          const targetIndex = targetCol.fieldIds.indexOf(overData.fieldId)
          addField(targetColId, fieldType, targetIndex >= 0 ? targetIndex : undefined)
        }
      }
      return
    }

    // Case 2: Existing canvas field reordered or moved
    if (activeData.type === 'canvas-field') {
      const sourceColId = activeData.columnId
      const sourceFieldId = activeData.fieldId

      if (overData.type === 'canvas-field') {
        const targetColId = overData.columnId
        const targetCol = schema.columns[targetColId]
        if (!targetCol) return

        const newIndex = targetCol.fieldIds.indexOf(overData.fieldId)
        if (newIndex !== -1) {
          moveField(sourceColId, targetColId, sourceFieldId, newIndex)
        }
      } else if (overData.type === 'column') {
        const targetColId = overData.columnId
        const targetCol = schema.columns[targetColId]
        if (!targetCol) return

        const newIndex = targetCol.fieldIds.length
        moveField(sourceColId, targetColId, sourceFieldId, newIndex)
      }
    }
  }

  const DragIcon = activeDragItem?.icon || Layers

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className={`flex flex-col h-screen w-full overflow-hidden bg-background ${className || ''}`}>
        <HeaderBar />

        {previewMode ? (
          <div className="flex-1 overflow-y-auto p-8 flex justify-center bg-muted/40">
            <div className="w-full max-w-3xl">
              <FormRenderer
                schema={schema}
                onSubmit={(values) => {
                  alert(`Form submitted successfully!\n\nValues:\n${JSON.stringify(values, null, 2)}`)
                }}
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-1 overflow-hidden">
            <PaletteSidebar />
            <Canvas />
            <PropertiesPanel />
          </div>
        )}

        <DragOverlay>
          {activeDragItem ? (
            <div className="flex items-center space-x-2 px-3 py-2 rounded-md border-2 border-primary bg-background shadow-xl text-xs font-semibold text-primary pointer-events-none opacity-90">
              <DragIcon className="h-4 w-4" />
              <span>{activeDragItem.label}</span>
            </div>
          ) : null}
        </DragOverlay>
      </div>
    </DndContext>
  )
}
