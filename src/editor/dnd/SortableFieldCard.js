import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { FIELD_REGISTRY } from '../registry';
import { GripVertical, Copy, Trash2, Layers } from 'lucide-react';
import { cn } from '../../ui/utils';
export const SortableFieldCard = ({ field, columnId, isSelected, onSelect, onDuplicate, onRemove, }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging, } = useSortable({
        id: field.id,
        data: {
            type: 'canvas-field',
            fieldId: field.id,
            columnId,
        },
    });
    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
    };
    const fieldDef = FIELD_REGISTRY.find((r) => r.type === field.type);
    const Icon = fieldDef?.icon || Layers;
    return (_jsxs("div", { ref: setNodeRef, style: style, onClick: (e) => {
            e.stopPropagation();
            onSelect();
        }, className: cn('group/field relative rounded-lg border bg-background p-3 transition-all cursor-pointer shadow-sm select-none', isSelected
            ? 'border-primary ring-2 ring-primary/20 bg-primary/[0.02]'
            : 'hover:border-primary/40', isDragging && 'opacity-30 border-dashed border-primary'), children: [_jsxs("div", { className: "flex items-center justify-between mb-1.5", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("div", { ...attributes, ...listeners, onClick: (e) => e.stopPropagation(), className: "cursor-grab active:cursor-grabbing text-muted-foreground/60 hover:text-foreground p-0.5 rounded", title: "Drag to reorder", children: _jsx(GripVertical, { className: "h-3.5 w-3.5" }) }), _jsx(Icon, { className: "h-3.5 w-3.5 text-primary" }), _jsx("span", { className: "text-xs font-semibold text-foreground", children: field.label }), field.required && (_jsx("span", { className: "text-destructive font-bold text-xs", children: "*" })), field.conditions && field.conditions.length > 0 && (_jsx(Badge, { variant: "secondary", className: "text-[9px] h-4 px-1", children: "Rule" }))] }), _jsxs("div", { className: "opacity-0 group-hover/field:opacity-100 flex items-center space-x-1 transition-opacity", children: [_jsx(Button, { variant: "ghost", size: "icon", onClick: (e) => {
                                    e.stopPropagation();
                                    onDuplicate();
                                }, className: "h-6 w-6 text-muted-foreground hover:text-foreground", title: "Duplicate", children: _jsx(Copy, { className: "h-3 w-3" }) }), _jsx(Button, { variant: "ghost", size: "icon", onClick: (e) => {
                                    e.stopPropagation();
                                    onRemove();
                                }, className: "h-6 w-6 text-destructive hover:bg-destructive/10", title: "Delete", children: _jsx(Trash2, { className: "h-3 w-3" }) })] })] }), _jsx("div", { className: "text-xs text-muted-foreground/70 border rounded px-2.5 py-1.5 bg-muted/20 truncate", children: field.placeholder || `[${field.type} control]` })] }));
};
