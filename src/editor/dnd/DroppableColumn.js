import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { SortableFieldCard } from './SortableFieldCard';
import { cn } from '../../ui/utils';
export const DroppableColumn = ({ column, fields, selectedFieldId, onSelectField, onDuplicateField, onRemoveField, }) => {
    const { setNodeRef, isOver } = useDroppable({
        id: `col_${column.id}`,
        data: {
            type: 'column',
            columnId: column.id,
        },
    });
    const span = Math.min(Math.max(column.width || 12, 1), 12);
    const colSpanClass = span === 1
        ? 'col-span-12 sm:col-span-1'
        : span === 2
            ? 'col-span-12 sm:col-span-2'
            : span === 3
                ? 'col-span-12 sm:col-span-3'
                : span === 4
                    ? 'col-span-12 sm:col-span-4'
                    : span === 5
                        ? 'col-span-12 sm:col-span-5'
                        : span === 6
                            ? 'col-span-12 sm:col-span-6'
                            : span === 7
                                ? 'col-span-12 sm:col-span-7'
                                : span === 8
                                    ? 'col-span-12 sm:col-span-8'
                                    : span === 9
                                        ? 'col-span-12 sm:col-span-9'
                                        : span === 10
                                            ? 'col-span-12 sm:col-span-10'
                                            : span === 11
                                                ? 'col-span-12 sm:col-span-11'
                                                : 'col-span-12';
    return (_jsx("div", { ref: setNodeRef, className: cn('min-h-[80px] rounded-lg border border-dashed p-2.5 flex flex-col space-y-2 transition-all', colSpanClass, isOver
            ? 'border-primary bg-primary/[0.04] ring-1 ring-primary/30'
            : 'border-border/80 bg-muted/20'), children: _jsx(SortableContext, { items: column.fieldIds, strategy: verticalListSortingStrategy, children: column.fieldIds.length === 0 ? (_jsxs("div", { className: "flex-1 flex flex-col items-center justify-center p-3 text-center rounded text-muted-foreground/60 select-none", children: [_jsxs("p", { className: "text-[11px] font-medium", children: ["Empty Column (", column.width, "/12)"] }), _jsx("p", { className: "text-[10px] mt-0.5", children: "Drag an element here or click from sidebar" })] })) : (column.fieldIds.map((fId) => {
                const field = fields[fId];
                if (!field)
                    return null;
                return (_jsx(SortableFieldCard, { field: field, columnId: column.id, isSelected: selectedFieldId === fId, onSelect: () => onSelectField(fId), onDuplicate: () => onDuplicateField(fId), onRemove: () => onRemoveField(fId) }, fId));
            })) }) }));
};
