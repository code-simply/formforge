import { nanoid } from 'nanoid'
import { z } from 'zod'
import {
  FieldType,
  FormBuilderSchema,
  FormColumn,
  FormField,
  FormPage,
  FormRow,
} from './types'

export function createId(prefix = ''): string {
  return prefix ? `${prefix}_${nanoid(8)}` : nanoid(10)
}

export function getDefaultFieldValues(type: FieldType, id: string): FormField {
  const base = {
    id,
    type,
    name: `field_${id}`,
    label: `${type.charAt(0).toUpperCase() + type.slice(1)} Field`,
    required: false,
    disabled: false,
    readOnly: false,
    labelPosition: 'top' as const,
  }

  switch (type) {
    case 'text':
    case 'email':
    case 'password':
    case 'phone':
    case 'url':
      return {
        ...base,
        placeholder: `Enter ${type}...`,
        defaultValue: '',
      }

    case 'number':
      return {
        ...base,
        placeholder: '0',
        defaultValue: 0,
      }

    case 'textarea':
      return {
        ...base,
        placeholder: 'Type your message here...',
        defaultValue: '',
      }

    case 'select':
    case 'radio-group':
      return {
        ...base,
        options: [
          { label: 'Option 1', value: 'opt_1' },
          { label: 'Option 2', value: 'opt_2' },
          { label: 'Option 3', value: 'opt_3' },
        ],
        defaultValue: 'opt_1',
      }

    case 'multi-select':
    case 'checkbox-group':
      return {
        ...base,
        options: [
          { label: 'Choice A', value: 'choice_a' },
          { label: 'Choice B', value: 'choice_b' },
          { label: 'Choice C', value: 'choice_c' },
        ],
        defaultValue: [],
      }

    case 'checkbox':
    case 'switch':
      return {
        ...base,
        label: `Enable ${type}`,
        defaultValue: false,
      }

    case 'slider':
      return {
        ...base,
        defaultValue: 50,
        customAttributes: { min: 0, max: 100, step: 1 },
      }

    case 'date':
      return {
        ...base,
        defaultValue: '',
      }

    case 'time':
      return {
        ...base,
        defaultValue: '',
      }

    case 'table-matrix':
      return {
        ...base,
        label: 'Evaluation Matrix',
        matrixConfig: {
          cellType: 'radio',
          rows: [
            { id: 'r1', label: 'Feature Quality', value: 'quality' },
            { id: 'r2', label: 'Ease of Use', value: 'ease' },
            { id: 'r3', label: 'Customer Support', value: 'support' },
          ],
          columns: [
            { id: 'c1', label: 'Poor', value: '1' },
            { id: 'c2', label: 'Average', value: '2' },
            { id: 'c3', label: 'Good', value: '3' },
            { id: 'c4', label: 'Excellent', value: '4' },
          ],
        },
      }

    case 'repeat-row':
      return {
        ...base,
        label: 'Repeatable Items',
        repeatRowConfig: {
          minRows: 1,
          maxRows: 5,
          addButtonText: 'Add Item',
          removeButtonText: 'Remove',
          fieldTemplate: [
            {
              id: createId('field'),
              type: 'text',
              name: 'item_name',
              label: 'Item Name',
              required: true,
              labelPosition: 'top',
            },
            {
              id: createId('field'),
              type: 'number',
              name: 'quantity',
              label: 'Quantity',
              defaultValue: 1,
              labelPosition: 'top',
            },
          ],
        },
      }

    case 'heading':
      return {
        ...base,
        label: 'Section Heading',
        defaultValue: 'Section Title',
        customAttributes: { level: 2 },
      }

    case 'paragraph':
      return {
        ...base,
        label: 'Paragraph Content',
        defaultValue: 'Please fill out all the fields below carefully.',
      }

    case 'separator':
      return {
        ...base,
        label: 'Divider',
      }

    case 'button':
      return {
        ...base,
        label: 'Custom Action',
        defaultValue: 'Click Me',
      }

    case 'logo':
      return {
        ...base,
        label: 'Brand Logo',
        logoConfig: {
          url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80',
          alt: 'Company Logo',
          align: 'left',
          width: 140,
        },
      }

    case 'image':
      return {
        ...base,
        label: 'Header Banner',
        imageConfig: {
          url: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&auto=format&fit=crop&q=80',
          alt: 'Visual Banner',
          caption: 'Visual Header Illustration',
          aspectRatio: '16/9',
          rounded: 'md',
          align: 'center',
        },
      }

    case 'avatar':
      return {
        ...base,
        label: 'Profile Avatar',
        avatarConfig: {
          url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          fallbackText: 'AG',
          size: 'md',
          shape: 'circle',
          status: 'online',
          subtitle: 'Support Agent',
        },
      }

    default:
      return base
  }
}

export function createEmptySchema(title = 'Untitled Form'): FormBuilderSchema {
  const pageId = createId('page')
  const rowId = createId('row')
  const colId = createId('col')

  const initialColumn: FormColumn = {
    id: colId,
    width: 12,
    fieldIds: [],
  }

  const initialRow: FormRow = {
    id: rowId,
    columnIds: [colId],
  }

  const initialPage: FormPage = {
    id: pageId,
    title: 'Page 1',
    description: 'First section of the form',
    rowIds: [rowId],
  }

  return {
    id: createId('form'),
    version: '1.0.0',
    title,
    description: '',
    settings: {
      submitButtonText: 'Submit',
      showResetButton: false,
      resetButtonText: 'Reset',
      layout: 'standard',
      labelPosition: 'top',
      theme: 'system',
      showProgressBar: true,
      allowPageNavigation: true,
    },
    pages: { [pageId]: initialPage },
    rows: { [rowId]: initialRow },
    columns: { [colId]: initialColumn },
    fields: {},
    pageOrder: [pageId],
  }
}

export function addFieldToColumn(
  schema: FormBuilderSchema,
  columnId: string,
  fieldType: FieldType,
  index?: number
): { schema: FormBuilderSchema; newFieldId: string } {
  const newFieldId = createId('field')
  const field = getDefaultFieldValues(fieldType, newFieldId)

  const targetColumn = schema.columns[columnId]
  if (!targetColumn) return { schema, newFieldId }

  const nextFieldIds = [...targetColumn.fieldIds]
  if (index !== undefined && index >= 0 && index <= nextFieldIds.length) {
    nextFieldIds.splice(index, 0, newFieldId)
  } else {
    nextFieldIds.push(newFieldId)
  }

  return {
    schema: {
      ...schema,
      fields: {
        ...schema.fields,
        [newFieldId]: field,
      },
      columns: {
        ...schema.columns,
        [columnId]: {
          ...targetColumn,
          fieldIds: nextFieldIds,
        },
      },
    },
    newFieldId,
  }
}

export function removeField(
  schema: FormBuilderSchema,
  fieldId: string
): FormBuilderSchema {
  const nextFields = { ...schema.fields }
  delete nextFields[fieldId]

  const nextColumns = { ...schema.columns }
  for (const colId of Object.keys(nextColumns)) {
    if (nextColumns[colId].fieldIds.includes(fieldId)) {
      nextColumns[colId] = {
        ...nextColumns[colId],
        fieldIds: nextColumns[colId].fieldIds.filter((id) => id !== fieldId),
      }
    }
  }

  return {
    ...schema,
    fields: nextFields,
    columns: nextColumns,
  }
}

export function duplicateField(
  schema: FormBuilderSchema,
  fieldId: string
): FormBuilderSchema {
  const source = schema.fields[fieldId]
  if (!source) return schema

  const newId = createId('field')
  const duplicated: FormField = {
    ...JSON.parse(JSON.stringify(source)),
    id: newId,
    name: `${source.name}_copy`,
    label: `${source.label} (Copy)`,
  }

  // Find column containing fieldId
  let targetColId: string | undefined
  let targetIndex = -1
  for (const [cId, col] of Object.entries(schema.columns)) {
    const idx = col.fieldIds.indexOf(fieldId)
    if (idx !== -1) {
      targetColId = cId
      targetIndex = idx
      break
    }
  }

  if (!targetColId) return schema

  const nextCol = { ...schema.columns[targetColId] }
  nextCol.fieldIds = [...nextCol.fieldIds]
  nextCol.fieldIds.splice(targetIndex + 1, 0, newId)

  return {
    ...schema,
    fields: {
      ...schema.fields,
      [newId]: duplicated,
    },
    columns: {
      ...schema.columns,
      [targetColId]: nextCol,
    },
  }
}

export function addRow(
  schema: FormBuilderSchema,
  pageId: string,
  columnWidths: number[] = [12],
  index?: number
): { schema: FormBuilderSchema; newRowId: string } {
  const newRowId = createId('row')
  const newColumns: Record<string, FormColumn> = {}
  const columnIds: string[] = []

  for (const width of columnWidths) {
    const colId = createId('col')
    columnIds.push(colId)
    newColumns[colId] = {
      id: colId,
      width,
      fieldIds: [],
    }
  }

  const newRow: FormRow = {
    id: newRowId,
    columnIds,
  }

  const targetPage = schema.pages[pageId]
  if (!targetPage) return { schema, newRowId }

  const nextRowIds = [...targetPage.rowIds]
  if (index !== undefined && index >= 0 && index <= nextRowIds.length) {
    nextRowIds.splice(index, 0, newRowId)
  } else {
    nextRowIds.push(newRowId)
  }

  return {
    schema: {
      ...schema,
      rows: {
        ...schema.rows,
        [newRowId]: newRow,
      },
      columns: {
        ...schema.columns,
        ...newColumns,
      },
      pages: {
        ...schema.pages,
        [pageId]: {
          ...targetPage,
          rowIds: nextRowIds,
        },
      },
    },
    newRowId,
  }
}

export function removeRow(
  schema: FormBuilderSchema,
  rowId: string
): FormBuilderSchema {
  const targetRow = schema.rows[rowId]
  if (!targetRow) return schema

  const nextFields = { ...schema.fields }
  const nextColumns = { ...schema.columns }

  // Clean up all columns & fields in row
  for (const colId of targetRow.columnIds) {
    const col = schema.columns[colId]
    if (col) {
      for (const fieldId of col.fieldIds) {
        delete nextFields[fieldId]
      }
      delete nextColumns[colId]
    }
  }

  const nextRows = { ...schema.rows }
  delete nextRows[rowId]

  const nextPages = { ...schema.pages }
  for (const pId of Object.keys(nextPages)) {
    if (nextPages[pId].rowIds.includes(rowId)) {
      nextPages[pId] = {
        ...nextPages[pId],
        rowIds: nextPages[pId].rowIds.filter((id) => id !== rowId),
      }
    }
  }

  return {
    ...schema,
    fields: nextFields,
    columns: nextColumns,
    rows: nextRows,
    pages: nextPages,
  }
}

/**
 * Sets the widths of all columns in a row
 */
export function setRowColumnWidths(
  schema: FormBuilderSchema,
  rowId: string,
  widths: number[]
): FormBuilderSchema {
  const row = schema.rows[rowId]
  if (!row) return schema

  const nextColumns = { ...schema.columns }
  row.columnIds.forEach((colId, idx) => {
    if (nextColumns[colId] && widths[idx] !== undefined) {
      nextColumns[colId] = {
        ...nextColumns[colId],
        width: Math.min(Math.max(widths[idx], 1), 12),
      }
    }
  })

  return {
    ...schema,
    columns: nextColumns,
  }
}

/**
 * Adds a new column to an existing row and redistributes column widths evenly
 */
export function addColumnToRow(
  schema: FormBuilderSchema,
  rowId: string
): FormBuilderSchema {
  const row = schema.rows[rowId]
  if (!row) return schema

  if (row.columnIds.length >= 4) return schema

  const newColId = createId('col')
  const newCount = row.columnIds.length + 1
  const evenWidth = Math.floor(12 / newCount)
  const remainder = 12 - evenWidth * newCount

  const nextColumns = { ...schema.columns }

  row.columnIds.forEach((colId, i) => {
    nextColumns[colId] = {
      ...nextColumns[colId],
      width: evenWidth + (i === 0 ? remainder : 0),
    }
  })

  nextColumns[newColId] = {
    id: newColId,
    width: evenWidth,
    fieldIds: [],
  }

  return {
    ...schema,
    columns: nextColumns,
    rows: {
      ...schema.rows,
      [rowId]: {
        ...row,
        columnIds: [...row.columnIds, newColId],
      },
    },
  }
}

/**
 * Removes a column from a row and redistributes remaining column widths
 */
export function removeColumnFromRow(
  schema: FormBuilderSchema,
  rowId: string,
  columnId: string
): FormBuilderSchema {
  const row = schema.rows[rowId]
  if (!row || row.columnIds.length <= 1) return schema

  const targetCol = schema.columns[columnId]
  if (!targetCol) return schema

  const nextColumns = { ...schema.columns }
  const nextFields = { ...schema.fields }
  const remainingColIds = row.columnIds.filter((id) => id !== columnId)

  // Move any fields from deleted column to the first remaining column
  if (targetCol.fieldIds.length > 0 && remainingColIds.length > 0) {
    const firstColId = remainingColIds[0]
    nextColumns[firstColId] = {
      ...nextColumns[firstColId],
      fieldIds: [...nextColumns[firstColId].fieldIds, ...targetCol.fieldIds],
    }
  }

  delete nextColumns[columnId]

  const newCount = remainingColIds.length
  const evenWidth = Math.floor(12 / newCount)
  const remainder = 12 - evenWidth * newCount

  remainingColIds.forEach((colId, i) => {
    nextColumns[colId] = {
      ...nextColumns[colId],
      width: evenWidth + (i === 0 ? remainder : 0),
    }
  })

  return {
    ...schema,
    columns: nextColumns,
    fields: nextFields,
    rows: {
      ...schema.rows,
      [rowId]: {
        ...row,
        columnIds: remainingColIds,
      },
    },
  }
}

/**
 * Updates a row's properties (title, fieldset, className, conditions)
 */
export function updateRow(
  schema: FormBuilderSchema,
  rowId: string,
  partial: Partial<FormRow>
): FormBuilderSchema {
  const row = schema.rows[rowId]
  if (!row) return schema

  return {
    ...schema,
    rows: {
      ...schema.rows,
      [rowId]: {
        ...row,
        ...partial,
      },
    },
  }
}

/**
 * Duplicates a row with all its columns and fields
 */
export function duplicateRow(
  schema: FormBuilderSchema,
  pageId: string,
  rowId: string
): FormBuilderSchema {
  const row = schema.rows[rowId]
  const page = schema.pages[pageId]
  if (!row || !page) return schema

  const newRowId = createId('row')
  const newColumnIds: string[] = []
  const newColumns: Record<string, FormColumn> = {}
  const newFields: Record<string, FormField> = {}

  for (const colId of row.columnIds) {
    const col = schema.columns[colId]
    if (!col) continue

    const newColId = createId('col')
    newColumnIds.push(newColId)
    const newFieldIds: string[] = []

    for (const fId of col.fieldIds) {
      const field = schema.fields[fId]
      if (!field) continue

      const newFieldId = createId('field')
      newFieldIds.push(newFieldId)
      newFields[newFieldId] = {
        ...JSON.parse(JSON.stringify(field)),
        id: newFieldId,
        name: `${field.name}_copy`,
        label: `${field.label} (Copy)`,
      }
    }

    newColumns[newColId] = {
      id: newColId,
      width: col.width,
      fieldIds: newFieldIds,
      className: col.className,
    }
  }

  const duplicatedRow: FormRow = {
    ...JSON.parse(JSON.stringify(row)),
    id: newRowId,
    columnIds: newColumnIds,
    title: row.title ? `${row.title} (Copy)` : undefined,
  }

  const rowIndex = page.rowIds.indexOf(rowId)
  const nextRowIds = [...page.rowIds]
  nextRowIds.splice(rowIndex + 1, 0, newRowId)

  return {
    ...schema,
    fields: {
      ...schema.fields,
      ...newFields,
    },
    columns: {
      ...schema.columns,
      ...newColumns,
    },
    rows: {
      ...schema.rows,
      [newRowId]: duplicatedRow,
    },
    pages: {
      ...schema.pages,
      [pageId]: {
        ...page,
        rowIds: nextRowIds,
      },
    },
  }
}

export function addPage(
  schema: FormBuilderSchema,
  title?: string
): { schema: FormBuilderSchema; newPageId: string } {
  const newPageId = createId('page')
  const rowId = createId('row')
  const colId = createId('col')

  const pageNumber = schema.pageOrder.length + 1
  const pageTitle = title || `Page ${pageNumber}`

  const newColumn: FormColumn = {
    id: colId,
    width: 12,
    fieldIds: [],
  }

  const newRow: FormRow = {
    id: rowId,
    columnIds: [colId],
  }

  const newPage: FormPage = {
    id: newPageId,
    title: pageTitle,
    description: '',
    rowIds: [rowId],
  }

  return {
    schema: {
      ...schema,
      pages: {
        ...schema.pages,
        [newPageId]: newPage,
      },
      rows: {
        ...schema.rows,
        [rowId]: newRow,
      },
      columns: {
        ...schema.columns,
        [colId]: newColumn,
      },
      pageOrder: [...schema.pageOrder, newPageId],
    },
    newPageId,
  }
}

export function removePage(
  schema: FormBuilderSchema,
  pageId: string
): FormBuilderSchema {
  if (schema.pageOrder.length <= 1) {
    // Prevent removing the last remaining page
    return schema
  }

  const targetPage = schema.pages[pageId]
  if (!targetPage) return schema

  let nextSchema = { ...schema }
  for (const rowId of targetPage.rowIds) {
    nextSchema = removeRow(nextSchema, rowId)
  }

  const nextPages = { ...nextSchema.pages }
  delete nextPages[pageId]

  return {
    ...nextSchema,
    pages: nextPages,
    pageOrder: nextSchema.pageOrder.filter((id) => id !== pageId),
  }
}

export function buildZodValidationSchema(
  fields: FormField[],
  visibleFieldIds: Set<string>
): z.ZodObject<any> {
  const shape: Record<string, z.ZodTypeAny> = {}

  for (const field of fields) {
    // Hidden or static fields don't require input validation
    if (
      !visibleFieldIds.has(field.id) ||
      ['heading', 'paragraph', 'separator', 'button', 'logo', 'image', 'avatar'].includes(field.type)
    ) {
      continue
    }

    let validator: z.ZodTypeAny

    switch (field.type) {
      case 'email':
        validator = z.string().email({ message: 'Invalid email address' })
        break

      case 'url':
        validator = z.string().url({ message: 'Invalid URL format' })
        break

      case 'number':
        validator = z.coerce.number()
        break

      case 'checkbox':
      case 'switch':
        validator = z.boolean()
        break

      case 'multi-select':
      case 'checkbox-group':
        validator = z.array(z.string())
        break

      case 'table-matrix':
        validator = z.record(z.string(), z.string())
        break

      case 'repeat-row':
        validator = z.array(z.record(z.string(), z.unknown()))
        break

      default:
        validator = z.string()
        break
    }

    // Apply custom validation rules
    if (field.validationRules && field.validationRules.length > 0) {
      for (const rule of field.validationRules) {
        if (rule.type === 'minLength' && typeof validator === 'object' && 'min' in validator) {
          validator = (validator as z.ZodString).min(Number(rule.value), {
            message: rule.message || `Minimum length is ${rule.value}`,
          })
        }
        if (rule.type === 'maxLength' && typeof validator === 'object' && 'max' in validator) {
          validator = (validator as z.ZodString).max(Number(rule.value), {
            message: rule.message || `Maximum length is ${rule.value}`,
          })
        }
        if (rule.type === 'pattern' && typeof validator === 'object' && 'regex' in validator) {
          validator = (validator as z.ZodString).regex(new RegExp(String(rule.value)), {
            message: rule.message || 'Invalid format',
          })
        }
      }
    }

    if (field.required) {
      if (field.type === 'checkbox' || field.type === 'switch') {
        validator = (validator as z.ZodBoolean).refine((val) => val === true, {
          message: `${field.label} is required`,
        })
      } else if (field.type === 'multi-select' || field.type === 'checkbox-group') {
        validator = (validator as z.ZodArray<any>).min(1, {
          message: `${field.label} requires at least one selection`,
        })
      } else if (field.type === 'text' || field.type === 'textarea' || field.type === 'select' || field.type === 'date') {
        validator = (validator as z.ZodString).min(1, {
          message: `${field.label} is required`,
        })
      }
    } else {
      validator = validator.optional()
    }

    shape[field.name || field.id] = validator
  }

  return z.object(shape)
}
