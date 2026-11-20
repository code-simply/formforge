import { create } from 'zustand'
import {
  FieldType,
  FormBuilderSchema,
  FormField,
  FormPage,
  FormSettings,
} from '../../core/types'
import {
  FormRow,
} from '../../core/types'
import {
  addFieldToColumn,
  addPage,
  addRow,
  createEmptySchema,
  duplicateField,
  removeField,
  removePage,
  removeRow,
  setRowColumnWidths,
  addColumnToRow,
  removeColumnFromRow,
  updateRow,
  duplicateRow,
  splitColumn,
  unsplitColumn,
  setSubColumnWidths,
  setRowLayoutColumnWidths,
  addRowLayoutColumn,
  removeRowLayoutColumn,
} from '../../core/normalizer'

export interface BuilderState {
  schema: FormBuilderSchema
  selectedFieldId: string | null
  selectedPageId: string
  activeTab: 'palette' | 'properties'
  previewMode: boolean
  history: FormBuilderSchema[]
  future: FormBuilderSchema[]

  // Actions
  setSchema: (schema: FormBuilderSchema) => void
  selectField: (fieldId: string | null) => void
  selectPage: (pageId: string) => void
  setPreviewMode: (enabled: boolean) => void
  setActiveTab: (tab: 'palette' | 'properties') => void

  updateField: (fieldId: string, partial: Partial<FormField>) => void
  addField: (columnId: string, type: FieldType, index?: number) => string
  removeField: (fieldId: string) => void
  duplicateField: (fieldId: string) => void
  moveField: (
    sourceColId: string,
    targetColId: string,
    fieldId: string,
    newIndex: number
  ) => void

  addRow: (pageId: string, columnWidths?: number[], index?: number) => void
  removeRow: (rowId: string) => void
  moveRow: (pageId: string, rowId: string, newIndex: number) => void
  updateRow: (rowId: string, partial: Partial<FormRow>) => void
  duplicateRow: (pageId: string, rowId: string) => void
  setRowColumnWidths: (rowId: string, widths: number[]) => void
  addColumnToRow: (rowId: string) => void
  removeColumnFromRow: (rowId: string, columnId: string) => void
  splitColumn: (columnId: string, count?: number) => void
  unsplitColumn: (columnId: string) => void
  setSubColumnWidths: (parentColId: string, widths: number[]) => void
  setRowLayoutColumnWidths: (fieldId: string, widths: number[]) => void
  addRowLayoutColumn: (fieldId: string) => void
  removeRowLayoutColumn: (fieldId: string, columnId: string) => void

  addPage: (title?: string) => void
  removePage: (pageId: string) => void
  updatePage: (pageId: string, partial: Partial<FormPage>) => void
  updateSettings: (partial: Partial<FormSettings>) => void

  undo: () => void
  redo: () => void
  clear: () => void
}

const MAX_HISTORY = 30

export const useBuilderStore = create<BuilderState>((set, get) => {
  const initial = createEmptySchema('My Modern Form')
  const initialPageId = initial.pageOrder[0]

  const pushHistory = (currentSchema: FormBuilderSchema) => {
    const { history } = get()
    return {
      history: [...history.slice(-MAX_HISTORY), JSON.parse(JSON.stringify(currentSchema))],
      future: [],
    }
  }

  return {
    schema: initial,
    selectedFieldId: null,
    selectedPageId: initialPageId,
    activeTab: 'palette',
    previewMode: false,
    history: [],
    future: [],

    setSchema: (schema) => {
      set({
        schema,
        selectedFieldId: null,
        selectedPageId: schema.pageOrder[0] || '',
        history: [],
        future: [],
      })
    },

    selectField: (fieldId) => {
      set({
        selectedFieldId: fieldId,
        activeTab: fieldId ? 'properties' : 'palette',
      })
    },

    selectPage: (pageId) => {
      set({ selectedPageId: pageId, selectedFieldId: null })
    },

    setPreviewMode: (enabled) => {
      set({ previewMode: enabled, selectedFieldId: null })
    },

    setActiveTab: (tab) => {
      set({ activeTab: tab })
    },

    updateField: (fieldId, partial) => {
      const { schema } = get()
      const current = schema.fields[fieldId]
      if (!current) return

      const nextSchema = {
        ...schema,
        fields: {
          ...schema.fields,
          [fieldId]: {
            ...current,
            ...partial,
          },
        },
      }

      set({
        schema: nextSchema,
        ...pushHistory(schema),
      })
    },

    addField: (columnId, type, index) => {
      const { schema } = get()
      const { schema: nextSchema, newFieldId } = addFieldToColumn(
        schema,
        columnId,
        type,
        index
      )

      set({
        schema: nextSchema,
        selectedFieldId: newFieldId,
        activeTab: 'properties',
        ...pushHistory(schema),
      })

      return newFieldId
    },

    removeField: (fieldId) => {
      const { schema, selectedFieldId } = get()
      const nextSchema = removeField(schema, fieldId)

      set({
        schema: nextSchema,
        selectedFieldId: selectedFieldId === fieldId ? null : selectedFieldId,
        activeTab: selectedFieldId === fieldId ? 'palette' : get().activeTab,
        ...pushHistory(schema),
      })
    },

    duplicateField: (fieldId) => {
      const { schema } = get()
      const nextSchema = duplicateField(schema, fieldId)
      set({
        schema: nextSchema,
        ...pushHistory(schema),
      })
    },

    moveField: (sourceColId, targetColId, fieldId, newIndex) => {
      const { schema } = get()
      const sourceCol = schema.columns[sourceColId]
      const targetCol = schema.columns[targetColId]
      if (!sourceCol || !targetCol) return

      const nextSourceFields = sourceCol.fieldIds.filter((id) => id !== fieldId)
      const nextTargetFields =
        sourceColId === targetColId
          ? [...nextSourceFields]
          : [...targetCol.fieldIds]

      nextTargetFields.splice(newIndex, 0, fieldId)

      const nextSchema: FormBuilderSchema = {
        ...schema,
        columns: {
          ...schema.columns,
          [sourceColId]: {
            ...sourceCol,
            fieldIds: nextSourceFields,
          },
          [targetColId]: {
            ...targetCol,
            fieldIds: nextTargetFields,
          },
        },
      }

      set({
        schema: nextSchema,
        ...pushHistory(schema),
      })
    },

    addRow: (pageId, columnWidths = [12], index) => {
      const { schema } = get()
      const { schema: nextSchema } = addRow(schema, pageId, columnWidths, index)
      set({
        schema: nextSchema,
        ...pushHistory(schema),
      })
    },

    removeRow: (rowId) => {
      const { schema } = get()
      const nextSchema = removeRow(schema, rowId)
      set({
        schema: nextSchema,
        ...pushHistory(schema),
      })
    },

    moveRow: (pageId, rowId, newIndex) => {
      const { schema } = get()
      const page = schema.pages[pageId]
      if (!page) return

      const nextRowIds = page.rowIds.filter((id) => id !== rowId)
      nextRowIds.splice(newIndex, 0, rowId)

      const nextSchema: FormBuilderSchema = {
        ...schema,
        pages: {
          ...schema.pages,
          [pageId]: {
            ...page,
            rowIds: nextRowIds,
          },
        },
      }

      set({
        schema: nextSchema,
        ...pushHistory(schema),
      })
    },

    updateRow: (rowId, partial) => {
      const { schema } = get()
      const nextSchema = updateRow(schema, rowId, partial)
      set({
        schema: nextSchema,
        ...pushHistory(schema),
      })
    },

    duplicateRow: (pageId, rowId) => {
      const { schema } = get()
      const nextSchema = duplicateRow(schema, pageId, rowId)
      set({
        schema: nextSchema,
        ...pushHistory(schema),
      })
    },

    setRowColumnWidths: (rowId, widths) => {
      const { schema } = get()
      const nextSchema = setRowColumnWidths(schema, rowId, widths)
      set({
        schema: nextSchema,
        ...pushHistory(schema),
      })
    },

    addColumnToRow: (rowId) => {
      const { schema } = get()
      const nextSchema = addColumnToRow(schema, rowId)
      set({
        schema: nextSchema,
        ...pushHistory(schema),
      })
    },

    removeColumnFromRow: (rowId, columnId) => {
      const { schema } = get()
      const nextSchema = removeColumnFromRow(schema, rowId, columnId)
      set({
        schema: nextSchema,
        ...pushHistory(schema),
      })
    },

    splitColumn: (columnId, count = 3) => {
      const { schema } = get()
      const nextSchema = splitColumn(schema, columnId, count)
      set({
        schema: nextSchema,
        ...pushHistory(schema),
      })
    },

    unsplitColumn: (columnId) => {
      const { schema } = get()
      const nextSchema = unsplitColumn(schema, columnId)
      set({
        schema: nextSchema,
        ...pushHistory(schema),
      })
    },

    setSubColumnWidths: (parentColId, widths) => {
      const { schema } = get()
      const nextSchema = setSubColumnWidths(schema, parentColId, widths)
      set({
        schema: nextSchema,
        ...pushHistory(schema),
      })
    },

    setRowLayoutColumnWidths: (fieldId, widths) => {
      const { schema } = get()
      const nextSchema = setRowLayoutColumnWidths(schema, fieldId, widths)
      set({
        schema: nextSchema,
        ...pushHistory(schema),
      })
    },

    addRowLayoutColumn: (fieldId) => {
      const { schema } = get()
      const nextSchema = addRowLayoutColumn(schema, fieldId)
      set({
        schema: nextSchema,
        ...pushHistory(schema),
      })
    },

    removeRowLayoutColumn: (fieldId, columnId) => {
      const { schema } = get()
      const nextSchema = removeRowLayoutColumn(schema, fieldId, columnId)
      set({
        schema: nextSchema,
        ...pushHistory(schema),
      })
    },

    addPage: (title) => {
      const { schema } = get()
      const { schema: nextSchema, newPageId } = addPage(schema, title)
      set({
        schema: nextSchema,
        selectedPageId: newPageId,
        selectedFieldId: null,
        ...pushHistory(schema),
      })
    },

    removePage: (pageId) => {
      const { schema, selectedPageId } = get()
      const nextSchema = removePage(schema, pageId)
      const nextSelectedPage =
        selectedPageId === pageId ? nextSchema.pageOrder[0] : selectedPageId

      set({
        schema: nextSchema,
        selectedPageId: nextSelectedPage,
        selectedFieldId: null,
        ...pushHistory(schema),
      })
    },

    updatePage: (pageId, partial) => {
      const { schema } = get()
      const page = schema.pages[pageId]
      if (!page) return

      const nextSchema: FormBuilderSchema = {
        ...schema,
        pages: {
          ...schema.pages,
          [pageId]: {
            ...page,
            ...partial,
          },
        },
      }

      set({
        schema: nextSchema,
        ...pushHistory(schema),
      })
    },

    updateSettings: (partial) => {
      const { schema } = get()
      const nextSchema: FormBuilderSchema = {
        ...schema,
        settings: {
          ...schema.settings,
          ...partial,
        },
      }

      set({
        schema: nextSchema,
        ...pushHistory(schema),
      })
    },

    undo: () => {
      const { history, future, schema } = get()
      if (history.length === 0) return

      const previous = history[history.length - 1]
      const nextHistory = history.slice(0, -1)

      set({
        schema: previous,
        history: nextHistory,
        future: [schema, ...future],
      })
    },

    redo: () => {
      const { history, future, schema } = get()
      if (future.length === 0) return

      const next = future[0]
      const nextFuture = future.slice(1)

      set({
        schema: next,
        history: [...history, schema],
        future: nextFuture,
      })
    },

    clear: () => {
      const initial = createEmptySchema('New Form')
      set({
        schema: initial,
        selectedFieldId: null,
        selectedPageId: initial.pageOrder[0],
        history: [],
        future: [],
      })
    },
  }
})
