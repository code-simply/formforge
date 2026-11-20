import { create } from 'zustand';
import { addFieldToColumn, addPage, addRow, createEmptySchema, duplicateField, removeField, removePage, removeRow, } from '../../core/normalizer';
const MAX_HISTORY = 30;
export const useBuilderStore = create((set, get) => {
    const initial = createEmptySchema('My Modern Form');
    const initialPageId = initial.pageOrder[0];
    const pushHistory = (currentSchema) => {
        const { history } = get();
        return {
            history: [...history.slice(-MAX_HISTORY), JSON.parse(JSON.stringify(currentSchema))],
            future: [],
        };
    };
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
            });
        },
        selectField: (fieldId) => {
            set({
                selectedFieldId: fieldId,
                activeTab: fieldId ? 'properties' : 'palette',
            });
        },
        selectPage: (pageId) => {
            set({ selectedPageId: pageId, selectedFieldId: null });
        },
        setPreviewMode: (enabled) => {
            set({ previewMode: enabled, selectedFieldId: null });
        },
        setActiveTab: (tab) => {
            set({ activeTab: tab });
        },
        updateField: (fieldId, partial) => {
            const { schema } = get();
            const current = schema.fields[fieldId];
            if (!current)
                return;
            const nextSchema = {
                ...schema,
                fields: {
                    ...schema.fields,
                    [fieldId]: {
                        ...current,
                        ...partial,
                    },
                },
            };
            set({
                schema: nextSchema,
                ...pushHistory(schema),
            });
        },
        addField: (columnId, type, index) => {
            const { schema } = get();
            const { schema: nextSchema, newFieldId } = addFieldToColumn(schema, columnId, type, index);
            set({
                schema: nextSchema,
                selectedFieldId: newFieldId,
                activeTab: 'properties',
                ...pushHistory(schema),
            });
            return newFieldId;
        },
        removeField: (fieldId) => {
            const { schema, selectedFieldId } = get();
            const nextSchema = removeField(schema, fieldId);
            set({
                schema: nextSchema,
                selectedFieldId: selectedFieldId === fieldId ? null : selectedFieldId,
                activeTab: selectedFieldId === fieldId ? 'palette' : get().activeTab,
                ...pushHistory(schema),
            });
        },
        duplicateField: (fieldId) => {
            const { schema } = get();
            const nextSchema = duplicateField(schema, fieldId);
            set({
                schema: nextSchema,
                ...pushHistory(schema),
            });
        },
        moveField: (sourceColId, targetColId, fieldId, newIndex) => {
            const { schema } = get();
            const sourceCol = schema.columns[sourceColId];
            const targetCol = schema.columns[targetColId];
            if (!sourceCol || !targetCol)
                return;
            const nextSourceFields = sourceCol.fieldIds.filter((id) => id !== fieldId);
            const nextTargetFields = sourceColId === targetColId
                ? [...nextSourceFields]
                : [...targetCol.fieldIds];
            nextTargetFields.splice(newIndex, 0, fieldId);
            const nextSchema = {
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
            };
            set({
                schema: nextSchema,
                ...pushHistory(schema),
            });
        },
        addRow: (pageId, columnWidths = [12], index) => {
            const { schema } = get();
            const { schema: nextSchema } = addRow(schema, pageId, columnWidths, index);
            set({
                schema: nextSchema,
                ...pushHistory(schema),
            });
        },
        removeRow: (rowId) => {
            const { schema } = get();
            const nextSchema = removeRow(schema, rowId);
            set({
                schema: nextSchema,
                ...pushHistory(schema),
            });
        },
        moveRow: (pageId, rowId, newIndex) => {
            const { schema } = get();
            const page = schema.pages[pageId];
            if (!page)
                return;
            const nextRowIds = page.rowIds.filter((id) => id !== rowId);
            nextRowIds.splice(newIndex, 0, rowId);
            const nextSchema = {
                ...schema,
                pages: {
                    ...schema.pages,
                    [pageId]: {
                        ...page,
                        rowIds: nextRowIds,
                    },
                },
            };
            set({
                schema: nextSchema,
                ...pushHistory(schema),
            });
        },
        addPage: (title) => {
            const { schema } = get();
            const { schema: nextSchema, newPageId } = addPage(schema, title);
            set({
                schema: nextSchema,
                selectedPageId: newPageId,
                selectedFieldId: null,
                ...pushHistory(schema),
            });
        },
        removePage: (pageId) => {
            const { schema, selectedPageId } = get();
            const nextSchema = removePage(schema, pageId);
            const nextSelectedPage = selectedPageId === pageId ? nextSchema.pageOrder[0] : selectedPageId;
            set({
                schema: nextSchema,
                selectedPageId: nextSelectedPage,
                selectedFieldId: null,
                ...pushHistory(schema),
            });
        },
        updatePage: (pageId, partial) => {
            const { schema } = get();
            const page = schema.pages[pageId];
            if (!page)
                return;
            const nextSchema = {
                ...schema,
                pages: {
                    ...schema.pages,
                    [pageId]: {
                        ...page,
                        ...partial,
                    },
                },
            };
            set({
                schema: nextSchema,
                ...pushHistory(schema),
            });
        },
        updateSettings: (partial) => {
            const { schema } = get();
            const nextSchema = {
                ...schema,
                settings: {
                    ...schema.settings,
                    ...partial,
                },
            };
            set({
                schema: nextSchema,
                ...pushHistory(schema),
            });
        },
        undo: () => {
            const { history, future, schema } = get();
            if (history.length === 0)
                return;
            const previous = history[history.length - 1];
            const nextHistory = history.slice(0, -1);
            set({
                schema: previous,
                history: nextHistory,
                future: [schema, ...future],
            });
        },
        redo: () => {
            const { history, future, schema } = get();
            if (future.length === 0)
                return;
            const next = future[0];
            const nextFuture = future.slice(1);
            set({
                schema: next,
                history: [...history, schema],
                future: nextFuture,
            });
        },
        clear: () => {
            const initial = createEmptySchema('New Form');
            set({
                schema: initial,
                selectedFieldId: null,
                selectedPageId: initial.pageOrder[0],
                history: [],
                future: [],
            });
        },
    };
});
