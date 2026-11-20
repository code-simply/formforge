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
} from 'lucide-react'
import { ConditionGroup } from '../../core/types'

export const PropertiesPanel: React.FC = () => {
  const {
    schema,
    selectedFieldId,
    updateField,
    removeField,
    updateSettings,
    selectField,
  } = useBuilderStore()

  // Main top panel tab: 'element' or 'form'
  const [panelTab, setPanelTab] = useState<'element' | 'form'>('element')
  const [activeSubTab, setActiveSubTab] = useState<'general' | 'options' | 'validation' | 'conditions' | 'media'>('general')

  const field = selectedFieldId ? schema.fields[selectedFieldId] : null

  // If no field is selected, default to 'form' view
  const currentTab = field ? panelTab : 'form'

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
            <TabsList className="grid grid-cols-4 m-2">
              <TabsTrigger value="general" title="General Settings">
                <Settings2 className="h-3.5 w-3.5" />
              </TabsTrigger>
              {isMediaField ? (
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
              )}
              {isMediaField ? (
                <TabsTrigger value="conditions" title="Conditional Display">
                  <GitBranch className="h-3.5 w-3.5" />
                </TabsTrigger>
              ) : (
                <>
                  {hasOptions && (
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
