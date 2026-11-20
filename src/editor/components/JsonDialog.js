import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, } from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Textarea } from '../../ui/textarea';
import { FormBuilderSchemaZod } from '../../core/schema';
import { migrateLegacyFormeoSchema } from '../../core/legacyMigrator';
import { Copy, Check, Sparkles } from 'lucide-react';
export const JsonDialog = ({ isOpen, onClose, mode, schema, onImport, }) => {
    const [text, setText] = useState('');
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState(null);
    const [migratedNotice, setMigratedNotice] = useState(false);
    useEffect(() => {
        if (isOpen) {
            setError(null);
            setMigratedNotice(false);
            if (mode === 'export') {
                setText(JSON.stringify(schema, null, 2));
            }
            else {
                setText('');
            }
        }
    }, [isOpen, mode, schema]);
    const handleCopy = () => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    const handleApplyImport = () => {
        try {
            const parsed = JSON.parse(text);
            // Auto-detect legacy Formeo schema format and migrate
            if (parsed.stages || (parsed.fields && Object.values(parsed.fields).some((f) => f?.tag || f?.attrs))) {
                const migrated = migrateLegacyFormeoSchema(parsed);
                onImport(migrated);
                setMigratedNotice(true);
                setTimeout(() => onClose(), 800);
                return;
            }
            const validated = FormBuilderSchemaZod.parse(parsed);
            onImport(validated);
            onClose();
        }
        catch (err) {
            setError(err?.message || 'Invalid form schema JSON format.');
        }
    };
    return (_jsx(Dialog, { open: isOpen, onOpenChange: (open) => !open && onClose(), children: _jsxs(DialogContent, { className: "max-w-2xl", children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: mode === 'export' ? 'Export Form Schema' : 'Import Form Schema' }), _jsx(DialogDescription, { children: mode === 'export'
                                ? 'Copy this portable JSON schema to persist or render your form definition anywhere.'
                                : 'Paste a modern schema or a legacy Formeo JSON schema below. Legacy schemas will be auto-migrated.' })] }), _jsxs("div", { className: "space-y-2 py-2", children: [_jsx(Textarea, { value: text, onChange: (e) => setText(e.target.value), readOnly: mode === 'export', rows: 14, className: "font-mono text-xs", placeholder: mode === 'import' ? 'Paste form schema JSON here (modern or legacy Formeo)...' : '' }), migratedNotice && (_jsxs("p", { className: "text-xs text-primary font-medium flex items-center", children: [_jsx(Sparkles, { className: "h-3.5 w-3.5 mr-1" }), "Detected legacy Formeo schema: successfully migrated to modern format!"] })), error && _jsx("p", { className: "text-xs text-destructive font-medium", children: error })] }), _jsxs(DialogFooter, { className: "flex justify-between items-center sm:justify-between", children: [mode === 'export' ? (_jsx(Button, { variant: "outline", size: "sm", onClick: handleCopy, children: copied ? (_jsxs(_Fragment, { children: [_jsx(Check, { className: "h-4 w-4 mr-1 text-green-600" }), "Copied!"] })) : (_jsxs(_Fragment, { children: [_jsx(Copy, { className: "h-4 w-4 mr-1" }), "Copy to Clipboard"] })) })) : (_jsx(Button, { size: "sm", onClick: handleApplyImport, children: "Apply Schema" })), _jsx(Button, { variant: "ghost", size: "sm", onClick: onClose, children: "Close" })] })] }) }));
};
