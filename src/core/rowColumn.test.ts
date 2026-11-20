import { describe, it, expect } from 'vitest'
import {
  createEmptySchema,
  addRow,
  setRowColumnWidths,
  addColumnToRow,
  removeColumnFromRow,
  updateRow,
  duplicateRow,
  addFieldToColumn,
  splitColumn,
  unsplitColumn,
  setSubColumnWidths,
} from './normalizer'

describe('Row & Column Layout Engine', () => {
  it('sets custom column widths in a row', () => {
    let schema = createEmptySchema()
    const pageId = schema.pageOrder[0]
    const { schema: s1, newRowId } = addRow(schema, pageId, [6, 6])

    const s2 = setRowColumnWidths(s1, newRowId, [4, 8])
    const row = s2.rows[newRowId]
    expect(s2.columns[row.columnIds[0]].width).toBe(4)
    expect(s2.columns[row.columnIds[1]].width).toBe(8)
  })

  it('adds a column to a row and redistributes widths evenly', () => {
    let schema = createEmptySchema()
    const pageId = schema.pageOrder[0]
    const { schema: s1, newRowId } = addRow(schema, pageId, [12])

    // Adding 2nd column
    const s2 = addColumnToRow(s1, newRowId)
    const row2 = s2.rows[newRowId]
    expect(row2.columnIds.length).toBe(2)
    expect(s2.columns[row2.columnIds[0]].width).toBe(6)
    expect(s2.columns[row2.columnIds[1]].width).toBe(6)

    // Adding 3rd column
    const s3 = addColumnToRow(s2, newRowId)
    const row3 = s3.rows[newRowId]
    expect(row3.columnIds.length).toBe(3)
    expect(s3.columns[row3.columnIds[0]].width).toBe(4)
    expect(s3.columns[row3.columnIds[1]].width).toBe(4)
    expect(s3.columns[row3.columnIds[2]].width).toBe(4)
  })

  it('removes a column from a row and redistributes remaining column widths', () => {
    let schema = createEmptySchema()
    const pageId = schema.pageOrder[0]
    const { schema: s1, newRowId } = addRow(schema, pageId, [4, 4, 4])
    const row1 = s1.rows[newRowId]

    // Remove middle column
    const colToRemove = row1.columnIds[1]
    const s2 = removeColumnFromRow(s1, newRowId, colToRemove)
    const row2 = s2.rows[newRowId]

    expect(row2.columnIds.length).toBe(2)
    expect(s2.columns[colToRemove]).toBeUndefined()
    expect(s2.columns[row2.columnIds[0]].width).toBe(6)
    expect(s2.columns[row2.columnIds[1]].width).toBe(6)
  })

  it('updates row properties like fieldset and title legend', () => {
    let schema = createEmptySchema()
    const pageId = schema.pageOrder[0]
    const rowId = schema.pages[pageId].rowIds[0]

    const updated = updateRow(schema, rowId, {
      title: 'Customer Details',
      fieldset: true,
      className: 'custom-row-class',
    })

    const row = updated.rows[rowId]
    expect(row.title).toBe('Customer Details')
    expect(row.fieldset).toBe(true)
    expect(row.className).toBe('custom-row-class')
  })

  it('duplicates an entire row with columns and nested fields', () => {
    let schema = createEmptySchema()
    const pageId = schema.pageOrder[0]
    const rowId = schema.pages[pageId].rowIds[0]
    const colId = schema.rows[rowId].columnIds[0]

    // Add field to original row's column
    const { schema: s1, newFieldId } = addFieldToColumn(schema, colId, 'text')
    const s2 = duplicateRow(s1, pageId, rowId)

    const page = s2.pages[pageId]
    expect(page.rowIds.length).toBe(2)

    const duplicatedRowId = page.rowIds[1]
    const duplicatedRow = s2.rows[duplicatedRowId]
    expect(duplicatedRow).toBeDefined()
    expect(duplicatedRow.columnIds.length).toBe(1)

    const duplicatedColId = duplicatedRow.columnIds[0]
    const duplicatedCol = s2.columns[duplicatedColId]
    expect(duplicatedCol.fieldIds.length).toBe(1)

    const duplicatedFieldId = duplicatedCol.fieldIds[0]
    expect(duplicatedFieldId).not.toBe(newFieldId)
    expect(s2.fields[duplicatedFieldId].type).toBe('text')
  })

  it('splits a column into three sub-columns (e.g. 4/4/4)', () => {
    let schema = createEmptySchema()
    const pageId = schema.pageOrder[0]
    const rowId = schema.pages[pageId].rowIds[0]
    const colId = schema.rows[rowId].columnIds[0]

    // Add a field to the column first
    const { schema: s1, newFieldId } = addFieldToColumn(schema, colId, 'text')

    // Split into 3 columns
    const s2 = splitColumn(s1, colId, 3)
    const parentCol = s2.columns[colId]

    expect(parentCol.columnIds).toBeDefined()
    expect(parentCol.columnIds?.length).toBe(3)
    expect(parentCol.fieldIds.length).toBe(0) // moved to first sub-col

    const subCol1Id = parentCol.columnIds![0]
    const subCol2Id = parentCol.columnIds![1]
    const subCol3Id = parentCol.columnIds![2]

    expect(s2.columns[subCol1Id].width).toBe(4)
    expect(s2.columns[subCol2Id].width).toBe(4)
    expect(s2.columns[subCol3Id].width).toBe(4)

    // Verify existing field was migrated to first sub-column
    expect(s2.columns[subCol1Id].fieldIds).toContain(newFieldId)
  })

  it('un-splits (merges) sub-columns back into a single column preserving fields', () => {
    let schema = createEmptySchema()
    const pageId = schema.pageOrder[0]
    const rowId = schema.pages[pageId].rowIds[0]
    const colId = schema.rows[rowId].columnIds[0]

    const s1 = splitColumn(schema, colId, 3)
    const subCol2Id = s1.columns[colId].columnIds![1]
    const { schema: s2, newFieldId: f2 } = addFieldToColumn(s1, subCol2Id, 'email')

    // Unsplit / merge back
    const s3 = unsplitColumn(s2, colId)
    const mergedCol = s3.columns[colId]

    expect(mergedCol.columnIds).toBeUndefined()
    expect(mergedCol.fieldIds).toContain(f2)
    expect(s3.columns[subCol2Id]).toBeUndefined()
  })

  it('adjusts sub-column widths with setSubColumnWidths', () => {
    let schema = createEmptySchema()
    const pageId = schema.pageOrder[0]
    const rowId = schema.pages[pageId].rowIds[0]
    const colId = schema.rows[rowId].columnIds[0]

    const s1 = splitColumn(schema, colId, 3)
    const s2 = setSubColumnWidths(s1, colId, [3, 6, 3])

    const parentCol = s2.columns[colId]
    expect(s2.columns[parentCol.columnIds![0]].width).toBe(3)
    expect(s2.columns[parentCol.columnIds![1]].width).toBe(6)
    expect(s2.columns[parentCol.columnIds![2]].width).toBe(3)
  })
})
