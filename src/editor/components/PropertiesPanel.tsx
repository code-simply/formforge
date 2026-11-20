import React, { useState } from 'react'
import { useBuilderStore } from '../store/builderStore'
import { Input } from '../../ui/input'
import { Textarea } from '../../ui/textarea'
import { Label } from '../../ui/label'
import { Switch } from '../../ui/switch'
import { Button } from '../../ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select'
import { Trash2, Plus, SlidersHorizontal, ShieldCheck, GitBranch, Settings2 } from 'lucide-react'
import { ConditionGroup } from '../../core/types'

export const PropertiesPanel: React.FC = () => {
  const {
    schema,
    selectedFieldId,
    updateField,
    removeField,
  } = useBuilderStore()

  const [activeSubTab, setActiveSubTab] = useState<'general' | 'options' | 'validation' | 'conditions'>('general')

  const field = selectedFieldId ? schema.fields[selectedFieldId] : null

  if (!field) {
    return (
      <aside className="w-80 border-l bg-card flex flex-col h-full overflow-hidden shrink-0">
        <div className="p-4 border-b">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Properties Inspector
          </h3>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-muted-foreground">
          <SlidersHorizontal className="h-8 w-8 mb-2 opacity-30" />
          <p className="text-sm font-medium">No Element Selected</p>
          <p className="text-xs mt-1">Select an element on the canvas to configure its settings, options, and rules.</p>
        </div>
      </aside>
    )
  }

  const hasOptions = ['select', 'multi-select', 'radio-group', 'checkbox-group'].includes(field.type)
  const isTextInput = ['text', 'email', 'password', 'phone', 'url', 'textarea', 'number'].includes(field.type)

  const handleAddOption = () => {
    const nextOpts = [...(field.options || [])]
    const idx = nextOpts.length + 1
    nextOpts.push({ label: `Option ${idx}`, value: `opt_${Date.now()}` })
    updateField(field.id, { options: nextOpts })
  }

  const handleUpdateOption = (index: number, label: string, value: string) => {
    const nextOpts = [...(field.options || [])]
    nextOpts[index] = { ...nextOpts[index], label, value }
    updateField(field.id, { options: nextOpts })
  }

  const handleRemoveOption = (index: number) => {
    const nextOpts = (field.options || []).filter((_, i) => i !== index)
    updateField(field.id, { options: nextOpts })
  }

  // Conditions handling
  const handleAddConditionGroup = () => {
    const otherFields = Object.values(schema.fields).filter((f) => f.id !== field.id)
    if (otherFields.length === 0) return

    const newGroup: ConditionGroup = {
      logic: 'AND',
      action: 'show',
      rules: [
        {
          fieldId: otherFields[0].id,
          operator: 'equals',
          value: '',
        },
      ],
    }

    const nextConditions = [...(field.conditions || []), newGroup]
    updateField(field.id, { conditions: nextConditions })
  }

  const handleRemoveConditionGroup = (index: number) => {
    const nextConditions = (field.conditions || []).filter((_, i) => i !== index)
    updateField(field.id, { conditions: nextConditions })
  }

  return (
    <aside className="w-80 border-l bg-card flex flex-col h-full overflow-hidden shrink-0">
      <div className="p-3 border-b flex items-center justify-between">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Properties Inspector
          </h3>
          <p className="text-xs font-medium text-foreground mt-0.5 truncate max-w-[180px]">
            {field.label} ({field.type})
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => removeField(field.id)}
          className="h-7 w-7 text-destructive hover:bg-destructive/10"
          title="Delete element"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <Tabs
        value={activeSubTab}
        onValueChange={(v: any) => setActiveSubTab(v)}
        className="flex-1 flex flex-col overflow-hidden"
      >
        <TabsList className="grid grid-cols-4 m-2">
          <TabsTrigger value="general" title="General Settings">
            <Settings2 className="h-3.5 w-3.5" />
          </TabsTrigger>
          {hasOptions && (
            <TabsTrigger value="options" title="Options / Choices">
              <span className="text-xs font-medium">Opt</span>
            </TabsTrigger>
          )}
          <TabsTrigger value="validation" title="Validation Rules">
            <ShieldCheck className="h-3.5 w-3.5" />
          </TabsTrigger>
          <TabsTrigger value="conditions" title="Conditional Logic">
            <GitBranch className="h-3.5 w-3.5" />
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          {/* GENERAL TAB */}
          <TabsContent value="general" className="mt-0 space-y-3.5">
            <div className="space-y-1.5">
              <Label className="text-xs">Field Label</Label>
              <Input
                value={field.label}
                onChange={(e) => updateField(field.id, { label: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Field Identifier (Name)</Label>
              <Input
                value={field.name}
                onChange={(e) => updateField(field.id, { name: e.target.value })}
                className="font-mono text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Placeholder</Label>
              <Input
                value={field.placeholder || ''}
                onChange={(e) => updateField(field.id, { placeholder: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Description / Subtitle</Label>
              <Textarea
                value={field.description || ''}
                onChange={(e) => updateField(field.id, { description: e.target.value })}
                rows={2}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Help Text (Tooltip/Right)</Label>
              <Input
                value={field.helpText || ''}
                onChange={(e) => updateField(field.id, { helpText: e.target.value })}
              />
            </div>

            <div className="pt-2 border-t space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-xs cursor-pointer">Required Field</Label>
                  <p className="text-[10px] text-muted-foreground">Mandatory for form submission</p>
                </div>
                <Switch
                  checked={!!field.required}
                  onCheckedChange={(val) => updateField(field.id, { required: val })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-xs cursor-pointer">Disabled State</Label>
                  <p className="text-[10px] text-muted-foreground">Read-only interactive state</p>
                </div>
                <Switch
                  checked={!!field.disabled}
                  onCheckedChange={(val) => updateField(field.id, { disabled: val })}
                />
              </div>
            </div>
          </TabsContent>

          {/* OPTIONS TAB */}
          {hasOptions && (
            <TabsContent value="options" className="mt-0 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium">Choices</span>
                <Button variant="outline" size="sm" onClick={handleAddOption} className="h-7 text-xs">
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Add Choice
                </Button>
              </div>

              <div className="space-y-2">
                {(field.options || []).map((opt, idx) => (
                  <div key={idx} className="flex items-center space-x-1.5 p-2 rounded border bg-background text-xs">
                    <Input
                      value={opt.label}
                      onChange={(e) => handleUpdateOption(idx, e.target.value, opt.value)}
                      placeholder="Label"
                      className="h-7 text-xs"
                    />
                    <Input
                      value={opt.value}
                      onChange={(e) => handleUpdateOption(idx, opt.label, e.target.value)}
                      placeholder="Value"
                      className="h-7 text-xs font-mono"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveOption(idx)}
                      className="h-7 w-7 text-destructive shrink-0"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            </TabsContent>
          )}

          {/* VALIDATION TAB */}
          <TabsContent value="validation" className="mt-0 space-y-3.5">
            <p className="text-xs text-muted-foreground">
              Define Zod-backed validation constraints enforced on submission.
            </p>

            {isTextInput && (
              <>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Min Length</Label>
                    <Input
                      type="number"
                      placeholder="e.g. 2"
                      onChange={(e) => {
                        const val = e.target.value === '' ? undefined : Number(e.target.value)
                        const rules = (field.validationRules || []).filter((r) => r.type !== 'minLength')
                        if (val !== undefined) rules.push({ type: 'minLength', value: val })
                        updateField(field.id, { validationRules: rules })
                      }}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Max Length</Label>
                    <Input
                      type="number"
                      placeholder="e.g. 50"
                      onChange={(e) => {
                        const val = e.target.value === '' ? undefined : Number(e.target.value)
                        const rules = (field.validationRules || []).filter((r) => r.type !== 'maxLength')
                        if (val !== undefined) rules.push({ type: 'maxLength', value: val })
                        updateField(field.id, { validationRules: rules })
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">Regex Pattern (optional)</Label>
                  <Input
                    placeholder="^[a-zA-Z0-9]+$"
                    onChange={(e) => {
                      const val = e.target.value
                      const rules = (field.validationRules || []).filter((r) => r.type !== 'pattern')
                      if (val) rules.push({ type: 'pattern', value: val })
                      updateField(field.id, { validationRules: rules })
                    }}
                    className="font-mono text-xs"
                  />
                </div>
              </>
            )}
          </TabsContent>

          {/* CONDITIONS TAB */}
          <TabsContent value="conditions" className="mt-0 space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium">Display Rules</span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddConditionGroup}
                className="h-7 text-xs"
              >
                <Plus className="h-3.5 w-3.5 mr-1" />
                Add Rule
              </Button>
            </div>

            <div className="space-y-3">
              {(field.conditions || []).map((grp, gIdx) => (
                <div key={gIdx} className="p-2.5 rounded border bg-background space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-primary">
                      {grp.action.toUpperCase()} THIS FIELD IF:
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveConditionGroup(gIdx)}
                      className="h-6 w-6 text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>

                  {grp.rules.map((rule, rIdx) => {
                    return (
                      <div key={rIdx} className="space-y-1.5 pt-1">
                        <Label className="text-[10px] text-muted-foreground">When Field</Label>
                        <Select
                          value={rule.fieldId}
                          onValueChange={(val) => {
                            const nextConds = [...(field.conditions || [])]
                            nextConds[gIdx].rules[rIdx].fieldId = val
                            updateField(field.id, { conditions: nextConds })
                          }}
                        >
                          <SelectTrigger className="h-7 text-xs">
                            <SelectValue placeholder="Select target field" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.values(schema.fields)
                              .filter((f) => f.id !== field.id)
                              .map((f) => (
                                <SelectItem key={f.id} value={f.id}>
                                  {f.label} ({f.name})
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>

                        <Label className="text-[10px] text-muted-foreground">Operator</Label>
                        <Select
                          value={rule.operator}
                          onValueChange={(op: any) => {
                            const nextConds = [...(field.conditions || [])]
                            nextConds[gIdx].rules[rIdx].operator = op
                            updateField(field.id, { conditions: nextConds })
                          }}
                        >
                          <SelectTrigger className="h-7 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="equals">Equals</SelectItem>
                            <SelectItem value="notEquals">Does Not Equal</SelectItem>
                            <SelectItem value="contains">Contains</SelectItem>
                            <SelectItem value="isEmpty">Is Empty</SelectItem>
                            <SelectItem value="isNotEmpty">Is Not Empty</SelectItem>
                          </SelectContent>
                        </Select>

                        {rule.operator !== 'isEmpty' && rule.operator !== 'isNotEmpty' && (
                          <div className="space-y-1">
                            <Label className="text-[10px] text-muted-foreground">Value</Label>
                            <Input
                              value={String(rule.value ?? '')}
                              onChange={(e) => {
                                const nextConds = [...(field.conditions || [])]
                                nextConds[gIdx].rules[rIdx].value = e.target.value
                                updateField(field.id, { conditions: nextConds })
                              }}
                              placeholder="Target value..."
                              className="h-7 text-xs"
                            />
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </aside>
  )
}
