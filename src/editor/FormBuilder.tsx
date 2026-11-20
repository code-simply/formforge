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
import { FormBuilderSchema, FormSubmissionRecord } from '../core/types'
import { remapFormPayload } from '../core/webhook'
import { useBuilderStore } from './store/builderStore'
import { HeaderBar } from './components/HeaderBar'
import { PaletteSidebar } from './components/PaletteSidebar'
import { Canvas } from './components/Canvas'
import { PropertiesPanel } from './components/PropertiesPanel'
import { SubmissionsDialog } from './components/SubmissionsDialog'
import { FormRenderer } from '../renderer/FormRenderer'
import { FIELD_REGISTRY } from './registry'
import { Button } from '../ui/button'
import { Layers, SlidersHorizontal, PlusSquare, CheckCircle2, Inbox } from 'lucide-react'
import { cn } from '../ui/utils'

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
    addSubmission,
  } = useBuilderStore()

  const [lastSubmission, setLastSubmission] = useState<FormSubmissionRecord | null>(null)
  const [inspectSubDialogOpen, setInspectSubDialogOpen] = useState(false)

  const [activeDragItem, setActiveDragItem] = useState<{
    type: 'palette-item' | 'canvas-field'
    label: string
    icon?: any
  } | null>(null)

  // Mobile & tablet navigation tab ('palette' | 'canvas' | 'properties')
  const [mobileTab, setMobileTab] = useState<'palette' | 'canvas' | 'properties'>('canvas')

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

  // When a field is selected on mobile, auto-switch to properties
  useEffect(() => {
    if (selectedFieldId && window.innerWidth < 1024) {
      setMobileTab('properties')
    }
  }, [selectedFieldId])

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
      <div className={cn('flex flex-col h-screen w-full overflow-hidden bg-background text-foreground', className)}>
        <HeaderBar />

        {previewMode ? (
          <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex justify-center bg-muted/20">
            <div className="w-full max-w-3xl space-y-4">
              {lastSubmission && (
                <div className="p-3.5 rounded-xl border bg-card shadow-sm space-y-2 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-foreground font-semibold text-xs">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>Form Response Captured Successfully!</span>
                    </div>
                    <span className="font-mono text-[11px] text-muted-foreground">
                      ID: {lastSubmission.id}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    This submission record has been captured in your session storage. You can inspect fields, check webhook statuses, and export to CSV or JSON.
                  </p>
                  <div className="flex items-center space-x-2 pt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setInspectSubDialogOpen(true)}
                      className="h-7 text-xs"
                    >
                      <Inbox className="h-3 w-3 mr-1" />
                      View in Submissions Manager
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setLastSubmission(null)}
                      className="h-7 text-xs text-muted-foreground"
                    >
                      Dismiss
                    </Button>
                  </div>
                </div>
              )}

              <FormRenderer
                schema={schema}
                onSubmit={(values) => {
                  const subRecord: FormSubmissionRecord = {
                    id: `sub_${Date.now()}`,
                    formId: schema.id,
                    formTitle: schema.title,
                    timestamp: new Date().toISOString(),
                    values,
                    remappedValues: schema.settings?.webhook?.enabled
                      ? remapFormPayload(
                          values,
                          schema.settings.webhook.keyMapping,
                          schema.settings.webhook.staticPayload
                        )
                      : undefined,
                    webhookStatus: schema.settings?.webhook?.enabled
                      ? {
                          attempted: true,
                          success: true,
                          status: 200,
                          message: 'Dispatched to endpoint',
                        }
                      : undefined,
                  }
                  addSubmission(subRecord)
                  setLastSubmission(subRecord)
                }}
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row flex-1 overflow-hidden relative">
            {/* Desktop: 3-Column Split View. Mobile/Tablet: Active Tab Display */}

            {/* Elements Palette */}
            <div
              className={cn(
                'h-full lg:flex',
                mobileTab === 'palette' ? 'flex flex-1 w-full' : 'hidden lg:flex'
              )}
            >
              <PaletteSidebar />
            </div>

            {/* Canvas */}
            <div
              className={cn(
                'h-full flex-1 overflow-hidden',
                mobileTab === 'canvas' ? 'flex flex-col w-full' : 'hidden lg:flex'
              )}
            >
              <Canvas />
            </div>

            {/* Properties Inspector */}
            <div
              className={cn(
                'h-full lg:flex',
                mobileTab === 'properties' ? 'flex flex-1 w-full' : 'hidden lg:flex'
              )}
            >
              <PropertiesPanel />
            </div>

            {/* Mobile / Tablet Segmented Tab Bar (Hidden on Desktop) */}
            <div className="lg:hidden border-t bg-card px-2 py-1.5 flex items-center justify-around shrink-0 z-20">
              <button
                type="button"
                onClick={() => setMobileTab('palette')}
                className={cn(
                  'flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors',
                  mobileTab === 'palette'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted'
                )}
              >
                <PlusSquare className="h-4 w-4" />
                <span>Elements</span>
              </button>

              <button
                type="button"
                onClick={() => setMobileTab('canvas')}
                className={cn(
                  'flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors',
                  mobileTab === 'canvas'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted'
                )}
              >
                <Layers className="h-4 w-4" />
                <span>Canvas</span>
              </button>

              <button
                type="button"
                onClick={() => setMobileTab('properties')}
                className={cn(
                  'flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors',
                  mobileTab === 'properties'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted'
                )}
              >
                <SlidersHorizontal className="h-4 w-4" />
                <span>Properties</span>
              </button>
            </div>
          </div>
        )}

        {/* Drag Overlay (Monochromatic) */}
        <DragOverlay>
          {activeDragItem ? (
            <div className="flex items-center space-x-2 px-3 py-2 rounded-md border-2 border-primary bg-background shadow-2xl text-xs font-semibold text-foreground pointer-events-none opacity-95">
              <DragIcon className="h-4 w-4" />
              <span>{activeDragItem.label}</span>
            </div>
          ) : null}
        </DragOverlay>

        <SubmissionsDialog
          isOpen={inspectSubDialogOpen}
          onClose={() => setInspectSubDialogOpen(false)}
          schema={schema}
        />
      </div>
    </DndContext>
  )
}
