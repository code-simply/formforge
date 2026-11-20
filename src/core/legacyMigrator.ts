import { FormBuilderSchema, FormField, FormPage, FormRow, FormColumn, FieldType } from './types'
import { createId } from './normalizer'

export interface LegacyFormeoData {
  id?: string
  stages?: Record<string, any>
  rows?: Record<string, any>
  columns?: Record<string, any>
  fields?: Record<string, any>
}

/**
 * Maps legacy Formeo control tags and attributes to modern FieldType
 */
export function mapLegacyFieldType(legacyField: any): FieldType {
  const tag = (legacyField.tag || '').toLowerCase()
  const attrs = legacyField.attrs || {}
  const type = (attrs.type || '').toLowerCase()

  if (tag === 'textarea') return 'textarea'
  if (tag === 'select') return 'select'
  if (tag === 'button') return 'button'

  if (tag === 'input') {
    switch (type) {
      case 'email':
        return 'email'
      case 'password':
        return 'password'
      case 'number':
        return 'number'
      case 'tel':
        return 'phone'
      case 'url':
        return 'url'
      case 'checkbox':
        return 'checkbox'
      case 'radio':
        return 'radio-group'
      case 'date':
        return 'date'
      case 'time':
        return 'time'
      case 'range':
        return 'slider'
      default:
        return 'text'
    }
  }

  // Layout or special elements
  if (tag === 'h1' || tag === 'h2' || tag === 'h3' || tag === 'h4') return 'heading'
  if (tag === 'p') return 'paragraph'
  if (tag === 'hr') return 'separator'

  return 'text'
}

/**
 * Migrates a legacy Formeo schema into modern FormBuilderSchema
 */
export function migrateLegacyFormeoSchema(legacy: LegacyFormeoData): FormBuilderSchema {
  const schemaId = legacy.id || createId('form')
  const pages: Record<string, FormPage> = {}
  const rows: Record<string, FormRow> = {}
  const columns: Record<string, FormColumn> = {}
  const fields: Record<string, FormField> = {}
  const pageOrder: string[] = []

  // Migrate Fields
  if (legacy.fields) {
    for (const [fId, lField] of Object.entries(legacy.fields)) {
      const attrs = lField.attrs || {}
      const mappedType = mapLegacyFieldType(lField)

      const options = Array.isArray(lField.options)
        ? lField.options.map((opt: any) => ({
            label: opt.label || opt.value || 'Option',
            value: String(opt.value || opt.label || ''),
            disabled: !!opt.disabled,
          }))
        : undefined

      fields[fId] = {
        id: fId,
        type: mappedType,
        name: attrs.name || `field_${fId}`,
        label: attrs.label || lField.content || lField.label || 'Field Label',
        placeholder: attrs.placeholder,
        description: attrs.description,
        defaultValue: attrs.value,
        required: !!attrs.required,
        disabled: !!attrs.disabled,
        options,
      }
    }
  }

  // Migrate Columns
  if (legacy.columns) {
    for (const [colId, lCol] of Object.entries(legacy.columns)) {
      columns[colId] = {
        id: colId,
        width: Number(lCol.width) || 12,
        fieldIds: Array.isArray(lCol.children) ? lCol.children : [],
      }
    }
  }

  // Migrate Rows
  if (legacy.rows) {
    for (const [rId, lRow] of Object.entries(legacy.rows)) {
      rows[rId] = {
        id: rId,
        columnIds: Array.isArray(lRow.children) ? lRow.children : [],
      }
    }
  }

  // Migrate Stages into Pages
  if (legacy.stages && Object.keys(legacy.stages).length > 0) {
    for (const [sId, lStage] of Object.entries(legacy.stages)) {
      pageOrder.push(sId)
      pages[sId] = {
        id: sId,
        title: lStage.title || `Page ${pageOrder.length}`,
        description: lStage.description,
        rowIds: Array.isArray(lStage.children) ? lStage.children : [],
      }
    }
  } else {
    // If no stages existed, create a default page wrapping all rows
    const defaultPageId = createId('page')
    pageOrder.push(defaultPageId)
    pages[defaultPageId] = {
      id: defaultPageId,
      title: 'Page 1',
      rowIds: Object.keys(rows),
    }
  }

  return {
    id: schemaId,
    version: '1.0.0',
    title: 'Migrated Form',
    description: 'Imported from legacy Formeo definition',
    settings: {
      submitButtonText: 'Submit',
      showResetButton: false,
      layout: 'standard',
      labelPosition: 'top',
      theme: 'system',
      showProgressBar: pageOrder.length > 1,
      allowPageNavigation: true,
    },
    pages,
    rows,
    columns,
    fields,
    pageOrder,
  }
}
