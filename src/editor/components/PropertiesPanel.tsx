import React, { useState } from 'react'
import { useBuilderStore } from '../store/builderStore'
import { Input } from '../../ui/input'
import { Textarea } from '../../ui/textarea'
import { Label } from '../../ui/label'
import { Switch } from '../../ui/switch'
import { Button } from '../../ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select'
import {
  Trash2,
  Plus,
  SlidersHorizontal,
  ShieldCheck,
  GitBranch,
  Settings2,
  Image as ImageIcon,
  Palette,
  LayoutTemplate,
  FormInput,
  ArrowRight,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignStartVertical,
  AlignCenterVertical,
  AlignEndVertical,
  StretchVertical,
  ArrowLeftRight,
  PanelTop,
  PanelLeft,
  PanelRight,
  EyeOff,
  Maximize2,
  Columns2,
  Columns3,
} from 'lucide-react'
import { ConditionGroup, PageBranchRule, ConditionOperator } from '../../core/types'

export const PropertiesPanel: React.FC = () => {
  const {
    schema,
    selectedFieldId,
    selectedPageId,
    updateField,
    removeField,
    updateSettings,
    selectField,
    updatePage,
    addRowLayoutColumn,
    setRowLayoutColumnWidths,
  } = useBuilderStore()

  // Main top panel tab: 'element' or 'form'
  const [panelTab, setPanelTab] = useState<'element' | 'form'>('element')
  const [activeSubTab, setActiveSubTab] = useState<'general' | 'options' | 'validation' | 'conditions' | 'media'>('general')

  const field = selectedFieldId ? schema.fields[selectedFieldId] : null

  // If no field is selected, default to 'form' view
  const currentTab = field ? panelTab : 'form'

  const activePage = schema.pages[selectedPageId] || schema.pages[schema.pageOrder[0]]
  const branchRules = activePage?.branchRules || []
  const candidateFields = Object.values(schema.fields).filter(
    (f) => !['heading', 'paragraph', 'separator', 'logo', 'image', 'avatar'].includes(f.type)
  )
  const candidatePages = schema.pageOrder
    .filter((id) => id !== activePage?.id)
    .map((id) => schema.pages[id])
    .filter(Boolean)

  const handleAddBranchRule = () => {
    if (!activePage || candidateFields.length === 0 || candidatePages.length === 0) return
    const newRule: PageBranchRule = {
      id: `rule_${Date.now()}`,
      fieldId: candidateFields[0].id,
      operator: 'equals',
      value: '',
      targetPageId: candidatePages[0].id,
    }
    updatePage(activePage.id, {
      branchRules: [...(activePage.branchRules || []), newRule],
    })
  }

  const handleUpdateBranchRule = (ruleId: string, partial: Partial<PageBranchRule>) => {
    if (!activePage) return
    const nextRules = (activePage.branchRules || []).map((r) =>
      r.id === ruleId ? { ...r, ...partial } : r
    )
    updatePage(activePage.id, { branchRules: nextRules })
  }

  const handleRemoveBranchRule = (ruleId: string) => {
    if (!activePage) return
    const nextRules = (activePage.branchRules || []).filter((r) => r.id !== ruleId)
    updatePage(activePage.id, { branchRules: nextRules })
  }

  const isRowLayout = field ? field.type === 'row-layout' : false
  const isMediaField = field ? ['logo', 'image', 'avatar'].includes(field.type) : false
  const hasOptions = field ? ['select', 'multi-select', 'radio-group', 'checkbox-group'].includes(field.type) : false
  const isTextInput = field ? ['text', 'email', 'password', 'phone', 'url', 'textarea', 'number'].includes(field.type) : false

  const handleAddOption = () => {
    if (!field) return
    const nextOpts = [...(field.options || [])]
    const idx = nextOpts.length + 1
    nextOpts.push({ label: `Option ${idx}`, value: `opt_${Date.now()}` })
    updateField(field.id, { options: nextOpts })
  }

  const handleUpdateOption = (index: number, label: string, value: string) => {
    if (!field) return
    const nextOpts = [...(field.options || [])]
    nextOpts[index] = { ...nextOpts[index], label, value }
    updateField(field.id, { options: nextOpts })
  }

  const handleRemoveOption = (index: number) => {
    if (!field) return
    const nextOpts = (field.options || []).filter((_, i) => i !== index)
    updateField(field.id, { options: nextOpts })
  }

  // Conditions handling
  const handleAddConditionGroup = () => {
    if (!field) return
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
    if (!field) return
    const nextConditions = (field.conditions || []).filter((_, i) => i !== index)
    updateField(field.id, { conditions: nextConditions })
  }

  return (
    <aside className="w-full lg:w-80 border-l bg-card flex flex-col h-full overflow-hidden shrink-0 select-none">
      {/* Top Main Mode Switcher: Element vs Form Settings */}
      <div className="p-2 border-b bg-muted/40">
        <div className="grid grid-cols-2 p-0.5 rounded-md bg-muted text-xs">
          <button
            type="button"
            onClick={() => setPanelTab('element')}
            disabled={!field}
            className={`flex items-center justify-center py-1.5 px-2 rounded font-medium transition-all ${
              currentTab === 'element'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground disabled:opacity-40 disabled:hover:text-muted-foreground'
            }`}
          >
            <FormInput className="h-3.5 w-3.5 mr-1.5" />
            <span>Element</span>
          </button>
          <button
            type="button"
            onClick={() => setPanelTab('form')}
            className={`flex items-center justify-center py-1.5 px-2 rounded font-medium transition-all ${
              currentTab === 'form'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <LayoutTemplate className="h-3.5 w-3.5 mr-1.5" />
            <span>Form & Theme</span>
          </button>
        </div>
      </div>

      {/* CONTENT: FORM SETTINGS & THEMES */}
      {currentTab === 'form' && (
        <div className="flex-1 overflow-y-auto p-3 space-y-4 text-xs">
          <div className="space-y-1">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Form Presentation Mode
            </h3>
            <p className="text-[11px] text-muted-foreground">
              Choose how the form pages and layout are presented to users.
            </p>
          </div>

          <div className="space-y-2">
            <div
              onClick={() => updateSettings({ formMode: 'single-page' })}
              className={`p-2.5 rounded-lg border cursor-pointer transition-all ${
                (schema.settings?.formMode || 'single-page') === 'single-page'
                  ? 'border-foreground bg-accent/60 shadow-sm'
                  : 'hover:border-border hover:bg-muted/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-foreground">Continuous Single Page</span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-muted">Standard</span>
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">
                All sections and fields render sequentially with smooth scrolling and unified submit.
              </p>
            </div>

            <div
              onClick={() => updateSettings({ formMode: 'wizard' })}
              className={`p-2.5 rounded-lg border cursor-pointer transition-all ${
                schema.settings?.formMode === 'wizard'
                  ? 'border-foreground bg-accent/60 shadow-sm'
                  : 'hover:border-border hover:bg-muted/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-foreground">Multi-Step Wizard</span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-muted">Stepped</span>
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">
                Paginated step-by-step navigation with Next/Previous buttons and step indicator.
              </p>
            </div>

            <div
              onClick={() => updateSettings({ formMode: 'conversational' })}
              className={`p-2.5 rounded-lg border cursor-pointer transition-all ${
                schema.settings?.formMode === 'conversational'
                  ? 'border-foreground bg-accent/60 shadow-sm'
                  : 'hover:border-border hover:bg-muted/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-foreground">Conversational Card</span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-muted">Focused</span>
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">
                Centered, elevated card experience optimized for onboarding, surveys, and conversions.
              </p>
            </div>
          </div>

          {/* Theme Preset */}
          <div className="pt-3 border-t space-y-2">
            <div className="flex items-center space-x-1.5">
              <Palette className="h-3.5 w-3.5 text-muted-foreground" />
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Monochrome Theme Preset
              </Label>
            </div>

            <Select
              value={schema.settings?.themePreset || 'monochrome-zinc'}
              onValueChange={(val: any) => updateSettings({ themePreset: val })}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monochrome-zinc">Monochrome Zinc (Default)</SelectItem>
                <SelectItem value="slate">Slate Modern</SelectItem>
                <SelectItem value="neutral">Neutral Pure</SelectItem>
                <SelectItem value="minimal-outline">Minimal Outline</SelectItem>
                <SelectItem value="flat-borderless">Flat Borderless</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Layout & Button Customization */}
          <div className="pt-3 border-t space-y-3">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Form Actions & Controls
            </Label>

            <div className="space-y-1.5">
              <Label className="text-xs">Submit Button Label</Label>
              <Input
                value={schema.settings?.submitButtonText || 'Submit'}
                onChange={(e) => updateSettings({ submitButtonText: e.target.value })}
                className="h-8 text-xs"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <div>
                <Label className="text-xs cursor-pointer">Show Reset Button</Label>
                <p className="text-[10px] text-muted-foreground">Allow user to clear all form fields</p>
              </div>
              <Switch
                checked={!!schema.settings?.showResetButton}
                onCheckedChange={(val) => updateSettings({ showResetButton: val })}
              />
            </div>

            {schema.settings?.showResetButton && (
              <div className="space-y-1.5">
                <Label className="text-xs">Reset Button Label</Label>
                <Input
                  value={schema.settings?.resetButtonText || 'Reset'}
                  onChange={(e) => updateSettings({ resetButtonText: e.target.value })}
                  className="h-8 text-xs"
                />
              </div>
            )}

            <div className="flex items-center justify-between pt-1">
              <div>
                <Label className="text-xs cursor-pointer">Show Step Progress Bar</Label>
                <p className="text-[10px] text-muted-foreground">Visual bar showing completion %</p>
              </div>
              <Switch
                checked={schema.settings?.showProgressBar ?? true}
                onCheckedChange={(val) => updateSettings({ showProgressBar: val })}
              />
            </div>
          </div>

          {/* STEP BRANCHING RULES (Active in multi-page forms) */}
          {schema.pageOrder.length > 1 && activePage && (
            <div className="pt-3 border-t space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-1.5">
                    <GitBranch className="h-3.5 w-3.5 text-muted-foreground" />
                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Step Branching Rules
                    </Label>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Jump to target steps when leaving <span className="font-semibold text-foreground">{activePage.title}</span>
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddBranchRule}
                  disabled={candidateFields.length === 0 || candidatePages.length === 0}
                  className="h-7 text-xs"
                >
                  <Plus className="h-3 w-3 mr-1" /> Add Rule
                </Button>
              </div>

              {branchRules.length === 0 ? (
                <div className="p-2.5 rounded-md border border-dashed text-center text-xs text-muted-foreground">
                  No jump rules for this step. Next button navigates to the subsequent step.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {branchRules.map((rule, idx) => {
                    const ruleField = schema.fields[rule.fieldId]
                    return (
                      <div key={rule.id} className="p-2.5 rounded-lg border bg-muted/30 space-y-2">
                        <div className="flex items-center justify-between text-xs font-semibold text-foreground">
                          <span>Rule #{idx + 1}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveBranchRule(rule.id)}
                            className="h-6 w-6 text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>

                        <div className="space-y-1.5">
                          <Label className="text-[11px] text-muted-foreground">If Field</Label>
                          <Select
                            value={rule.fieldId}
                            onValueChange={(val) => handleUpdateBranchRule(rule.id, { fieldId: val })}
                          >
                            <SelectTrigger className="h-7 text-xs">
                              <SelectValue placeholder="Select field" />
                            </SelectTrigger>
                            <SelectContent>
                              {candidateFields.map((f) => (
                                <SelectItem key={f.id} value={f.id}>
                                  {f.label} ({f.name || f.id})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <Label className="text-[11px] text-muted-foreground">Condition</Label>
                            <Select
                              value={rule.operator}
                              onValueChange={(val: ConditionOperator) =>
                                handleUpdateBranchRule(rule.id, { operator: val })
                              }
                            >
                              <SelectTrigger className="h-7 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="equals">Equals</SelectItem>
                                <SelectItem value="notEquals">Does Not Equal</SelectItem>
                                <SelectItem value="contains">Contains</SelectItem>
                                <SelectItem value="greaterThan">Greater Than</SelectItem>
                                <SelectItem value="lessThan">Less Than</SelectItem>
                                <SelectItem value="isEmpty">Is Empty</SelectItem>
                                <SelectItem value="isNotEmpty">Is Not Empty</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {!['isEmpty', 'isNotEmpty'].includes(rule.operator) && (
                            <div className="space-y-1">
                              <Label className="text-[11px] text-muted-foreground">Match Value</Label>
                              {ruleField?.options ? (
                                <Select
                                  value={String(rule.value || '')}
                                  onValueChange={(val) => handleUpdateBranchRule(rule.id, { value: val })}
                                >
                                  <SelectTrigger className="h-7 text-xs">
                                    <SelectValue placeholder="Select value" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {ruleField.options.map((opt) => (
                                      <SelectItem key={opt.value} value={opt.value}>
                                        {opt.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              ) : (
                                <Input
                                  value={String(rule.value || '')}
                                  placeholder="Value..."
                                  onChange={(e) => handleUpdateBranchRule(rule.id, { value: e.target.value })}
                                  className="h-7 text-xs"
                                />
                              )}
                            </div>
                          )}
                        </div>

                        <div className="space-y-1 pt-1 border-t">
                          <Label className="text-[11px] text-muted-foreground font-semibold flex items-center">
                            <ArrowRight className="h-3 w-3 mr-1 text-foreground" /> Jump To Step
                          </Label>
                          <Select
                            value={rule.targetPageId}
                            onValueChange={(val) => handleUpdateBranchRule(rule.id, { targetPageId: val })}
                          >
                            <SelectTrigger className="h-7 text-xs font-medium">
                              <SelectValue placeholder="Select target step" />
                            </SelectTrigger>
                            <SelectContent>
                              {candidatePages.map((p) => (
                                <SelectItem key={p.id} value={p.id}>
                                  {p.title}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* CONTENT: ELEMENT PROPERTIES INSPECTOR */}
      {currentTab === 'element' && field && (
        <>
          <div className="p-3 border-b flex items-center justify-between">
            <div className="truncate pr-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Properties Inspector
              </h3>
              <p className="text-xs font-medium text-foreground mt-0.5 truncate max-w-[180px]">
                {field.label} ({field.type})
              </p>
            </div>
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => selectField(null)}
                className="h-7 w-7 text-muted-foreground hover:text-foreground"
                title="Deselect"
              >
                <SlidersHorizontal className="h-3.5 w-3.5" />
              </Button>
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
          </div>

          <Tabs
            value={activeSubTab}
            onValueChange={(v: any) => setActiveSubTab(v)}
            className="flex-1 flex flex-col overflow-hidden"
          >
            <TabsList className={`grid m-2 ${isRowLayout ? 'grid-cols-2' : 'grid-cols-4'}`}>
              <TabsTrigger value="general" title="General Settings">
                <Settings2 className="h-3.5 w-3.5" />
              </TabsTrigger>
              {!isRowLayout && (
                isMediaField ? (
                  <TabsTrigger value="media" title="Media & Branding">
                    <ImageIcon className="h-3.5 w-3.5" />
                  </TabsTrigger>
                ) : hasOptions ? (
                  <TabsTrigger value="options" title="Options / Choices">
                    <span className="text-xs font-medium">Opt</span>
                  </TabsTrigger>
                ) : (
                  <TabsTrigger value="validation" title="Validation Rules">
                    <ShieldCheck className="h-3.5 w-3.5" />
                  </TabsTrigger>
                )
              )}
              {isMediaField ? (
                <TabsTrigger value="conditions" title="Conditional Display">
                  <GitBranch className="h-3.5 w-3.5" />
                </TabsTrigger>
              ) : (
                <>
                  {!isRowLayout && hasOptions && (
                    <TabsTrigger value="validation" title="Validation Rules">
                      <ShieldCheck className="h-3.5 w-3.5" />
                    </TabsTrigger>
                  )}
                  <TabsTrigger value="conditions" title="Conditional Logic">
                    <GitBranch className="h-3.5 w-3.5" />
                  </TabsTrigger>
                </>
              )}
            </TabsList>

            <div className="flex-1 overflow-y-auto p-3 space-y-4">
              {/* GENERAL TAB */}
              <TabsContent value="general" className="mt-0 space-y-3.5">
                {isRowLayout ? (
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Row / Grid Title</Label>
                      <Input
                        value={field.label}
                        onChange={(e) => updateField(field.id, { label: e.target.value })}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs">Column Spacing (Gap)</Label>
                      <Select
                        value={field.rowLayoutConfig?.gap || 'md'}
                        onValueChange={(val: any) =>
                          updateField(field.id, {
                            rowLayoutConfig: {
                              ...field.rowLayoutConfig,
                              columnIds: field.rowLayoutConfig?.columnIds || [],
                              gap: val,
                            },
                          })
                        }
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No Gap (gap-0)</SelectItem>
                          <SelectItem value="sm">Small (gap-2)</SelectItem>
                          <SelectItem value="md">Medium (gap-4)</SelectItem>
                          <SelectItem value="lg">Large (gap-6)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs">Vertical Alignment</Label>
                      <div className="grid grid-cols-4 gap-1 p-0.5 rounded-md border bg-muted/40 text-[11px]">
                        <button
                          type="button"
                          onClick={() =>
                            updateField(field.id, {
                              rowLayoutConfig: {
                                ...field.rowLayoutConfig,
                                columnIds: field.rowLayoutConfig?.columnIds || [],
                                alignItems: 'top',
                              },
                            })
                          }
                          className={`py-1 rounded flex items-center justify-center font-medium transition-colors ${
                            field.rowLayoutConfig?.alignItems === 'top'
                              ? 'bg-background text-foreground shadow-xs'
                              : 'text-muted-foreground hover:text-foreground'
                          }`}
                          title="Align to Top"
                        >
                          <AlignStartVertical className="h-3 w-3 mr-1" />
                          Top
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            updateField(field.id, {
                              rowLayoutConfig: {
                                ...field.rowLayoutConfig,
                                columnIds: field.rowLayoutConfig?.columnIds || [],
                                alignItems: 'center',
                              },
                            })
                          }
                          className={`py-1 rounded flex items-center justify-center font-medium transition-colors ${
                            field.rowLayoutConfig?.alignItems === 'center'
                              ? 'bg-background text-foreground shadow-xs'
                              : 'text-muted-foreground hover:text-foreground'
                          }`}
                          title="Align to Middle"
                        >
                          <AlignCenterVertical className="h-3 w-3 mr-1" />
                          Mid
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            updateField(field.id, {
                              rowLayoutConfig: {
                                ...field.rowLayoutConfig,
                                columnIds: field.rowLayoutConfig?.columnIds || [],
                                alignItems: 'bottom',
                              },
                            })
                          }
                          className={`py-1 rounded flex items-center justify-center font-medium transition-colors ${
                            field.rowLayoutConfig?.alignItems === 'bottom'
                              ? 'bg-background text-foreground shadow-xs'
                              : 'text-muted-foreground hover:text-foreground'
                          }`}
                          title="Align to Bottom"
                        >
                          <AlignEndVertical className="h-3 w-3 mr-1" />
                          Bot
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            updateField(field.id, {
                              rowLayoutConfig: {
                                ...field.rowLayoutConfig,
                                columnIds: field.rowLayoutConfig?.columnIds || [],
                                alignItems: 'stretch',
                              },
                            })
                          }
                          className={`py-1 rounded flex items-center justify-center font-medium transition-colors ${
                            !field.rowLayoutConfig?.alignItems || field.rowLayoutConfig?.alignItems === 'stretch'
                              ? 'bg-background text-foreground shadow-xs'
                              : 'text-muted-foreground hover:text-foreground'
                          }`}
                          title="Stretch to Fit"
                        >
                          <StretchVertical className="h-3 w-3 mr-1" />
                          Fit
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5 pt-1">
                      <Label className="text-xs">Horizontal Justification</Label>
                      <div className="grid grid-cols-4 gap-1 p-0.5 rounded-md border bg-muted/40 text-[11px]">
                        <button
                          type="button"
                          onClick={() =>
                            updateField(field.id, {
                              rowLayoutConfig: {
                                ...field.rowLayoutConfig,
                                columnIds: field.rowLayoutConfig?.columnIds || [],
                                justifyContent: 'start',
                              },
                            })
                          }
                          className={`py-1 rounded flex items-center justify-center font-medium transition-colors ${
                            !field.rowLayoutConfig?.justifyContent || field.rowLayoutConfig?.justifyContent === 'start'
                              ? 'bg-background text-foreground shadow-xs'
                              : 'text-muted-foreground hover:text-foreground'
                          }`}
                          title="Justify Start"
                        >
                          <AlignLeft className="h-3 w-3 mr-1" />
                          Start
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            updateField(field.id, {
                              rowLayoutConfig: {
                                ...field.rowLayoutConfig,
                                columnIds: field.rowLayoutConfig?.columnIds || [],
                                justifyContent: 'center',
                              },
                            })
                          }
                          className={`py-1 rounded flex items-center justify-center font-medium transition-colors ${
                            field.rowLayoutConfig?.justifyContent === 'center'
                              ? 'bg-background text-foreground shadow-xs'
                              : 'text-muted-foreground hover:text-foreground'
                          }`}
                          title="Justify Center"
                        >
                          <AlignCenter className="h-3 w-3 mr-1" />
                          Mid
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            updateField(field.id, {
                              rowLayoutConfig: {
                                ...field.rowLayoutConfig,
                                columnIds: field.rowLayoutConfig?.columnIds || [],
                                justifyContent: 'end',
                              },
                            })
                          }
                          className={`py-1 rounded flex items-center justify-center font-medium transition-colors ${
                            field.rowLayoutConfig?.justifyContent === 'end'
                              ? 'bg-background text-foreground shadow-xs'
                              : 'text-muted-foreground hover:text-foreground'
                          }`}
                          title="Justify End"
                        >
                          <AlignRight className="h-3 w-3 mr-1" />
                          End
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            updateField(field.id, {
                              rowLayoutConfig: {
                                ...field.rowLayoutConfig,
                                columnIds: field.rowLayoutConfig?.columnIds || [],
                                justifyContent: 'between',
                              },
                            })
                          }
                          className={`py-1 rounded flex items-center justify-center font-medium transition-colors ${
                            field.rowLayoutConfig?.justifyContent === 'between'
                              ? 'bg-background text-foreground shadow-xs'
                              : 'text-muted-foreground hover:text-foreground'
                          }`}
                          title="Space Between"
                        >
                          <ArrowLeftRight className="h-3 w-3 mr-1" />
                          Spread
                        </button>
                      </div>
                    </div>

                    <div className="pt-2 border-t space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-xs cursor-pointer">Fieldset Border</Label>
                          <p className="text-[10px] text-muted-foreground">Wrap columns in semantic fieldset border</p>
                        </div>
                        <Switch
                          checked={!!field.rowLayoutConfig?.fieldset}
                          onCheckedChange={(val) =>
                            updateField(field.id, {
                              rowLayoutConfig: {
                                ...field.rowLayoutConfig,
                                columnIds: field.rowLayoutConfig?.columnIds || [],
                                fieldset: val,
                              },
                            })
                          }
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs">Fieldset Legend Title</Label>
                        <Input
                          value={field.rowLayoutConfig?.legend || ''}
                          placeholder="e.g. Personal Information"
                          onChange={(e) =>
                            updateField(field.id, {
                              rowLayoutConfig: {
                                ...field.rowLayoutConfig,
                                columnIds: field.rowLayoutConfig?.columnIds || [],
                                legend: e.target.value,
                              },
                            })
                          }
                          className="h-8 text-xs"
                        />
                      </div>
                    </div>

                    <div className="pt-2 border-t space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs font-semibold">
                          Columns ({(field.rowLayoutConfig?.columnIds || []).length})
                        </Label>
                        {(field.rowLayoutConfig?.columnIds || []).length < 6 && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => addRowLayoutColumn(field.id)}
                            className="h-6 px-2 text-[10px]"
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Add Col
                          </Button>
                        )}
                      </div>

                      {(field.rowLayoutConfig?.columnIds || []).length === 2 && (
                        <div className="grid grid-cols-3 gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setRowLayoutColumnWidths(field.id, [6, 6])}
                            className="text-xs h-7 flex items-center justify-center"
                          >
                            <Columns2 className="h-3 w-3 mr-1" />
                            50:50
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setRowLayoutColumnWidths(field.id, [4, 8])}
                            className="text-xs h-7"
                          >
                            33:67
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setRowLayoutColumnWidths(field.id, [8, 4])}
                            className="text-xs h-7"
                          >
                            67:33
                          </Button>
                        </div>
                      )}

                      {(field.rowLayoutConfig?.columnIds || []).length === 3 && (
                        <div className="grid grid-cols-3 gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setRowLayoutColumnWidths(field.id, [4, 4, 4])}
                            className="text-xs h-7 flex items-center justify-center"
                          >
                            <Columns3 className="h-3 w-3 mr-1" />
                            1/3 ea
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setRowLayoutColumnWidths(field.id, [3, 6, 3])}
                            className="text-xs h-7"
                          >
                            25:50:25
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setRowLayoutColumnWidths(field.id, [6, 3, 3])}
                            className="text-xs h-7"
                          >
                            50:25:25
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Field Label / Title</Label>
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

                    {!isMediaField && (
                      <>
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

                        {/* Label Placement & Responsive Alignment */}
                        <div className="space-y-1.5 pt-1">
                          <Label className="text-xs">Label Position</Label>
                          <div className="grid grid-cols-4 gap-1 p-0.5 rounded-md border bg-muted/40 text-[11px]">
                            <button
                              type="button"
                              onClick={() => updateField(field.id, { labelPosition: 'top' })}
                              className={`py-1 rounded flex items-center justify-center font-medium transition-colors ${
                                !field.labelPosition || field.labelPosition === 'top'
                                  ? 'bg-background text-foreground shadow-xs'
                                  : 'text-muted-foreground hover:text-foreground'
                              }`}
                              title="Top of input (Default)"
                            >
                              <PanelTop className="h-3 w-3 mr-1" />
                              Top
                            </button>
                            <button
                              type="button"
                              onClick={() => updateField(field.id, { labelPosition: 'left' })}
                              className={`py-1 rounded flex items-center justify-center font-medium transition-colors ${
                                field.labelPosition === 'left'
                                  ? 'bg-background text-foreground shadow-xs'
                                  : 'text-muted-foreground hover:text-foreground'
                              }`}
                              title="Left side (auto-collapses on mobile)"
                            >
                              <PanelLeft className="h-3 w-3 mr-1" />
                              Left
                            </button>
                            <button
                              type="button"
                              onClick={() => updateField(field.id, { labelPosition: 'right' })}
                              className={`py-1 rounded flex items-center justify-center font-medium transition-colors ${
                                field.labelPosition === 'right'
                                  ? 'bg-background text-foreground shadow-xs'
                                  : 'text-muted-foreground hover:text-foreground'
                              }`}
                              title="Right side"
                            >
                              <PanelRight className="h-3 w-3 mr-1" />
                              Right
                            </button>
                            <button
                              type="button"
                              onClick={() => updateField(field.id, { labelPosition: 'hidden' })}
                              className={`py-1 rounded flex items-center justify-center font-medium transition-colors ${
                                field.labelPosition === 'hidden'
                                  ? 'bg-background text-foreground shadow-xs'
                                  : 'text-muted-foreground hover:text-foreground'
                              }`}
                              title="Hidden visually"
                            >
                              <EyeOff className="h-3 w-3 mr-1" />
                              Hide
                            </button>
                          </div>
                        </div>

                        {/* Element / Content Alignment */}
                        <div className="space-y-1.5 pt-1">
                          <Label className="text-xs">Element Alignment</Label>
                          <div className="grid grid-cols-4 gap-1 p-0.5 rounded-md border bg-muted/40 text-[11px]">
                            <button
                              type="button"
                              onClick={() => updateField(field.id, { elementAlign: 'left' })}
                              className={`py-1 rounded flex items-center justify-center font-medium transition-colors ${
                                !field.elementAlign || field.elementAlign === 'left'
                                  ? 'bg-background text-foreground shadow-xs'
                                  : 'text-muted-foreground hover:text-foreground'
                              }`}
                              title="Align Left"
                            >
                              <AlignLeft className="h-3 w-3 mr-1" />
                              Left
                            </button>
                            <button
                              type="button"
                              onClick={() => updateField(field.id, { elementAlign: 'center' })}
                              className={`py-1 rounded flex items-center justify-center font-medium transition-colors ${
                                field.elementAlign === 'center'
                                  ? 'bg-background text-foreground shadow-xs'
                                  : 'text-muted-foreground hover:text-foreground'
                              }`}
                              title="Align Center"
                            >
                              <AlignCenter className="h-3 w-3 mr-1" />
                              Mid
                            </button>
                            <button
                              type="button"
                              onClick={() => updateField(field.id, { elementAlign: 'right' })}
                              className={`py-1 rounded flex items-center justify-center font-medium transition-colors ${
                                field.elementAlign === 'right'
                                  ? 'bg-background text-foreground shadow-xs'
                                  : 'text-muted-foreground hover:text-foreground'
                              }`}
                              title="Align Right"
                            >
                              <AlignRight className="h-3 w-3 mr-1" />
                              Right
                            </button>
                            <button
                              type="button"
                              onClick={() => updateField(field.id, { elementAlign: 'full' })}
                              className={`py-1 rounded flex items-center justify-center font-medium transition-colors ${
                                field.elementAlign === 'full'
                                  ? 'bg-background text-foreground shadow-xs'
                                  : 'text-muted-foreground hover:text-foreground'
                              }`}
                              title="Stretch Full"
                            >
                              <Maximize2 className="h-3 w-3 mr-1" />
                              Full
                            </button>
                          </div>
                        </div>

                        {/* Width Preset */}
                        <div className="space-y-1.5 pt-1">
                          <Label className="text-xs">Field Width Preset</Label>
                          <div className="grid grid-cols-5 gap-1 p-0.5 rounded-md border bg-muted/40 text-[11px]">
                            {(
                              [
                                { id: 'auto', label: 'Auto' },
                                { id: '1/4', label: '25%' },
                                { id: '1/2', label: '50%' },
                                { id: '3/4', label: '75%' },
                                { id: 'full', label: '100%' },
                              ] as const
                            ).map((preset) => (
                              <button
                                key={preset.id}
                                type="button"
                                onClick={() => updateField(field.id, { widthPreset: preset.id })}
                                className={`py-1 rounded font-medium transition-colors ${
                                  (field.widthPreset || 'full') === preset.id
                                    ? 'bg-background text-foreground shadow-xs'
                                    : 'text-muted-foreground hover:text-foreground'
                                }`}
                              >
                                {preset.label}
                              </button>
                            ))}
                          </div>
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
                      </>
                    )}
                  </>
                )}
              </TabsContent>

              {/* MEDIA CONFIGURATION TAB */}
              {isMediaField && (
                <TabsContent value="media" className="mt-0 space-y-3.5">
                  {/* LOGO CONFIG */}
                  {field.type === 'logo' && (
                    <div className="space-y-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs">Logo Image URL</Label>
                        <Input
                          placeholder="https://yourdomain.com/logo.png"
                          value={field.logoConfig?.url || ''}
                          onChange={(e) =>
                            updateField(field.id, {
                              logoConfig: {
                                ...field.logoConfig,
                                url: e.target.value,
                              },
                            })
                          }
                          className="font-mono text-xs"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs">Alt Text</Label>
                        <Input
                          placeholder="Brand Logo"
                          value={field.logoConfig?.alt || ''}
                          onChange={(e) =>
                            updateField(field.id, {
                              logoConfig: {
                                ...field.logoConfig,
                                url: field.logoConfig?.url || '',
                                alt: e.target.value,
                              },
                            })
                          }
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs">Max Width (pixels)</Label>
                        <Input
                          type="number"
                          placeholder="150"
                          value={field.logoConfig?.width || 150}
                          onChange={(e) =>
                            updateField(field.id, {
                              logoConfig: {
                                ...field.logoConfig,
                                url: field.logoConfig?.url || '',
                                width: Number(e.target.value) || 150,
                              },
                            })
                          }
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs">Alignment</Label>
                        <Select
                          value={field.logoConfig?.align || 'left'}
                          onValueChange={(val: 'left' | 'center' | 'right') =>
                            updateField(field.id, {
                              logoConfig: {
                                ...field.logoConfig,
                                url: field.logoConfig?.url || '',
                                align: val,
                              },
                            })
                          }
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="left">Left Aligned</SelectItem>
                            <SelectItem value="center">Centered</SelectItem>
                            <SelectItem value="right">Right Aligned</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs">Redirect Link URL (optional)</Label>
                        <Input
                          placeholder="https://company.com"
                          value={field.logoConfig?.linkUrl || ''}
                          onChange={(e) =>
                            updateField(field.id, {
                              logoConfig: {
                                ...field.logoConfig,
                                url: field.logoConfig?.url || '',
                                linkUrl: e.target.value,
                              },
                            })
                          }
                          className="font-mono text-xs"
                        />
                      </div>
                    </div>
                  )}

                  {/* IMAGE BANNER CONFIG */}
                  {field.type === 'image' && (
                    <div className="space-y-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs">Image URL</Label>
                        <Input
                          placeholder="https://images.unsplash.com/..."
                          value={field.imageConfig?.url || ''}
                          onChange={(e) =>
                            updateField(field.id, {
                              imageConfig: {
                                ...field.imageConfig,
                                url: e.target.value,
                              },
                            })
                          }
                          className="font-mono text-xs"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs">Alt Description</Label>
                        <Input
                          placeholder="Hero visual banner"
                          value={field.imageConfig?.alt || ''}
                          onChange={(e) =>
                            updateField(field.id, {
                              imageConfig: {
                                ...field.imageConfig,
                                url: field.imageConfig?.url || '',
                                alt: e.target.value,
                              },
                            })
                          }
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs">Caption Text (optional)</Label>
                        <Input
                          placeholder="Photo by John Doe"
                          value={field.imageConfig?.caption || ''}
                          onChange={(e) =>
                            updateField(field.id, {
                              imageConfig: {
                                ...field.imageConfig,
                                url: field.imageConfig?.url || '',
                                caption: e.target.value,
                              },
                            })
                          }
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs">Aspect Ratio</Label>
                        <Select
                          value={field.imageConfig?.aspectRatio || 'auto'}
                          onValueChange={(val: 'auto' | '16/9' | '4/3' | '1/1') =>
                            updateField(field.id, {
                              imageConfig: {
                                ...field.imageConfig,
                                url: field.imageConfig?.url || '',
                                aspectRatio: val,
                              },
                            })
                          }
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="auto">Natural (Auto)</SelectItem>
                            <SelectItem value="16/9">16:9 Widescreen</SelectItem>
                            <SelectItem value="4/3">4:3 Standard</SelectItem>
                            <SelectItem value="1/1">1:1 Square</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs">Rounded Corners</Label>
                        <Select
                          value={field.imageConfig?.rounded || 'md'}
                          onValueChange={(val: 'none' | 'sm' | 'md' | 'lg' | 'full') =>
                            updateField(field.id, {
                              imageConfig: {
                                ...field.imageConfig,
                                url: field.imageConfig?.url || '',
                                rounded: val,
                              },
                            })
                          }
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Square (None)</SelectItem>
                            <SelectItem value="sm">Small</SelectItem>
                            <SelectItem value="md">Medium</SelectItem>
                            <SelectItem value="lg">Large Card</SelectItem>
                            <SelectItem value="full">Pill / Circle</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}

                  {/* AVATAR CONFIG */}
                  {field.type === 'avatar' && (
                    <div className="space-y-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs">Avatar Photo URL</Label>
                        <Input
                          placeholder="https://images.unsplash.com/..."
                          value={field.avatarConfig?.url || ''}
                          onChange={(e) =>
                            updateField(field.id, {
                              avatarConfig: {
                                ...field.avatarConfig,
                                url: e.target.value,
                              },
                            })
                          }
                          className="font-mono text-xs"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs">Subtitle / Position</Label>
                        <Input
                          placeholder="Product Manager, Acme"
                          value={field.avatarConfig?.subtitle || ''}
                          onChange={(e) =>
                            updateField(field.id, {
                              avatarConfig: {
                                ...field.avatarConfig,
                                url: field.avatarConfig?.url || '',
                                subtitle: e.target.value,
                              },
                            })
                          }
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs">Avatar Size</Label>
                        <Select
                          value={field.avatarConfig?.size || 'md'}
                          onValueChange={(val: 'sm' | 'md' | 'lg' | 'xl') =>
                            updateField(field.id, {
                              avatarConfig: {
                                ...field.avatarConfig,
                                url: field.avatarConfig?.url || '',
                                size: val,
                              },
                            })
                          }
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="sm">Small (32px)</SelectItem>
                            <SelectItem value="md">Medium (48px)</SelectItem>
                            <SelectItem value="lg">Large (64px)</SelectItem>
                            <SelectItem value="xl">Extra Large (80px)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs">Shape</Label>
                        <Select
                          value={field.avatarConfig?.shape || 'circle'}
                          onValueChange={(val: 'circle' | 'rounded') =>
                            updateField(field.id, {
                              avatarConfig: {
                                ...field.avatarConfig,
                                url: field.avatarConfig?.url || '',
                                shape: val,
                              },
                            })
                          }
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="circle">Circular</SelectItem>
                            <SelectItem value="rounded">Rounded Square</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs">Status Indicator Badge</Label>
                        <Select
                          value={field.avatarConfig?.status || 'none'}
                          onValueChange={(val: 'none' | 'online' | 'busy' | 'offline') =>
                            updateField(field.id, {
                              avatarConfig: {
                                ...field.avatarConfig,
                                url: field.avatarConfig?.url || '',
                                status: val,
                              },
                            })
                          }
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            <SelectItem value="online">Online (Active)</SelectItem>
                            <SelectItem value="busy">Busy (Pending)</SelectItem>
                            <SelectItem value="offline">Offline</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}
                </TabsContent>
              )}

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
              {!isMediaField && (
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
              )}

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
        </>
      )}
    </aside>
  )
}
