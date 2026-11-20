import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Controller, useFormContext } from 'react-hook-form';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Checkbox } from '../ui/checkbox';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from '../ui/select';
import { Slider } from '../ui/slider';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { Badge } from '../ui/badge';
import { Plus, Trash2, X } from 'lucide-react';
import { cn } from '../ui/utils';
export const FormFieldRenderer = ({ field, disabled = false, required = false, error, }) => {
    const { control } = useFormContext();
    const fieldKey = field.name || field.id;
    const isStatic = ['heading', 'paragraph', 'separator', 'button'].includes(field.type);
    const renderControl = () => {
        switch (field.type) {
            case 'text':
            case 'email':
            case 'password':
            case 'phone':
            case 'url':
                return (_jsx(Controller, { name: fieldKey, control: control, render: ({ field: formField }) => (_jsx(Input, { ...formField, type: field.type === 'email'
                            ? 'email'
                            : field.type === 'password'
                                ? 'password'
                                : field.type === 'phone'
                                    ? 'tel'
                                    : field.type === 'url'
                                        ? 'url'
                                        : 'text', value: String(formField.value ?? ''), placeholder: field.placeholder, disabled: disabled, className: cn(error && 'border-destructive focus-visible:ring-destructive') })) }));
            case 'number':
                return (_jsx(Controller, { name: fieldKey, control: control, render: ({ field: formField }) => (_jsx(Input, { ...formField, type: "number", value: formField.value ?? '', onChange: (e) => formField.onChange(e.target.value === '' ? '' : Number(e.target.value)), placeholder: field.placeholder, disabled: disabled, className: cn(error && 'border-destructive focus-visible:ring-destructive') })) }));
            case 'textarea':
                return (_jsx(Controller, { name: fieldKey, control: control, render: ({ field: formField }) => (_jsx(Textarea, { ...formField, value: String(formField.value ?? ''), placeholder: field.placeholder, disabled: disabled, rows: 4, className: cn(error && 'border-destructive focus-visible:ring-destructive') })) }));
            case 'select':
                return (_jsx(Controller, { name: fieldKey, control: control, render: ({ field: formField }) => (_jsxs(Select, { value: String(formField.value ?? ''), onValueChange: formField.onChange, disabled: disabled, children: [_jsx(SelectTrigger, { className: cn(error && 'border-destructive'), children: _jsx(SelectValue, { placeholder: field.placeholder || 'Select an option' }) }), _jsx(SelectContent, { children: (field.options || []).map((opt) => (_jsx(SelectItem, { value: opt.value, disabled: opt.disabled, children: opt.label }, opt.value))) })] })) }));
            case 'multi-select':
                return (_jsx(Controller, { name: fieldKey, control: control, render: ({ field: formField }) => {
                        const selectedValues = Array.isArray(formField.value)
                            ? formField.value
                            : [];
                        const toggleOption = (val) => {
                            if (selectedValues.includes(val)) {
                                formField.onChange(selectedValues.filter((v) => v !== val));
                            }
                            else {
                                formField.onChange([...selectedValues, val]);
                            }
                        };
                        return (_jsxs("div", { className: "space-y-2", children: [_jsx("div", { className: "flex flex-wrap gap-1.5 p-2 rounded-md border bg-background min-h-[38px]", children: selectedValues.length === 0 ? (_jsx("span", { className: "text-xs text-muted-foreground self-center", children: "Select one or more choices below" })) : (selectedValues.map((val) => {
                                        const opt = (field.options || []).find((o) => o.value === val);
                                        return (_jsxs(Badge, { variant: "secondary", className: "text-xs py-0.5 pl-2 pr-1 flex items-center space-x-1", children: [_jsx("span", { children: opt?.label || val }), _jsx("button", { type: "button", onClick: () => toggleOption(val), className: "hover:text-destructive p-0.5", children: _jsx(X, { className: "h-3 w-3" }) })] }, val));
                                    })) }), _jsx("div", { className: "flex flex-wrap gap-1 pt-1", children: (field.options || []).map((opt) => {
                                        const isChecked = selectedValues.includes(opt.value);
                                        return (_jsx("button", { type: "button", onClick: () => toggleOption(opt.value), disabled: disabled || opt.disabled, className: cn('text-xs px-2.5 py-1 rounded-full border transition-colors', isChecked
                                                ? 'bg-primary text-primary-foreground border-primary font-medium'
                                                : 'bg-muted/50 hover:bg-muted text-muted-foreground'), children: opt.label }, opt.value));
                                    }) })] }));
                    } }));
            case 'checkbox':
                return (_jsx(Controller, { name: fieldKey, control: control, render: ({ field: formField }) => (_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Checkbox, { id: field.id, checked: !!formField.value, onCheckedChange: formField.onChange, disabled: disabled }), _jsx("label", { htmlFor: field.id, className: "text-sm font-medium leading-none cursor-pointer", children: field.label })] })) }));
            case 'checkbox-group':
                return (_jsx(Controller, { name: fieldKey, control: control, render: ({ field: formField }) => {
                        const selectedValues = Array.isArray(formField.value)
                            ? formField.value
                            : [];
                        const toggleValue = (val) => {
                            if (selectedValues.includes(val)) {
                                formField.onChange(selectedValues.filter((v) => v !== val));
                            }
                            else {
                                formField.onChange([...selectedValues, val]);
                            }
                        };
                        return (_jsx("div", { className: "space-y-2", children: (field.options || []).map((opt) => (_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Checkbox, { id: `${field.id}_${opt.value}`, checked: selectedValues.includes(opt.value), onCheckedChange: () => toggleValue(opt.value), disabled: disabled || opt.disabled }), _jsx("label", { htmlFor: `${field.id}_${opt.value}`, className: "text-sm font-normal cursor-pointer", children: opt.label })] }, opt.value))) }));
                    } }));
            case 'switch':
                return (_jsx(Controller, { name: fieldKey, control: control, render: ({ field: formField }) => (_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Switch, { id: field.id, checked: !!formField.value, onCheckedChange: formField.onChange, disabled: disabled }), _jsx("label", { htmlFor: field.id, className: "text-sm font-medium leading-none cursor-pointer", children: field.label })] })) }));
            case 'radio-group':
                return (_jsx(Controller, { name: fieldKey, control: control, render: ({ field: formField }) => (_jsx(RadioGroup, { value: String(formField.value ?? ''), onValueChange: formField.onChange, disabled: disabled, className: "space-y-1.5", children: (field.options || []).map((opt) => (_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(RadioGroupItem, { value: opt.value, id: `${field.id}_${opt.value}` }), _jsx(Label, { htmlFor: `${field.id}_${opt.value}`, className: "cursor-pointer font-normal", children: opt.label })] }, opt.value))) })) }));
            case 'slider':
                return (_jsx(Controller, { name: fieldKey, control: control, render: ({ field: formField }) => {
                        const val = typeof formField.value === 'number' ? formField.value : 50;
                        return (_jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex justify-between text-xs text-muted-foreground", children: [_jsx("span", { children: "0" }), _jsx("span", { className: "font-semibold text-foreground", children: val }), _jsx("span", { children: "100" })] }), _jsx(Slider, { value: [val], min: 0, max: 100, step: 1, onValueChange: (vals) => formField.onChange(vals[0]), disabled: disabled })] }));
                    } }));
            case 'date':
                return (_jsx(Controller, { name: fieldKey, control: control, render: ({ field: formField }) => (_jsx(Input, { ...formField, type: "date", value: String(formField.value ?? ''), disabled: disabled, className: cn(error && 'border-destructive focus-visible:ring-destructive') })) }));
            case 'time':
                return (_jsx(Controller, { name: fieldKey, control: control, render: ({ field: formField }) => (_jsx(Input, { ...formField, type: "time", value: String(formField.value ?? ''), disabled: disabled, className: cn(error && 'border-destructive focus-visible:ring-destructive') })) }));
            case 'table-matrix': {
                const matrix = field.matrixConfig;
                if (!matrix)
                    return null;
                return (_jsx(Controller, { name: fieldKey, control: control, render: ({ field: formField }) => {
                        const matrixValues = (formField.value || {});
                        return (_jsx("div", { className: "overflow-x-auto border rounded-md", children: _jsxs("table", { className: "w-full text-sm text-left", children: [_jsx("thead", { className: "bg-muted text-muted-foreground text-xs uppercase", children: _jsxs("tr", { children: [_jsx("th", { className: "px-4 py-2" }), matrix.columns.map((col) => (_jsx("th", { className: "px-4 py-2 text-center", children: col.label }, col.id)))] }) }), _jsx("tbody", { className: "divide-y", children: matrix.rows.map((row) => (_jsxs("tr", { className: "hover:bg-muted/50", children: [_jsx("td", { className: "px-4 py-3 font-medium", children: row.label }), matrix.columns.map((col) => (_jsx("td", { className: "px-4 py-3 text-center", children: _jsx("input", { type: "radio", name: `${fieldKey}_${row.value}`, value: col.value, checked: matrixValues[row.value] === col.value, onChange: () => formField.onChange({
                                                            ...matrixValues,
                                                            [row.value]: col.value,
                                                        }), disabled: disabled, className: "h-4 w-4 text-primary" }) }, col.id)))] }, row.id))) })] }) }));
                    } }));
            }
            case 'repeat-row': {
                const repeat = field.repeatRowConfig;
                const template = repeat?.fieldTemplate || [];
                return (_jsx(Controller, { name: fieldKey, control: control, render: ({ field: formField }) => {
                        const items = Array.isArray(formField.value)
                            ? formField.value
                            : [{}];
                        const handleAddItem = () => {
                            if (repeat?.maxRows && items.length >= repeat.maxRows)
                                return;
                            formField.onChange([...items, {}]);
                        };
                        const handleRemoveItem = (index) => {
                            if (repeat?.minRows && items.length <= repeat.minRows)
                                return;
                            formField.onChange(items.filter((_, i) => i !== index));
                        };
                        const handleItemFieldChange = (index, subKey, val) => {
                            const updated = [...items];
                            updated[index] = { ...updated[index], [subKey]: val };
                            formField.onChange(updated);
                        };
                        return (_jsxs("div", { className: "space-y-3 border rounded-lg p-3 bg-muted/10", children: [_jsx("div", { className: "space-y-2", children: items.map((item, idx) => (_jsxs("div", { className: "flex items-start space-x-2 p-2.5 rounded-md border bg-background", children: [_jsx("div", { className: "flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2", children: template.map((subField) => (_jsxs("div", { className: "space-y-1", children: [_jsx("label", { className: "text-[11px] font-medium text-muted-foreground", children: subField.label }), _jsx(Input, { value: String(item[subField.name || subField.id] ?? ''), onChange: (e) => handleItemFieldChange(idx, subField.name || subField.id, e.target.value), placeholder: subField.placeholder, className: "h-8 text-xs" })] }, subField.id))) }), items.length > (repeat?.minRows || 1) && (_jsx(Button, { type: "button", variant: "ghost", size: "icon", onClick: () => handleRemoveItem(idx), className: "h-8 w-8 text-destructive hover:bg-destructive/10 shrink-0", title: "Remove item", children: _jsx(Trash2, { className: "h-4 w-4" }) }))] }, idx))) }), _jsxs(Button, { type: "button", variant: "outline", size: "sm", onClick: handleAddItem, disabled: repeat?.maxRows ? items.length >= repeat.maxRows : false, className: "h-8 text-xs", children: [_jsx(Plus, { className: "h-3.5 w-3.5 mr-1" }), repeat?.addButtonText || 'Add Item'] })] }));
                    } }));
            }
            case 'heading': {
                return (_jsx("h3", { className: "text-lg font-semibold tracking-tight text-foreground", children: field.defaultValue ? String(field.defaultValue) : field.label }));
            }
            case 'paragraph': {
                return (_jsx("p", { className: "text-sm text-muted-foreground", children: field.defaultValue ? String(field.defaultValue) : field.description || field.label }));
            }
            case 'separator': {
                return _jsx(Separator, { className: "my-2" });
            }
            case 'button': {
                return (_jsx(Button, { type: "button", variant: "secondary", disabled: disabled, onClick: () => { }, children: field.defaultValue ? String(field.defaultValue) : field.label }));
            }
            default:
                return (_jsx(Controller, { name: fieldKey, control: control, render: ({ field: formField }) => (_jsx(Input, { ...formField, value: String(formField.value ?? ''), placeholder: field.placeholder, disabled: disabled })) }));
        }
    };
    // Checkbox & switch have their own inline label layout
    if (field.type === 'checkbox' || field.type === 'switch') {
        return (_jsxs("div", { className: "space-y-1.5 py-1", children: [renderControl(), field.description && (_jsx("p", { className: "text-xs text-muted-foreground pl-6", children: field.description })), error && _jsx("p", { className: "text-xs font-medium text-destructive pl-6", children: error })] }));
    }
    if (isStatic) {
        return _jsx("div", { className: "py-1", children: renderControl() });
    }
    return (_jsxs("div", { className: "space-y-1.5 py-1", children: [field.labelPosition !== 'hidden' && (_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs(Label, { className: cn('text-sm font-medium', error && 'text-destructive'), children: [field.label, required && _jsx("span", { className: "text-destructive ml-1", children: "*" })] }), field.helpText && (_jsx("span", { className: "text-xs text-muted-foreground", children: field.helpText }))] })), renderControl(), field.description && (_jsx("p", { className: "text-xs text-muted-foreground", children: field.description })), error && (_jsx("p", { className: "text-xs font-medium text-destructive", children: error }))] }));
};
