import { describe, it, expect } from 'vitest'
import {
  createEmptySchema,
  addFieldToColumn,
  duplicateField,
  removeField,
  addRow,
  removeRow,
  addPage,
  removePage,
  buildZodValidationSchema,
} from './normalizer'
import { evaluateOperator, evaluateFieldConditions } from './conditions'
import { FormBuilderSchemaZod } from './schema'
import { migrateLegacyFormeoSchema } from './legacyMigrator'

describe('Normalizer & Schema Operations', () => {
  it('creates a valid empty form schema', () => {
    const schema = createEmptySchema('Test Form')
    expect(schema.title).toBe('Test Form')
    expect(schema.pageOrder.length).toBe(1)

    const initialPageId = schema.pageOrder[0]
    expect(schema.pages[initialPageId]).toBeDefined()

    // Validate with Zod
    const validated = FormBuilderSchemaZod.parse(schema)
    expect(validated.id).toBe(schema.id)
  })

  it('adds fields to a column', () => {
    let schema = createEmptySchema()
    const pageId = schema.pageOrder[0]
    const rowId = schema.pages[pageId].rowIds[0]
    const colId = schema.rows[rowId].columnIds[0]

    const { schema: updated, newFieldId } = addFieldToColumn(schema, colId, 'text')
    expect(updated.columns[colId].fieldIds).toContain(newFieldId)
    expect(updated.fields[newFieldId]).toBeDefined()
    expect(updated.fields[newFieldId].type).toBe('text')
  })

  it('duplicates an existing field', () => {
    let schema = createEmptySchema()
    const pageId = schema.pageOrder[0]
    const rowId = schema.pages[pageId].rowIds[0]
    const colId = schema.rows[rowId].columnIds[0]

    const { schema: s1, newFieldId } = addFieldToColumn(schema, colId, 'email')
    const s2 = duplicateField(s1, newFieldId)

    expect(s2.columns[colId].fieldIds.length).toBe(2)
    const duplicateId = s2.columns[colId].fieldIds[1]
    expect(s2.fields[duplicateId].type).toBe('email')
    expect(s2.fields[duplicateId].label).toContain('(Copy)')
  })

  it('removes a field cleanly', () => {
    let schema = createEmptySchema()
    const pageId = schema.pageOrder[0]
    const rowId = schema.pages[pageId].rowIds[0]
    const colId = schema.rows[rowId].columnIds[0]

    const { schema: s1, newFieldId } = addFieldToColumn(schema, colId, 'select')
    const s2 = removeField(s1, newFieldId)

    expect(s2.columns[colId].fieldIds).not.toContain(newFieldId)
    expect(s2.fields[newFieldId]).toBeUndefined()
  })

  it('adds and removes rows with columns', () => {
    let schema = createEmptySchema()
    const pageId = schema.pageOrder[0]

    const { schema: s1, newRowId } = addRow(schema, pageId, [6, 6])
    expect(s1.pages[pageId].rowIds).toContain(newRowId)
    expect(s1.rows[newRowId].columnIds.length).toBe(2)

    const s2 = removeRow(s1, newRowId)
    expect(s2.pages[pageId].rowIds).not.toContain(newRowId)
    expect(s2.rows[newRowId]).toBeUndefined()
  })

  it('adds and removes multi-step pages', () => {
    let schema = createEmptySchema()
    const { schema: s1, newPageId } = addPage(schema, 'Step 2')
    expect(s1.pageOrder.length).toBe(2)
    expect(s1.pages[newPageId].title).toBe('Step 2')

    const s2 = removePage(s1, newPageId)
    expect(s2.pageOrder.length).toBe(1)
    expect(s2.pages[newPageId]).toBeUndefined()
  })
})

describe('Condition Evaluation Engine', () => {
  it('evaluates equality and inequality operators', () => {
    expect(evaluateOperator('equals', 'apple', 'apple')).toBe(true)
    expect(evaluateOperator('equals', 'apple', 'banana')).toBe(false)
    expect(evaluateOperator('notEquals', 'apple', 'banana')).toBe(true)
  })

  it('evaluates numeric comparisons', () => {
    expect(evaluateOperator('greaterThan', 25, 18)).toBe(true)
    expect(evaluateOperator('greaterThan', 15, 18)).toBe(false)
    expect(evaluateOperator('lessThanOrEqual', 10, 10)).toBe(true)
  })

  it('evaluates string and array contains', () => {
    expect(evaluateOperator('contains', 'Hello World', 'world')).toBe(true)
    expect(evaluateOperator('contains', ['admin', 'editor'], 'admin')).toBe(true)
  })

  it('evaluates empty checks', () => {
    expect(evaluateOperator('isEmpty', '', undefined)).toBe(true)
    expect(evaluateOperator('isEmpty', [], undefined)).toBe(true)
    expect(evaluateOperator('isNotEmpty', 'data', undefined)).toBe(true)
  })

  it('evaluates field show/hide conditions based on form values', () => {
    const fieldsMap = {
      role_field: {
        id: 'role_field',
        type: 'select',
        name: 'user_role',
        label: 'Role',
      } as any,
    }

    const targetField = {
      id: 'admin_notes',
      type: 'textarea',
      name: 'admin_notes',
      label: 'Admin Notes',
      conditions: [
        {
          logic: 'AND' as const,
          action: 'show' as const,
          rules: [
            {
              fieldId: 'role_field',
              operator: 'equals' as const,
              value: 'admin',
            },
          ],
        },
      ],
    } as any

    // When role is not admin -> visible should be false
    const state1 = evaluateFieldConditions(targetField, { user_role: 'guest' }, fieldsMap)
    expect(state1.visible).toBe(false)

    // When role is admin -> visible should be true
    const state2 = evaluateFieldConditions(targetField, { user_role: 'admin' }, fieldsMap)
    expect(state2.visible).toBe(true)
  })
})

describe('Dynamic Zod Validation Generator', () => {
  it('validates required fields and email formats', () => {
    const fields = [
      {
        id: 'f1',
        type: 'text',
        name: 'full_name',
        label: 'Full Name',
        required: true,
      } as any,
      {
        id: 'f2',
        type: 'email',
        name: 'user_email',
        label: 'Email',
        required: true,
      } as any,
    ]

    const zodValidator = buildZodValidationSchema(fields, new Set(['f1', 'f2']))

    // Invalid payload (empty name, invalid email)
    const resInvalid = zodValidator.safeParse({ full_name: '', user_email: 'invalid' })
    expect(resInvalid.success).toBe(false)

    // Valid payload
    const resValid = zodValidator.safeParse({ full_name: 'John Doe', user_email: 'john@example.com' })
    expect(resValid.success).toBe(true)
  })

  it('validates array and multi-select fields', () => {
    const fields = [
      {
        id: 'f_skills',
        type: 'multi-select',
        name: 'skills',
        label: 'Skills',
        required: true,
      } as any,
      {
        id: 'f_repeat',
        type: 'repeat-row',
        name: 'work_history',
        label: 'Work History',
      } as any,
    ]

    const zodValidator = buildZodValidationSchema(fields, new Set(['f_skills', 'f_repeat']))

    // Empty array for required multi-select fails
    expect(zodValidator.safeParse({ skills: [] }).success).toBe(false)

    // Non-empty array passes
    expect(
      zodValidator.safeParse({
        skills: ['react', 'typescript'],
        work_history: [{ company: 'Acme', role: 'Dev' }],
      }).success
    ).toBe(true)
  })
})

describe('Legacy Formeo Migration', () => {
  it('converts legacy Formeo schema into a validated modern schema', () => {
    const legacyData = {
      id: 'formeo-legacy-123',
      stages: {
        'stage-abc': {
          id: 'stage-abc',
          title: 'Contact Step',
          children: ['row-xyz'],
        },
      },
      rows: {
        'row-xyz': {
          id: 'row-xyz',
          children: ['col-1', 'col-2'],
        },
      },
      columns: {
        'col-1': { id: 'col-1', width: 6, children: ['field-txt'] },
        'col-2': { id: 'col-2', width: 6, children: ['field-mail'] },
      },
      fields: {
        'field-txt': {
          id: 'field-txt',
          tag: 'input',
          attrs: { type: 'text', label: 'First Name', name: 'first_name', required: true },
        },
        'field-mail': {
          id: 'field-mail',
          tag: 'input',
          attrs: { type: 'email', label: 'Email Address', name: 'email_addr' },
        },
      },
    }

    const modern = migrateLegacyFormeoSchema(legacyData)
    expect(modern.id).toBe('formeo-legacy-123')
    expect(modern.pageOrder).toContain('stage-abc')
    expect(modern.fields['field-txt'].type).toBe('text')
    expect(modern.fields['field-txt'].required).toBe(true)
    expect(modern.fields['field-mail'].type).toBe('email')

    // Must validate cleanly under Zod schema
    const parsed = FormBuilderSchemaZod.parse(modern)
    expect(parsed.id).toBe('formeo-legacy-123')
  })
})
