import { nanoid } from 'nanoid';
import { z } from 'zod';
export function createId(prefix = '') {
    return prefix ? `${prefix}_${nanoid(8)}` : nanoid(10);
}
export function getDefaultFieldValues(type, id) {
    const base = {
        id,
        type,
        name: `field_${id}`,
        label: `${type.charAt(0).toUpperCase() + type.slice(1)} Field`,
        required: false,
        disabled: false,
        readOnly: false,
        labelPosition: 'top',
    };
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
            };
        case 'number':
            return {
                ...base,
                placeholder: '0',
                defaultValue: 0,
            };
        case 'textarea':
            return {
                ...base,
                placeholder: 'Type your message here...',
                defaultValue: '',
            };
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
            };
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
            };
        case 'checkbox':
        case 'switch':
            return {
                ...base,
                label: `Enable ${type}`,
                defaultValue: false,
            };
        case 'slider':
            return {
                ...base,
                defaultValue: 50,
                customAttributes: { min: 0, max: 100, step: 1 },
            };
        case 'date':
            return {
                ...base,
                defaultValue: '',
            };
        case 'time':
            return {
                ...base,
                defaultValue: '',
            };
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
            };
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
            };
        case 'heading':
            return {
                ...base,
                label: 'Section Heading',
                defaultValue: 'Section Title',
                customAttributes: { level: 2 },
            };
        case 'paragraph':
            return {
                ...base,
                label: 'Paragraph Content',
                defaultValue: 'Please fill out all the fields below carefully.',
            };
        case 'separator':
            return {
                ...base,
                label: 'Divider',
            };
        case 'button':
            return {
                ...base,
                label: 'Custom Action',
                defaultValue: 'Click Me',
            };
        default:
            return base;
    }
}
export function createEmptySchema(title = 'Untitled Form') {
    const pageId = createId('page');
    const rowId = createId('row');
    const colId = createId('col');
    const initialColumn = {
        id: colId,
        width: 12,
        fieldIds: [],
    };
    const initialRow = {
        id: rowId,
        columnIds: [colId],
    };
    const initialPage = {
        id: pageId,
        title: 'Page 1',
        description: 'First section of the form',
        rowIds: [rowId],
    };
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
    };
}
export function addFieldToColumn(schema, columnId, fieldType, index) {
    const newFieldId = createId('field');
    const field = getDefaultFieldValues(fieldType, newFieldId);
    const targetColumn = schema.columns[columnId];
    if (!targetColumn)
        return { schema, newFieldId };
    const nextFieldIds = [...targetColumn.fieldIds];
    if (index !== undefined && index >= 0 && index <= nextFieldIds.length) {
        nextFieldIds.splice(index, 0, newFieldId);
    }
    else {
        nextFieldIds.push(newFieldId);
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
    };
}
export function removeField(schema, fieldId) {
    const nextFields = { ...schema.fields };
    delete nextFields[fieldId];
    const nextColumns = { ...schema.columns };
    for (const colId of Object.keys(nextColumns)) {
        if (nextColumns[colId].fieldIds.includes(fieldId)) {
            nextColumns[colId] = {
                ...nextColumns[colId],
                fieldIds: nextColumns[colId].fieldIds.filter((id) => id !== fieldId),
            };
        }
    }
    return {
        ...schema,
        fields: nextFields,
        columns: nextColumns,
    };
}
export function duplicateField(schema, fieldId) {
    const source = schema.fields[fieldId];
    if (!source)
        return schema;
    const newId = createId('field');
    const duplicated = {
        ...JSON.parse(JSON.stringify(source)),
        id: newId,
        name: `${source.name}_copy`,
        label: `${source.label} (Copy)`,
    };
    // Find column containing fieldId
    let targetColId;
    let targetIndex = -1;
    for (const [cId, col] of Object.entries(schema.columns)) {
        const idx = col.fieldIds.indexOf(fieldId);
        if (idx !== -1) {
            targetColId = cId;
            targetIndex = idx;
            break;
        }
    }
    if (!targetColId)
        return schema;
    const nextCol = { ...schema.columns[targetColId] };
    nextCol.fieldIds = [...nextCol.fieldIds];
    nextCol.fieldIds.splice(targetIndex + 1, 0, newId);
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
    };
}
export function addRow(schema, pageId, columnWidths = [12], index) {
    const newRowId = createId('row');
    const newColumns = {};
    const columnIds = [];
    for (const width of columnWidths) {
        const colId = createId('col');
        columnIds.push(colId);
        newColumns[colId] = {
            id: colId,
            width,
            fieldIds: [],
        };
    }
    const newRow = {
        id: newRowId,
        columnIds,
    };
    const targetPage = schema.pages[pageId];
    if (!targetPage)
        return { schema, newRowId };
    const nextRowIds = [...targetPage.rowIds];
    if (index !== undefined && index >= 0 && index <= nextRowIds.length) {
        nextRowIds.splice(index, 0, newRowId);
    }
    else {
        nextRowIds.push(newRowId);
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
    };
}
export function removeRow(schema, rowId) {
    const targetRow = schema.rows[rowId];
    if (!targetRow)
        return schema;
    const nextFields = { ...schema.fields };
    const nextColumns = { ...schema.columns };
    // Clean up all columns & fields in row
    for (const colId of targetRow.columnIds) {
        const col = schema.columns[colId];
        if (col) {
            for (const fieldId of col.fieldIds) {
                delete nextFields[fieldId];
            }
            delete nextColumns[colId];
        }
    }
    const nextRows = { ...schema.rows };
    delete nextRows[rowId];
    const nextPages = { ...schema.pages };
    for (const pId of Object.keys(nextPages)) {
        if (nextPages[pId].rowIds.includes(rowId)) {
            nextPages[pId] = {
                ...nextPages[pId],
                rowIds: nextPages[pId].rowIds.filter((id) => id !== rowId),
            };
        }
    }
    return {
        ...schema,
        fields: nextFields,
        columns: nextColumns,
        rows: nextRows,
        pages: nextPages,
    };
}
export function addPage(schema, title) {
    const newPageId = createId('page');
    const rowId = createId('row');
    const colId = createId('col');
    const pageNumber = schema.pageOrder.length + 1;
    const pageTitle = title || `Page ${pageNumber}`;
    const newColumn = {
        id: colId,
        width: 12,
        fieldIds: [],
    };
    const newRow = {
        id: rowId,
        columnIds: [colId],
    };
    const newPage = {
        id: newPageId,
        title: pageTitle,
        description: '',
        rowIds: [rowId],
    };
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
    };
}
export function removePage(schema, pageId) {
    if (schema.pageOrder.length <= 1) {
        // Prevent removing the last remaining page
        return schema;
    }
    const targetPage = schema.pages[pageId];
    if (!targetPage)
        return schema;
    let nextSchema = { ...schema };
    for (const rowId of targetPage.rowIds) {
        nextSchema = removeRow(nextSchema, rowId);
    }
    const nextPages = { ...nextSchema.pages };
    delete nextPages[pageId];
    return {
        ...nextSchema,
        pages: nextPages,
        pageOrder: nextSchema.pageOrder.filter((id) => id !== pageId),
    };
}
export function buildZodValidationSchema(fields, visibleFieldIds) {
    const shape = {};
    for (const field of fields) {
        // Hidden or static fields don't require input validation
        if (!visibleFieldIds.has(field.id) ||
            ['heading', 'paragraph', 'separator', 'button'].includes(field.type)) {
            continue;
        }
        let validator;
        switch (field.type) {
            case 'email':
                validator = z.string().email({ message: 'Invalid email address' });
                break;
            case 'url':
                validator = z.string().url({ message: 'Invalid URL format' });
                break;
            case 'number':
                validator = z.coerce.number();
                break;
            case 'checkbox':
            case 'switch':
                validator = z.boolean();
                break;
            case 'multi-select':
            case 'checkbox-group':
                validator = z.array(z.string());
                break;
            case 'table-matrix':
                validator = z.record(z.string(), z.string());
                break;
            case 'repeat-row':
                validator = z.array(z.record(z.string(), z.unknown()));
                break;
            default:
                validator = z.string();
                break;
        }
        // Apply custom validation rules
        if (field.validationRules && field.validationRules.length > 0) {
            for (const rule of field.validationRules) {
                if (rule.type === 'minLength' && typeof validator === 'object' && 'min' in validator) {
                    validator = validator.min(Number(rule.value), {
                        message: rule.message || `Minimum length is ${rule.value}`,
                    });
                }
                if (rule.type === 'maxLength' && typeof validator === 'object' && 'max' in validator) {
                    validator = validator.max(Number(rule.value), {
                        message: rule.message || `Maximum length is ${rule.value}`,
                    });
                }
                if (rule.type === 'pattern' && typeof validator === 'object' && 'regex' in validator) {
                    validator = validator.regex(new RegExp(String(rule.value)), {
                        message: rule.message || 'Invalid format',
                    });
                }
            }
        }
        if (field.required) {
            if (field.type === 'checkbox' || field.type === 'switch') {
                validator = validator.refine((val) => val === true, {
                    message: `${field.label} is required`,
                });
            }
            else if (field.type === 'multi-select' || field.type === 'checkbox-group') {
                validator = validator.min(1, {
                    message: `${field.label} requires at least one selection`,
                });
            }
            else if (field.type === 'text' || field.type === 'textarea' || field.type === 'select' || field.type === 'date') {
                validator = validator.min(1, {
                    message: `${field.label} is required`,
                });
            }
        }
        else {
            validator = validator.optional();
        }
        shape[field.name || field.id] = validator;
    }
    return z.object(shape);
}
