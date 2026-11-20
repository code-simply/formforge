import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { useBuilderStore } from '../store/builderStore';
import { Button } from '../../ui/button';
import { Undo2, Redo2, Eye, EyeOff, Trash2, Download, Upload, Layers, Sparkles, Sun, Moon, Code2, } from 'lucide-react';
import { JsonDialog } from './JsonDialog';
import { CodeDialog } from './CodeDialog';
import { TEMPLATES } from '../templates';
export const HeaderBar = () => {
    const { schema, previewMode, setPreviewMode, undo, redo, history, future, clear, setSchema, } = useBuilderStore();
    const [jsonDialogOpen, setJsonDialogOpen] = useState(false);
    const [jsonDialogMode, setJsonDialogMode] = useState('export');
    const [codeDialogOpen, setCodeDialogOpen] = useState(false);
    const [isDark, setIsDark] = useState(false);
    const [showTemplatesMenu, setShowTemplatesMenu] = useState(false);
    const toggleTheme = () => {
        setIsDark(!isDark);
        if (!isDark) {
            document.documentElement.classList.add('dark');
        }
        else {
            document.documentElement.classList.remove('dark');
        }
    };
    const handleSelectTemplate = (templateId) => {
        const tmpl = TEMPLATES.find((t) => t.id === templateId);
        if (tmpl) {
            setSchema(tmpl.schema);
            setShowTemplatesMenu(false);
        }
    };
    return (_jsxs("header", { className: "flex h-14 items-center justify-between border-b bg-card px-4 shrink-0", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [_jsxs("div", { className: "flex items-center space-x-2 font-semibold text-primary", children: [_jsx(Layers, { className: "h-5 w-5" }), _jsx("span", { className: "text-sm font-bold tracking-tight", children: "Shadcn FormBuilder" })] }), _jsx("span", { className: "text-muted-foreground", children: "/" }), _jsx("input", { type: "text", value: schema.title, onChange: (e) => useBuilderStore.setState((state) => ({
                            schema: { ...state.schema, title: e.target.value },
                        })), placeholder: "Untitled Form", className: "h-8 bg-transparent px-2 text-sm font-medium focus:bg-accent focus:outline-none rounded" })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsxs("div", { className: "relative", children: [_jsxs(Button, { variant: "outline", size: "sm", onClick: () => setShowTemplatesMenu(!showTemplatesMenu), className: "text-xs", children: [_jsx(Sparkles, { className: "h-3.5 w-3.5 mr-1.5 text-amber-500" }), "Templates"] }), showTemplatesMenu && (_jsxs("div", { className: "absolute right-0 mt-1 w-64 rounded-md border bg-popover p-1 shadow-lg z-50 text-xs", children: [_jsx("div", { className: "px-2 py-1.5 font-semibold text-muted-foreground", children: "Load Preset Template" }), TEMPLATES.map((tmpl) => (_jsxs("button", { type: "button", onClick: () => handleSelectTemplate(tmpl.id), className: "w-full text-left px-2 py-1.5 rounded hover:bg-accent transition-colors", children: [_jsx("p", { className: "font-medium text-foreground", children: tmpl.title }), _jsx("p", { className: "text-[10px] text-muted-foreground mt-0.5 line-clamp-1", children: tmpl.description })] }, tmpl.id)))] }))] }), _jsx("div", { className: "h-4 w-[1px] bg-border mx-1" }), _jsx(Button, { variant: "ghost", size: "icon", onClick: undo, disabled: history.length === 0, title: "Undo (Ctrl+Z)", children: _jsx(Undo2, { className: "h-4 w-4" }) }), _jsx(Button, { variant: "ghost", size: "icon", onClick: redo, disabled: future.length === 0, title: "Redo (Ctrl+Y)", children: _jsx(Redo2, { className: "h-4 w-4" }) }), _jsx("div", { className: "h-4 w-[1px] bg-border mx-1" }), _jsxs(Button, { variant: "outline", size: "sm", onClick: () => setCodeDialogOpen(true), className: "text-xs", children: [_jsx(Code2, { className: "h-3.5 w-3.5 mr-1.5 text-primary" }), "Get Code"] }), _jsxs(Button, { variant: "outline", size: "sm", onClick: () => {
                            setJsonDialogMode('export');
                            setJsonDialogOpen(true);
                        }, className: "text-xs", children: [_jsx(Download, { className: "h-3.5 w-3.5 mr-1.5" }), "JSON"] }), _jsxs(Button, { variant: "outline", size: "sm", onClick: () => {
                            setJsonDialogMode('import');
                            setJsonDialogOpen(true);
                        }, className: "text-xs", children: [_jsx(Upload, { className: "h-3.5 w-3.5 mr-1.5" }), "Import"] }), _jsxs(Button, { variant: "ghost", size: "sm", onClick: () => {
                            if (confirm('Are you sure you want to clear the entire form?')) {
                                clear();
                            }
                        }, className: "text-destructive hover:bg-destructive/10 text-xs", children: [_jsx(Trash2, { className: "h-3.5 w-3.5 mr-1" }), "Clear"] }), _jsx(Button, { variant: "ghost", size: "icon", onClick: toggleTheme, title: isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode', children: isDark ? _jsx(Sun, { className: "h-4 w-4" }) : _jsx(Moon, { className: "h-4 w-4" }) }), _jsx("div", { className: "h-4 w-[1px] bg-border mx-1" }), _jsx(Button, { variant: previewMode ? 'secondary' : 'default', size: "sm", onClick: () => setPreviewMode(!previewMode), children: previewMode ? (_jsxs(_Fragment, { children: [_jsx(EyeOff, { className: "h-4 w-4 mr-1.5" }), "Exit Preview"] })) : (_jsxs(_Fragment, { children: [_jsx(Eye, { className: "h-4 w-4 mr-1.5" }), "Preview Form"] })) })] }), _jsx(JsonDialog, { isOpen: jsonDialogOpen, onClose: () => setJsonDialogOpen(false), mode: jsonDialogMode, schema: schema, onImport: (imported) => {
                    setSchema(imported);
                    setJsonDialogOpen(false);
                } }), _jsx(CodeDialog, { isOpen: codeDialogOpen, onClose: () => setCodeDialogOpen(false), schema: schema })] }));
};
