import React from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { FormField } from '../../core/types'
import { useBuilderStore } from '../store/builderStore'
import { DroppableColumn } from './DroppableColumn'
import { Button } from '../../ui/button'
import { Badge } from '../../ui/badge'
import { FIELD_REGISTRY } from '../registry'
import {
  GripVertical,
  Copy,
  Trash2,
  Layers,
  Plus,
  Sliders,
  AlignLeft,
  AlignCenter,
  AlignRight,
  GitBranch,
} from 'lucide-react'
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
    schema,
    selectedFieldId,
    selectField,
    removeField,
    duplicateField,
    updateField,
    setRowLayoutColumnWidths,
    addRowLayoutColumn,
    removeRowLayoutColumn,
    splitColumn,
    unsplitColumn,
    setSubColumnWidths,
  } = useBuilderStore()

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

  // If this field is a nested Row Layout component
  if (field.type === 'row-layout') {
    const childColIds = field.rowLayoutConfig?.columnIds || []
    const colCount = childColIds.length
    const colWidths = childColIds.map((cId) => schema.columns[cId]?.width || 6)

    return (
      <div
        ref={setNodeRef}
        style={style}
        onClick={(e) => {
          e.stopPropagation()
          onSelect()
        }}
        className={cn(
          'group/nested-row relative rounded-lg border border-dashed p-2.5 sm:p-3 transition-all cursor-pointer shadow-xs select-none my-1.5',
          isSelected
            ? 'border-foreground ring-1 ring-foreground/20 bg-muted/20'
            : 'border-border/80 hover:border-foreground/40 bg-card/60',
          isDragging && 'opacity-30 border-dashed border-foreground'
        )}
      >
        {/* Floating Row Control Toolbar on Top Right */}
        <div className="absolute -top-3.5 right-2 sm:right-3 opacity-95 sm:opacity-0 group-hover/nested-row:opacity-100 transition-opacity bg-background border rounded-md shadow-md px-1 py-0.5 flex items-center space-x-0.5 z-20">
          <span className="text-[9px] font-semibold text-muted-foreground px-1 uppercase tracking-wider">
            ROW
          </span>

          {/* Add Column Button (up to 6 columns) */}
          {colCount < 6 && (
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation()
                addRowLayoutColumn(field.id)
              }}
              className="h-6 w-6 text-muted-foreground hover:text-foreground"
              title="Add column to this nested row"
            >
              <Plus className="h-3 w-3" />
            </Button>
          )}

          {/* Quick Layout Presets for 2 columns */}
          {colCount === 2 && (
            <div className="flex items-center space-x-0.5 border-x px-1">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  setRowLayoutColumnWidths(field.id, [6, 6])
                }}
                className={cn(
                  'text-[9px] font-mono px-1 py-0.5 rounded',
                  colWidths[0] === 6 && colWidths[1] === 6
                    ? 'bg-foreground text-background font-bold'
                    : 'text-muted-foreground hover:bg-muted'
                )}
                title="50% / 50%"
              >
                6:6
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  setRowLayoutColumnWidths(field.id, [4, 8])
                }}
                className={cn(
                  'text-[9px] font-mono px-1 py-0.5 rounded',
                  colWidths[0] === 4 && colWidths[1] === 8
                    ? 'bg-foreground text-background font-bold'
                    : 'text-muted-foreground hover:bg-muted'
                )}
                title="33% / 67%"
              >
                4:8
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  setRowLayoutColumnWidths(field.id, [8, 4])
                }}
                className={cn(
                  'text-[9px] font-mono px-1 py-0.5 rounded',
                  colWidths[0] === 8 && colWidths[1] === 4
                    ? 'bg-foreground text-background font-bold'
                    : 'text-muted-foreground hover:bg-muted'
                )}
                title="67% / 33%"
              >
                8:4
              </button>
            </div>
          )}

          {/* Quick Layout Presets for 3 columns */}
          {colCount === 3 && (
            <div className="flex items-center space-x-0.5 border-x px-1">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  setRowLayoutColumnWidths(field.id, [4, 4, 4])
                }}
                className={cn(
                  'text-[9px] font-mono px-1 py-0.5 rounded',
                  colWidths[0] === 4 && colWidths[1] === 4 && colWidths[2] === 4
                    ? 'bg-foreground text-background font-bold'
                    : 'text-muted-foreground hover:bg-muted'
                )}
                title="33% / 33% / 33%"
              >
                4:4:4
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  setRowLayoutColumnWidths(field.id, [3, 6, 3])
                }}
                className={cn(
                  'text-[9px] font-mono px-1 py-0.5 rounded',
                  colWidths[0] === 3 && colWidths[1] === 6 && colWidths[2] === 3
                    ? 'bg-foreground text-background font-bold'
                    : 'text-muted-foreground hover:bg-muted'
                )}
                title="25% / 50% / 25%"
              >
                3:6:3
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  setRowLayoutColumnWidths(field.id, [6, 3, 3])
                }}
                className={cn(
                  'text-[9px] font-mono px-1 py-0.5 rounded',
                  colWidths[0] === 6 && colWidths[1] === 3 && colWidths[2] === 3
                    ? 'bg-foreground text-background font-bold'
                    : 'text-muted-foreground hover:bg-muted'
                )}
                title="50% / 25% / 25%"
              >
                6:3:3
              </button>
            </div>
          )}

          {/* Quick Layout Presets for 4 columns */}
          {colCount === 4 && (
            <div className="flex items-center space-x-0.5 border-x px-1">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  setRowLayoutColumnWidths(field.id, [3, 3, 3, 3])
                }}
                className={cn(
                  'text-[9px] font-mono px-1 py-0.5 rounded',
                  colWidths.every((w) => w === 3)
                    ? 'bg-foreground text-background font-bold'
                    : 'text-muted-foreground hover:bg-muted'
                )}
                title="25% each"
              >
                3:3:3:3
              </button>
            </div>
          )}

          {/* Configure / Select */}
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation()
              onSelect()
            }}
            className="h-6 w-6 text-muted-foreground hover:text-foreground"
            title="Row Properties"
          >
            <Sliders className="h-3 w-3" />
          </Button>

          {/* Duplicate Row */}
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation()
              onDuplicate()
            }}
            className="h-6 w-6 text-muted-foreground hover:text-foreground"
            title="Duplicate Row"
          >
            <Copy className="h-3 w-3" />
          </Button>

          {/* Drag handle */}
          <div
            {...attributes}
            {...listeners}
            onClick={(e) => e.stopPropagation()}
            className="cursor-grab active:cursor-grabbing text-muted-foreground/70 hover:text-foreground p-1 rounded"
            title="Drag to move Row"
          >
            <GripVertical className="h-3.5 w-3.5" />
          </div>

          {/* Delete Row */}
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation()
              onRemove()
            }}
            className="h-6 w-6 text-muted-foreground hover:text-destructive"
            title="Delete Row"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>

        {/* Fieldset / Legend title if configured */}
        {(field.rowLayoutConfig?.fieldset || field.rowLayoutConfig?.legend) && (
          <div className="flex items-center space-x-2 mb-2 pb-1 border-b border-border/40">
            <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground px-1.5 py-0.5 rounded bg-muted">
              Legend
            </span>
            <span className="text-xs font-semibold text-foreground">
              {field.rowLayoutConfig.legend || field.label}
            </span>
          </div>
        )}

        {/* Columns Grid with Droppable Columns */}
        {(() => {
          const nestedGapClass =
            field.rowLayoutConfig?.gap === 'none'
              ? 'gap-0'
              : field.rowLayoutConfig?.gap === 'sm'
              ? 'gap-2'
              : field.rowLayoutConfig?.gap === 'lg'
              ? 'gap-6'
              : field.rowLayoutConfig?.gap === 'xl'
              ? 'gap-8'
              : 'gap-2'

          const nestedAlignClass =
            field.rowLayoutConfig?.alignItems === 'top'
              ? 'items-start'
              : field.rowLayoutConfig?.alignItems === 'center'
              ? 'items-center'
              : field.rowLayoutConfig?.alignItems === 'bottom'
              ? 'items-end'
              : 'items-stretch'

          return (
            <div className={cn('canvas-row-grid grid grid-cols-12 w-full pt-1', nestedGapClass, nestedAlignClass)}>
              {childColIds.map((cId, idx) => {
                const col = schema.columns[cId]
                if (!col) return null
                const nextColId = childColIds[idx + 1]
                const nextCol = nextColId ? schema.columns[nextColId] : undefined

                return (
                  <DroppableColumn
                    key={cId}
                    column={col}
                    nextColumn={nextCol}
                    columns={schema.columns}
                    fields={schema.fields}
                    selectedFieldId={selectedFieldId}
                    canRemove={childColIds.length > 1}
                    isSubColumn={true}
                    onSelectField={selectField}
                    onDuplicateField={duplicateField}
                    onRemoveField={removeField}
                    onRemoveColumn={() => removeRowLayoutColumn(field.id, cId)}
                    onResizeAdjacent={(newLeft, newRight) => {
                      const nextWidths = childColIds.map((id) => schema.columns[id]?.width || 6)
                      nextWidths[idx] = newLeft
                      nextWidths[idx + 1] = newRight
                      setRowLayoutColumnWidths(field.id, nextWidths)
                    }}
                    onSplitColumn={splitColumn}
                    onUnsplitColumn={unsplitColumn}
                    onSetSubColumnWidths={setSubColumnWidths}
                  />
                )
              })}
            </div>
          )
        })()}
      </div>
    )
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
        <div className="flex items-center space-x-1.5 sm:space-x-2 overflow-hidden flex-1">
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

          <div className="h-6 w-6 rounded bg-muted/80 border border-border/80 flex items-center justify-center text-foreground shrink-0 shadow-2xs">
            <Icon className="h-3 w-3" />
          </div>

          <span className="text-xs font-semibold text-foreground truncate">
            {field.label}
          </span>

          <span className="text-[9px] uppercase font-mono px-1 py-0.2 rounded bg-muted/70 text-muted-foreground font-semibold shrink-0">
            {field.type}
          </span>

          {field.required && (
            <span className="text-foreground/80 font-bold text-xs shrink-0" title="Required field">*</span>
          )}

          {field.conditions && field.conditions.length > 0 && (
            <Badge variant="outline" className="text-[9px] h-4 px-1 shrink-0 font-normal flex items-center gap-0.5">
              <GitBranch className="h-2.5 w-2.5" />
              <span>Rule</span>
            </Badge>
          )}
        </div>

        {/* Quick Actions & Positioning */}
        <div className="opacity-80 sm:opacity-0 group-hover/field:opacity-100 flex items-center space-x-0.5 transition-opacity shrink-0">
          {/* Quick Field Alignment Toggles */}
          <div className="flex items-center space-x-0.5 border-r pr-1 mr-0.5 border-border/50">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                updateField(field.id, { textAlign: 'left', elementAlign: 'left' })
              }}
              className={cn(
                'p-1 rounded transition-colors',
                (!field.textAlign || field.textAlign === 'left')
                  ? 'bg-foreground text-background shadow-2xs font-bold'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              )}
              title="Align Left"
            >
              <AlignLeft className="h-2.5 w-2.5" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                updateField(field.id, { textAlign: 'center', elementAlign: 'center' })
              }}
              className={cn(
                'p-1 rounded transition-colors',
                field.textAlign === 'center'
                  ? 'bg-foreground text-background shadow-2xs font-bold'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              )}
              title="Align Center"
            >
              <AlignCenter className="h-2.5 w-2.5" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                updateField(field.id, { textAlign: 'right', elementAlign: 'right' })
              }}
              className={cn(
                'p-1 rounded transition-colors',
                field.textAlign === 'right'
                  ? 'bg-foreground text-background shadow-2xs font-bold'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              )}
              title="Align Right"
            >
              <AlignRight className="h-2.5 w-2.5" />
            </button>
          </div>

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
