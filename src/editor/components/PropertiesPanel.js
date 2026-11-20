import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { useBuilderStore } from '../store/builderStore';
import { Input } from '../../ui/input';
import { Textarea } from '../../ui/textarea';
import { Label } from '../../ui/label';
import { Switch } from '../../ui/switch';
import { Button } from '../../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Trash2, Plus, SlidersHorizontal, ShieldCheck, GitBranch, Settings2 } from 'lucide-react';
export const PropertiesPanel = () => {
    const { schema, selectedFieldId, updateField, removeField, } = useBuilderStore();
    const [activeSubTab, setActiveSubTab] = useState('general');
    const field = selectedFieldId ? schema.fields[selectedFieldId] : null;
    if (!field) {
        return (_jsxs("aside", { className: "w-80 border-l bg-card flex flex-col h-full overflow-hidden shrink-0", children: [_jsx("div", { className: "p-4 border-b", children: _jsx("h3", { className: "text-xs font-semibold uppercase tracking-wider text-muted-foreground", children: "Properties Inspector" }) }), _jsxs("div", { className: "flex-1 flex flex-col items-center justify-center p-6 text-center text-muted-foreground", children: [_jsx(SlidersHorizontal, { className: "h-8 w-8 mb-2 opacity-30" }), _jsx("p", { className: "text-sm font-medium", children: "No Element Selected" }), _jsx("p", { className: "text-xs mt-1", children: "Select an element on the canvas to configure its settings, options, and rules." })] })] }));
    }
    const hasOptions = ['select', 'multi-select', 'radio-group', 'checkbox-group'].includes(field.type);
    const isTextInput = ['text', 'email', 'password', 'phone', 'url', 'textarea', 'number'].includes(field.type);
    const handleAddOption = () => {
        const nextOpts = [...(field.options || [])];
        const idx = nextOpts.length + 1;
        nextOpts.push({ label: `Option ${idx}`, value: `opt_${Date.now()}` });
        updateField(field.id, { options: nextOpts });
    };
    const handleUpdateOption = (index, label, value) => {
        const nextOpts = [...(field.options || [])];
        nextOpts[index] = { ...nextOpts[index], label, value };
        updateField(field.id, { options: nextOpts });
    };
    const handleRemoveOption = (index) => {
        const nextOpts = (field.options || []).filter((_, i) => i !== index);
        updateField(field.id, { options: nextOpts });
    };
    // Conditions handling
    const handleAddConditionGroup = () => {
        const otherFields = Object.values(schema.fields).filter((f) => f.id !== field.id);
        if (otherFields.length === 0)
            return;
        const newGroup = {
            logic: 'AND',
            action: 'show',
            rules: [
                {
                    fieldId: otherFields[0].id,
                    operator: 'equals',
                    value: '',
                },
            ],
        };
        const nextConditions = [...(field.conditions || []), newGroup];
        updateField(field.id, { conditions: nextConditions });
    };
    const handleRemoveConditionGroup = (index) => {
        const nextConditions = (field.conditions || []).filter((_, i) => i !== index);
        updateField(field.id, { conditions: nextConditions });
    };
    return (_jsxs("aside", { className: "w-80 border-l bg-card flex flex-col h-full overflow-hidden shrink-0", children: [_jsxs("div", { className: "p-3 border-b flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-xs font-semibold uppercase tracking-wider text-muted-foreground", children: "Properties Inspector" }), _jsxs("p", { className: "text-xs font-medium text-foreground mt-0.5 truncate max-w-[180px]", children: [field.label, " (", field.type, ")"] })] }), _jsx(Button, { variant: "ghost", size: "icon", onClick: () => removeField(field.id), className: "h-7 w-7 text-destructive hover:bg-destructive/10", title: "Delete element", children: _jsx(Trash2, { className: "h-4 w-4" }) })] }), _jsxs(Tabs, { value: activeSubTab, onValueChange: (v) => setActiveSubTab(v), className: "flex-1 flex flex-col overflow-hidden", children: [_jsxs(TabsList, { className: "grid grid-cols-4 m-2", children: [_jsx(TabsTrigger, { value: "general", title: "General Settings", children: _jsx(Settings2, { className: "h-3.5 w-3.5" }) }), hasOptions && (_jsx(TabsTrigger, { value: "options", title: "Options / Choices", children: _jsx("span", { className: "text-xs font-medium", children: "Opt" }) })), _jsx(TabsTrigger, { value: "validation", title: "Validation Rules", children: _jsx(ShieldCheck, { className: "h-3.5 w-3.5" }) }), _jsx(TabsTrigger, { value: "conditions", title: "Conditional Logic", children: _jsx(GitBranch, { className: "h-3.5 w-3.5" }) })] }), _jsxs("div", { className: "flex-1 overflow-y-auto p-3 space-y-4", children: [_jsxs(TabsContent, { value: "general", className: "mt-0 space-y-3.5", children: [_jsxs("div", { className: "space-y-1.5", children: [_jsx(Label, { className: "text-xs", children: "Field Label" }), _jsx(Input, { value: field.label, onChange: (e) => updateField(field.id, { label: e.target.value }) })] }), _jsxs("div", { className: "space-y-1.5", children: [_jsx(Label, { className: "text-xs", children: "Field Identifier (Name)" }), _jsx(Input, { value: field.name, onChange: (e) => updateField(field.id, { name: e.target.value }), className: "font-mono text-xs" })] }), _jsxs("div", { className: "space-y-1.5", children: [_jsx(Label, { className: "text-xs", children: "Placeholder" }), _jsx(Input, { value: field.placeholder || '', onChange: (e) => updateField(field.id, { placeholder: e.target.value }) })] }), _jsxs("div", { className: "space-y-1.5", children: [_jsx(Label, { className: "text-xs", children: "Description / Subtitle" }), _jsx(Textarea, { value: field.description || '', onChange: (e) => updateField(field.id, { description: e.target.value }), rows: 2 })] }), _jsxs("div", { className: "space-y-1.5", children: [_jsx(Label, { className: "text-xs", children: "Help Text (Tooltip/Right)" }), _jsx(Input, { value: field.helpText || '', onChange: (e) => updateField(field.id, { helpText: e.target.value }) })] }), _jsxs("div", { className: "pt-2 border-t space-y-3", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx(Label, { className: "text-xs cursor-pointer", children: "Required Field" }), _jsx("p", { className: "text-[10px] text-muted-foreground", children: "Mandatory for form submission" })] }), _jsx(Switch, { checked: !!field.required, onCheckedChange: (val) => updateField(field.id, { required: val }) })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx(Label, { className: "text-xs cursor-pointer", children: "Disabled State" }), _jsx("p", { className: "text-[10px] text-muted-foreground", children: "Read-only interactive state" })] }), _jsx(Switch, { checked: !!field.disabled, onCheckedChange: (val) => updateField(field.id, { disabled: val }) })] })] })] }), hasOptions && (_jsxs(TabsContent, { value: "options", className: "mt-0 space-y-3", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-xs font-medium", children: "Choices" }), _jsxs(Button, { variant: "outline", size: "sm", onClick: handleAddOption, className: "h-7 text-xs", children: [_jsx(Plus, { className: "h-3.5 w-3.5 mr-1" }), "Add Choice"] })] }), _jsx("div", { className: "space-y-2", children: (field.options || []).map((opt, idx) => (_jsxs("div", { className: "flex items-center space-x-1.5 p-2 rounded border bg-background text-xs", children: [_jsx(Input, { value: opt.label, onChange: (e) => handleUpdateOption(idx, e.target.value, opt.value), placeholder: "Label", className: "h-7 text-xs" }), _jsx(Input, { value: opt.value, onChange: (e) => handleUpdateOption(idx, opt.label, e.target.value), placeholder: "Value", className: "h-7 text-xs font-mono" }), _jsx(Button, { variant: "ghost", size: "icon", onClick: () => handleRemoveOption(idx), className: "h-7 w-7 text-destructive shrink-0", children: _jsx(Trash2, { className: "h-3.5 w-3.5" }) })] }, idx))) })] })), _jsxs(TabsContent, { value: "validation", className: "mt-0 space-y-3.5", children: [_jsx("p", { className: "text-xs text-muted-foreground", children: "Define Zod-backed validation constraints enforced on submission." }), isTextInput && (_jsxs(_Fragment, { children: [_jsxs("div", { className: "grid grid-cols-2 gap-2", children: [_jsxs("div", { className: "space-y-1.5", children: [_jsx(Label, { className: "text-xs", children: "Min Length" }), _jsx(Input, { type: "number", placeholder: "e.g. 2", onChange: (e) => {
                                                                    const val = e.target.value === '' ? undefined : Number(e.target.value);
                                                                    const rules = (field.validationRules || []).filter((r) => r.type !== 'minLength');
                                                                    if (val !== undefined)
                                                                        rules.push({ type: 'minLength', value: val });
                                                                    updateField(field.id, { validationRules: rules });
                                                                } })] }), _jsxs("div", { className: "space-y-1.5", children: [_jsx(Label, { className: "text-xs", children: "Max Length" }), _jsx(Input, { type: "number", placeholder: "e.g. 50", onChange: (e) => {
                                                                    const val = e.target.value === '' ? undefined : Number(e.target.value);
                                                                    const rules = (field.validationRules || []).filter((r) => r.type !== 'maxLength');
                                                                    if (val !== undefined)
                                                                        rules.push({ type: 'maxLength', value: val });
                                                                    updateField(field.id, { validationRules: rules });
                                                                } })] })] }), _jsxs("div", { className: "space-y-1.5", children: [_jsx(Label, { className: "text-xs", children: "Regex Pattern (optional)" }), _jsx(Input, { placeholder: "^[a-zA-Z0-9]+$", onChange: (e) => {
                                                            const val = e.target.value;
                                                            const rules = (field.validationRules || []).filter((r) => r.type !== 'pattern');
                                                            if (val)
                                                                rules.push({ type: 'pattern', value: val });
                                                            updateField(field.id, { validationRules: rules });
                                                        }, className: "font-mono text-xs" })] })] }))] }), _jsxs(TabsContent, { value: "conditions", className: "mt-0 space-y-3.5", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-xs font-medium", children: "Display Rules" }), _jsxs(Button, { variant: "outline", size: "sm", onClick: handleAddConditionGroup, className: "h-7 text-xs", children: [_jsx(Plus, { className: "h-3.5 w-3.5 mr-1" }), "Add Rule"] })] }), _jsx("div", { className: "space-y-3", children: (field.conditions || []).map((grp, gIdx) => (_jsxs("div", { className: "p-2.5 rounded border bg-background space-y-2 text-xs", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("span", { className: "font-semibold text-primary", children: [grp.action.toUpperCase(), " THIS FIELD IF:"] }), _jsx(Button, { variant: "ghost", size: "icon", onClick: () => handleRemoveConditionGroup(gIdx), className: "h-6 w-6 text-destructive", children: _jsx(Trash2, { className: "h-3 w-3" }) })] }), grp.rules.map((rule, rIdx) => {
                                                    return (_jsxs("div", { className: "space-y-1.5 pt-1", children: [_jsx(Label, { className: "text-[10px] text-muted-foreground", children: "When Field" }), _jsxs(Select, { value: rule.fieldId, onValueChange: (val) => {
                                                                    const nextConds = [...(field.conditions || [])];
                                                                    nextConds[gIdx].rules[rIdx].fieldId = val;
                                                                    updateField(field.id, { conditions: nextConds });
                                                                }, children: [_jsx(SelectTrigger, { className: "h-7 text-xs", children: _jsx(SelectValue, { placeholder: "Select target field" }) }), _jsx(SelectContent, { children: Object.values(schema.fields)
                                                                            .filter((f) => f.id !== field.id)
                                                                            .map((f) => (_jsxs(SelectItem, { value: f.id, children: [f.label, " (", f.name, ")"] }, f.id))) })] }), _jsx(Label, { className: "text-[10px] text-muted-foreground", children: "Operator" }), _jsxs(Select, { value: rule.operator, onValueChange: (op) => {
                                                                    const nextConds = [...(field.conditions || [])];
                                                                    nextConds[gIdx].rules[rIdx].operator = op;
                                                                    updateField(field.id, { conditions: nextConds });
                                                                }, children: [_jsx(SelectTrigger, { className: "h-7 text-xs", children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "equals", children: "Equals" }), _jsx(SelectItem, { value: "notEquals", children: "Does Not Equal" }), _jsx(SelectItem, { value: "contains", children: "Contains" }), _jsx(SelectItem, { value: "isEmpty", children: "Is Empty" }), _jsx(SelectItem, { value: "isNotEmpty", children: "Is Not Empty" })] })] }), rule.operator !== 'isEmpty' && rule.operator !== 'isNotEmpty' && (_jsxs("div", { className: "space-y-1", children: [_jsx(Label, { className: "text-[10px] text-muted-foreground", children: "Value" }), _jsx(Input, { value: String(rule.value ?? ''), onChange: (e) => {
                                                                            const nextConds = [...(field.conditions || [])];
                                                                            nextConds[gIdx].rules[rIdx].value = e.target.value;
                                                                            updateField(field.id, { conditions: nextConds });
                                                                        }, placeholder: "Target value...", className: "h-7 text-xs" })] }))] }, rIdx));
                                                })] }, gIdx))) })] })] })] })] }));
};
