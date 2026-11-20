import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useBuilderStore } from '../store/builderStore';
import { Button } from '../../ui/button';
import { DroppableColumn } from '../dnd/DroppableColumn';
import { Plus, Trash2, Columns, ChevronUp, ChevronDown, } from 'lucide-react';
import { cn } from '../../ui/utils';
export const Canvas = () => {
    const { schema, selectedPageId, selectPage, addPage, removePage, updatePage, selectedFieldId, selectField, removeField, duplicateField, addRow, removeRow, moveRow, } = useBuilderStore();
    const currentPage = schema.pages[selectedPageId] || schema.pages[schema.pageOrder[0]];
    if (!currentPage) {
        return (_jsx("div", { className: "flex-1 flex items-center justify-center p-8 text-muted-foreground", children: "No active page found." }));
    }
    return (_jsxs("main", { className: "flex-1 overflow-y-auto bg-muted/30 p-6 flex flex-col items-center", children: [_jsxs("div", { className: "w-full max-w-4xl flex items-center justify-between mb-4 bg-background border rounded-lg p-1.5 shadow-sm", children: [_jsxs("div", { className: "flex items-center space-x-1 overflow-x-auto", children: [schema.pageOrder.map((pageId, idx) => {
                                const page = schema.pages[pageId];
                                const isSelected = pageId === selectedPageId;
                                return (_jsx("div", { className: "flex items-center", children: _jsxs("button", { type: "button", onClick: () => selectPage(pageId), className: cn('flex items-center px-3 py-1.5 text-xs font-medium rounded-md transition-colors', isSelected
                                            ? 'bg-primary text-primary-foreground shadow-sm'
                                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'), children: [_jsxs("span", { className: "mr-1.5 opacity-70", children: ["Step ", idx + 1, ":"] }), _jsx("span", { children: page?.title || `Page ${idx + 1}` })] }) }, pageId));
                            }), _jsxs(Button, { variant: "ghost", size: "sm", onClick: () => addPage(), className: "h-8 px-2 text-xs text-muted-foreground hover:text-foreground", children: [_jsx(Plus, { className: "h-3.5 w-3.5 mr-1" }), "Add Page"] })] }), schema.pageOrder.length > 1 && (_jsx(Button, { variant: "ghost", size: "icon", onClick: () => {
                            if (confirm('Delete this entire page and its elements?')) {
                                removePage(currentPage.id);
                            }
                        }, className: "h-7 w-7 text-destructive hover:bg-destructive/10", title: "Delete current page", children: _jsx(Trash2, { className: "h-3.5 w-3.5" }) }))] }), _jsxs("div", { className: "w-full max-w-4xl bg-background border rounded-xl shadow-sm p-6 space-y-6", children: [_jsxs("div", { className: "border-b pb-4 space-y-2", children: [_jsx("input", { type: "text", value: currentPage.title, onChange: (e) => updatePage(currentPage.id, { title: e.target.value }), placeholder: "Page Title", className: "w-full text-xl font-bold bg-transparent focus:bg-accent/50 rounded px-1.5 py-0.5 outline-none" }), _jsx("input", { type: "text", value: currentPage.description || '', onChange: (e) => updatePage(currentPage.id, { description: e.target.value }), placeholder: "Add an optional section description or instructions...", className: "w-full text-sm text-muted-foreground bg-transparent focus:bg-accent/50 rounded px-1.5 py-0.5 outline-none" })] }), _jsx("div", { className: "space-y-4", children: currentPage.rowIds.map((rowId, rIdx) => {
                            const row = schema.rows[rowId];
                            if (!row)
                                return null;
                            return (_jsxs("div", { className: "group/row relative border border-dashed border-border/80 rounded-lg p-3 hover:border-primary/50 transition-colors bg-card", children: [_jsxs("div", { className: "absolute -top-3 right-3 opacity-0 group-hover/row:opacity-100 transition-opacity bg-background border rounded-md shadow-sm px-1 py-0.5 flex items-center space-x-1 z-10", children: [_jsx("span", { className: "text-[10px] font-semibold text-muted-foreground px-1 uppercase", children: "Row" }), _jsx(Button, { variant: "ghost", size: "icon", disabled: rIdx === 0, onClick: () => moveRow(currentPage.id, rowId, rIdx - 1), className: "h-5 w-5", children: _jsx(ChevronUp, { className: "h-3 w-3" }) }), _jsx(Button, { variant: "ghost", size: "icon", disabled: rIdx === currentPage.rowIds.length - 1, onClick: () => moveRow(currentPage.id, rowId, rIdx + 1), className: "h-5 w-5", children: _jsx(ChevronDown, { className: "h-3 w-3" }) }), _jsx(Button, { variant: "ghost", size: "icon", onClick: () => removeRow(rowId), className: "h-5 w-5 text-destructive hover:bg-destructive/10", children: _jsx(Trash2, { className: "h-3 w-3" }) })] }), _jsx("div", { className: "grid grid-cols-12 gap-3", children: row.columnIds.map((colId) => {
                                            const col = schema.columns[colId];
                                            if (!col)
                                                return null;
                                            return (_jsx(DroppableColumn, { column: col, fields: schema.fields, selectedFieldId: selectedFieldId, onSelectField: (fId) => selectField(fId), onDuplicateField: (fId) => duplicateField(fId), onRemoveField: (fId) => removeField(fId) }, colId));
                                        }) })] }, rowId));
                        }) }), _jsxs("div", { className: "flex flex-col sm:flex-row items-center justify-between pt-2 border-t gap-2", children: [_jsxs("span", { className: "text-xs font-medium text-muted-foreground flex items-center", children: [_jsx(Columns, { className: "h-3.5 w-3.5 mr-1.5" }), "Add Row Layout:"] }), _jsxs("div", { className: "flex items-center space-x-1.5", children: [_jsx(Button, { variant: "outline", size: "sm", onClick: () => addRow(currentPage.id, [12]), className: "h-7 text-xs", children: "1 Column (Full)" }), _jsx(Button, { variant: "outline", size: "sm", onClick: () => addRow(currentPage.id, [6, 6]), className: "h-7 text-xs", children: "2 Columns (1/2 + 1/2)" }), _jsx(Button, { variant: "outline", size: "sm", onClick: () => addRow(currentPage.id, [4, 4, 4]), className: "h-7 text-xs", children: "3 Columns (1/3 each)" }), _jsx(Button, { variant: "outline", size: "sm", onClick: () => addRow(currentPage.id, [8, 4]), className: "h-7 text-xs", children: "2 Columns (2/3 + 1/3)" })] })] })] })] }));
};
