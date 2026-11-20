import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useDraggable } from '@dnd-kit/core';
import { Plus, GripVertical } from 'lucide-react';
import { cn } from '../../ui/utils';
export const DraggablePaletteItem = ({ item, onClick, }) => {
    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
        id: `palette_${item.type}`,
        data: {
            type: 'palette-item',
            fieldType: item.type,
        },
    });
    const Icon = item.icon;
    return (_jsxs("div", { ref: setNodeRef, className: cn('group flex items-center justify-between p-2 rounded-md border border-border/60 bg-background hover:bg-accent hover:border-primary/50 text-left transition-all shadow-sm select-none', isDragging && 'opacity-40 border-primary border-dashed'), children: [_jsxs("div", { className: "flex items-center space-x-2.5 flex-1 cursor-pointer", onClick: onClick, children: [_jsx("div", { className: "p-1 rounded bg-muted group-hover:bg-primary/10 group-hover:text-primary transition-colors", children: _jsx(Icon, { className: "h-4 w-4" }) }), _jsxs("div", { children: [_jsx("p", { className: "text-xs font-medium leading-none text-foreground", children: item.label }), _jsx("p", { className: "text-[10px] text-muted-foreground mt-0.5 line-clamp-1", children: item.description })] })] }), _jsxs("div", { className: "flex items-center space-x-1", children: [_jsx("button", { type: "button", onClick: onClick, className: "p-1 text-muted-foreground hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity", title: "Click to add to canvas", children: _jsx(Plus, { className: "h-3.5 w-3.5" }) }), _jsx("div", { ...attributes, ...listeners, className: "p-1 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground opacity-60 group-hover:opacity-100", title: "Drag onto canvas", children: _jsx(GripVertical, { className: "h-3.5 w-3.5" }) })] })] }));
};
