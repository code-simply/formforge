import { describe, it, expect } from 'vitest'
import {
  createEmptySchema,
  addFieldToColumn,
  removeField,
  duplicateField,
  setRowLayoutColumnWidths,
  addRowLayoutColumn,
  removeRowLayoutColumn,
  buildZodValidationSchema,
} from './normalizer'

describe('RowLayout Draggable Component and Recursive Column Nesting', () => {
  it('creates a row-layout field with 2 default child columns of width 6 each', () => {
    const schema = createEmptySchema('Test Form')
    const firstColId = Object.keys(schema.columns)[0]

    const { schema: s1, newFieldId } = addFieldToColumn(schema, firstColId, 'row-layout')
    const rowLayoutField = s1.fields[newFieldId]

    expect(rowLayoutField).toBeDefined()
    expect(rowLayoutField.type).toBe('row-layout')
    expect(rowLayoutField.rowLayoutConfig).toBeDefined()
    expect(rowLayoutField.rowLayoutConfig?.columnIds).toHaveLength(2)

    const childColIds = rowLayoutField.rowLayoutConfig!.columnIds
    expect(s1.columns[childColIds[0]]).toBeDefined()
    expect(s1.columns[childColIds[1]]).toBeDefined()
    expect(s1.columns[childColIds[0]].width).toBe(6)
    expect(s1.columns[childColIds[1]].width).toBe(6)
  })

  it('allows adding child fields into the columns of a row-layout', () => {
    const schema = createEmptySchema('Test Form')
    const firstColId = Object.keys(schema.columns)[0]

    const { schema: s1, newFieldId: rowLayoutId } = addFieldToColumn(schema, firstColId, 'row-layout')
    const [subCol1, subCol2] = s1.fields[rowLayoutId].rowLayoutConfig!.columnIds

    // Add text field in column 1
    const { schema: s2, newFieldId: textId } = addFieldToColumn(s1, subCol1, 'text')
    // Add number field in column 2
    const { schema: s3, newFieldId: numberId } = addFieldToColumn(s2, subCol2, 'number')

    expect(s3.columns[subCol1].fieldIds).toContain(textId)
    expect(s3.columns[subCol2].fieldIds).toContain(numberId)
  })

  it('supports recursive nesting: dropping a 33:33:33 row-layout inside a 50% column of another row-layout', () => {
    const schema = createEmptySchema('Test Form')
    const mainColId = Object.keys(schema.columns)[0]

    // Level 1: Row-Layout with 50:50 (6:6)
    const { schema: s1, newFieldId: outerRowId } = addFieldToColumn(schema, mainColId, 'row-layout')
    const [outerCol1, outerCol2] = s1.fields[outerRowId].rowLayoutConfig!.columnIds
    expect(s1.columns[outerCol1].width).toBe(6)
    expect(s1.columns[outerCol2].width).toBe(6)

    // Level 2: Inside outerCol1, drop ANOTHER row-layout
    const { schema: s2, newFieldId: innerRowId } = addFieldToColumn(s1, outerCol1, 'row-layout')
    expect(s2.columns[outerCol1].fieldIds).toContain(innerRowId)

    // Add a 3rd column to the inner row and set widths to 4:4:4 (33:33:33)
    const s3 = addRowLayoutColumn(s2, innerRowId)
    const innerColIds = s3.fields[innerRowId].rowLayoutConfig!.columnIds
    expect(innerColIds).toHaveLength(3)

    const s4 = setRowLayoutColumnWidths(s3, innerRowId, [4, 4, 4])
    expect(s4.columns[innerColIds[0]].width).toBe(4)
    expect(s4.columns[innerColIds[1]].width).toBe(4)
    expect(s4.columns[innerColIds[2]].width).toBe(4)

    // Drop fields into each of the 3 sub-columns
    const { schema: s5, newFieldId: f1 } = addFieldToColumn(s4, innerColIds[0], 'text')
    const { schema: s6, newFieldId: f2 } = addFieldToColumn(s5, innerColIds[1], 'email')
    const { schema: s7, newFieldId: f3 } = addFieldToColumn(s6, innerColIds[2], 'phone')

    expect(s7.columns[innerColIds[0]].fieldIds).toContain(f1)
    expect(s7.columns[innerColIds[1]].fieldIds).toContain(f2)
    expect(s7.columns[innerColIds[2]].fieldIds).toContain(f3)
  })

  it('updates row-layout column widths with presets (e.g. 4:8 or 8:4)', () => {
    const schema = createEmptySchema('Test Form')
    const firstColId = Object.keys(schema.columns)[0]

    const { schema: s1, newFieldId } = addFieldToColumn(schema, firstColId, 'row-layout')
    const [col1, col2] = s1.fields[newFieldId].rowLayoutConfig!.columnIds

    // Preset 4:8 (33% / 67%)
    const s2 = setRowLayoutColumnWidths(s1, newFieldId, [4, 8])
    expect(s2.columns[col1].width).toBe(4)
    expect(s2.columns[col2].width).toBe(8)

    // Preset 8:4 (67% / 33%)
    const s3 = setRowLayoutColumnWidths(s2, newFieldId, [8, 4])
    expect(s3.columns[col1].width).toBe(8)
    expect(s3.columns[col2].width).toBe(4)
  })

  it('adds and removes columns with automatic width rebalancing', () => {
    const schema = createEmptySchema('Test Form')
    const firstColId = Object.keys(schema.columns)[0]

    const { schema: s1, newFieldId } = addFieldToColumn(schema, firstColId, 'row-layout')
    expect(s1.fields[newFieldId].rowLayoutConfig!.columnIds).toHaveLength(2)

    // Add column (now 3 columns)
    const s2 = addRowLayoutColumn(s1, newFieldId)
    const cols3 = s2.fields[newFieldId].rowLayoutConfig!.columnIds
    expect(cols3).toHaveLength(3)
    const totalWidth3 = cols3.reduce((sum, cId) => sum + s2.columns[cId].width, 0)
    expect(totalWidth3).toBe(12)

    // Remove middle column
    const colToRemove = cols3[1]
    const s3 = removeRowLayoutColumn(s2, newFieldId, colToRemove)
    const cols2 = s3.fields[newFieldId].rowLayoutConfig!.columnIds
    expect(cols2).toHaveLength(2)
    expect(cols2).not.toContain(colToRemove)
    expect(s3.columns[colToRemove]).toBeUndefined()
    const totalWidth2 = cols2.reduce((sum, cId) => sum + s3.columns[cId].width, 0)
    expect(totalWidth2).toBe(12)
  })

  it('recursively clones child columns and fields on duplicate', () => {
    const schema = createEmptySchema('Test Form')
    const firstColId = Object.keys(schema.columns)[0]

    const { schema: s1, newFieldId: rowLayoutId } = addFieldToColumn(schema, firstColId, 'row-layout')
    const [c1, c2] = s1.fields[rowLayoutId].rowLayoutConfig!.columnIds
    const { schema: s2, newFieldId: childFId } = addFieldToColumn(s1, c1, 'text')

    // Duplicate the row-layout
    const s3 = duplicateField(s2, rowLayoutId)

    // Find the duplicated row-layout field
    const dupField = Object.values(s3.fields).find(
      (f) => f.id !== rowLayoutId && f.name.includes('_copy') && f.type === 'row-layout'
    )
    expect(dupField).toBeDefined()
    expect(dupField!.rowLayoutConfig!.columnIds).toHaveLength(2)

    const [dupC1, dupC2] = dupField!.rowLayoutConfig!.columnIds
    expect(dupC1).not.toBe(c1)
    expect(dupC2).not.toBe(c2)
    expect(s3.columns[dupC1]).toBeDefined()
    expect(s3.columns[dupC2]).toBeDefined()

    // The child field should also have been cloned into the new column
    expect(s3.columns[dupC1].fieldIds).toHaveLength(1)
    const clonedChildId = s3.columns[dupC1].fieldIds[0]
    expect(clonedChildId).not.toBe(childFId)
    expect(s3.fields[clonedChildId]).toBeDefined()
    expect(s3.fields[clonedChildId].type).toBe('text')
  })

  it('recursively deletes all child columns and fields when row-layout is deleted', () => {
    const schema = createEmptySchema('Test Form')
    const firstColId = Object.keys(schema.columns)[0]

    const { schema: s1, newFieldId: rowLayoutId } = addFieldToColumn(schema, firstColId, 'row-layout')
    const [c1, c2] = s1.fields[rowLayoutId].rowLayoutConfig!.columnIds
    const { schema: s2, newFieldId: childFId } = addFieldToColumn(s1, c1, 'text')

    // Remove the row-layout field
    const s3 = removeField(s2, rowLayoutId)

    expect(s3.fields[rowLayoutId]).toBeUndefined()
    expect(s3.fields[childFId]).toBeUndefined()
    expect(s3.columns[c1]).toBeUndefined()
    expect(s3.columns[c2]).toBeUndefined()
  })

  it('buildZodValidationSchema ignores row-layout and validates child fields correctly', () => {
    const schema = createEmptySchema('Test Form')
    const firstColId = Object.keys(schema.columns)[0]

    const { schema: s1, newFieldId: rowLayoutId } = addFieldToColumn(schema, firstColId, 'row-layout')
    const [c1] = s1.fields[rowLayoutId].rowLayoutConfig!.columnIds
    const { schema: s2, newFieldId: emailFId } = addFieldToColumn(s1, c1, 'email')

    // Make the nested email field required
    const emailField = { ...s2.fields[emailFId], required: true }
    const s3 = {
      ...s2,
      fields: {
        ...s2.fields,
        [emailFId]: emailField,
      },
    }

    const allFields = Object.values(s3.fields)
    const visibleIds = new Set(allFields.map((f) => f.id))
    const zodSchema = buildZodValidationSchema(allFields, visibleIds)

    // Should succeed with valid email
    const validResult = zodSchema.safeParse({ [emailField.name]: 'user@example.com' })
    expect(validResult.success).toBe(true)

    // Should fail with invalid email
    const invalidResult = zodSchema.safeParse({ [emailField.name]: 'not-an-email' })
    expect(invalidResult.success).toBe(false)
  })
})
