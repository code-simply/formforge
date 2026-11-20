import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { FIELD_REGISTRY } from '../registry';
import { useBuilderStore } from '../store/builderStore';
import { DraggablePaletteItem } from '../dnd/DraggablePaletteItem';
export const PaletteSidebar = () => {
    const { addField, schema, selectedPageId } = useBuilderStore();
    const categories = [
        { id: 'input', label: 'Inputs & Text' },
        { id: 'choice', label: 'Selections & Choices' },
        { id: 'advanced', label: 'Advanced & Complex' },
        { id: 'layout', label: 'Layout & Content' },
    ];
    // Add field to the first available column of active page
    const handleAddField = (type) => {
        const page = schema.pages[selectedPageId] || schema.pages[schema.pageOrder[0]];
        if (!page || page.rowIds.length === 0)
            return;
        const firstRow = schema.rows[page.rowIds[0]];
        if (!firstRow || firstRow.columnIds.length === 0)
            return;
        const firstColId = firstRow.columnIds[0];
        addField(firstColId, type);
    };
    return (_jsxs("aside", { className: "w-64 border-r bg-card flex flex-col h-full overflow-hidden shrink-0", children: [_jsxs("div", { className: "p-3 border-b", children: [_jsx("h3", { className: "text-xs font-semibold uppercase tracking-wider text-muted-foreground", children: "Form Elements" }), _jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: "Drag to canvas or click to add" })] }), _jsx("div", { className: "flex-1 overflow-y-auto p-3 space-y-5", children: categories.map((cat) => {
                    const items = FIELD_REGISTRY.filter((f) => f.category === cat.id);
                    if (items.length === 0)
                        return null;
                    return (_jsxs("div", { className: "space-y-2", children: [_jsx("span", { className: "text-xs font-medium text-muted-foreground", children: cat.label }), _jsx("div", { className: "grid grid-cols-1 gap-1.5", children: items.map((item) => (_jsx(DraggablePaletteItem, { item: item, onClick: () => handleAddField(item.type) }, item.type))) })] }, cat.id));
                }) })] }));
};
