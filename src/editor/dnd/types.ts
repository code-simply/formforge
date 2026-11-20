import { FieldType } from '../../core/types'

export interface PaletteDragData {
  type: 'palette-item'
  fieldType: FieldType
}

export interface FieldDragData {
  type: 'canvas-field'
  fieldId: string
  columnId: string
}

export type DragData = PaletteDragData | FieldDragData
