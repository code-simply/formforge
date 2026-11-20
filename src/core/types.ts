export type FieldType =
  | 'text'
  | 'email'
  | 'password'
  | 'number'
  | 'phone'
  | 'url'
  | 'textarea'
  | 'select'
  | 'multi-select'
  | 'checkbox'
  | 'checkbox-group'
  | 'radio-group'
  | 'switch'
  | 'slider'
  | 'date'
  | 'time'
  | 'file'
  | 'table-matrix'
  | 'repeat-row'
  | 'heading'
  | 'paragraph'
  | 'separator'
  | 'button'
  | 'logo'
  | 'image'
  | 'avatar'
  | 'row-layout'

export type ConditionOperator =
  | 'equals'
  | 'notEquals'
  | 'contains'
  | 'notContains'
  | 'startsWith'
  | 'endsWith'
  | 'greaterThan'
  | 'greaterThanOrEqual'
  | 'lessThan'
  | 'lessThanOrEqual'
  | 'isEmpty'
  | 'isNotEmpty'
  | 'in'
  | 'notIn'

export type ConditionAction = 'show' | 'hide' | 'enable' | 'disable' | 'require'

export interface ConditionRule {
  fieldId: string
  operator: ConditionOperator
  value?: unknown
}

export interface ConditionGroup {
  logic: 'AND' | 'OR'
  rules: ConditionRule[]
  action: ConditionAction
}

export interface SelectOption {
  label: string
  value: string
  disabled?: boolean
  description?: string
}

export interface ValidationRule {
  type: 'min' | 'max' | 'minLength' | 'maxLength' | 'pattern' | 'custom'
  value: number | string
  message?: string
}

export interface MatrixRowConfig {
  id: string
  label: string
  value: string
}

export interface MatrixColumnConfig {
  id: string
  label: string
  value: string
}

export interface MatrixFieldConfig {
  cellType: 'radio' | 'checkbox' | 'text' | 'number'
  rows: MatrixRowConfig[]
  columns: MatrixColumnConfig[]
}

export interface RepeatRowConfig {
  minRows?: number
  maxRows?: number
  addButtonText?: string
  removeButtonText?: string
  fieldTemplate: FormField[]
}

export interface LogoConfig {
  url: string
  alt?: string
  align?: 'left' | 'center' | 'right'
  width?: number // in px
  linkUrl?: string
}

export interface ImageConfig {
  url: string
  alt?: string
  caption?: string
  aspectRatio?: 'auto' | '16/9' | '4/3' | '1/1'
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full'
  align?: 'left' | 'center' | 'right'
}

export interface AvatarConfig {
  url: string
  fallbackText?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  shape?: 'circle' | 'rounded'
  status?: 'online' | 'offline' | 'busy' | 'none'
  subtitle?: string
}

export interface RowLayoutConfig {
  columnIds: string[]
  gap?: 'none' | 'sm' | 'md' | 'lg'
  title?: string
  legend?: string
  fieldset?: boolean
  className?: string
}

export interface WebhookConfig {
  enabled: boolean
  url: string
  method?: 'POST' | 'PUT'
  headers?: Record<string, string>
  keyMapping?: Record<string, string> // internalKey -> externalKey
  staticPayload?: Record<string, unknown>
}

export interface FormField {
  id: string
  type: FieldType
  name: string
  label: string
  placeholder?: string
  description?: string
  helpText?: string
  defaultValue?: unknown
  required?: boolean
  disabled?: boolean
  readOnly?: boolean
  prefix?: string
  suffix?: string
  labelPosition?: 'top' | 'left' | 'right' | 'hidden'
  options?: SelectOption[]
  validationRules?: ValidationRule[]
  conditions?: ConditionGroup[]
  matrixConfig?: MatrixFieldConfig
  repeatRowConfig?: RepeatRowConfig
  logoConfig?: LogoConfig
  imageConfig?: ImageConfig
  avatarConfig?: AvatarConfig
  rowLayoutConfig?: RowLayoutConfig
  customAttributes?: Record<string, unknown>
}

export interface FormColumn {
  id: string
  width: number // 1 to 12 in a 12-column grid
  fieldIds: string[]
  columnIds?: string[] // Optional nested sub-columns inside this column
  className?: string
}

export interface FormRow {
  id: string
  columnIds: string[]
  title?: string // Legend / Title for fieldset row
  fieldset?: boolean // Wrap row in a fieldset border
  className?: string
  conditions?: ConditionGroup[]
}

export interface FormPage {
  id: string
  title: string
  description?: string
  rowIds: string[]
  conditions?: ConditionGroup[]
}

export interface FormSettings {
  submitButtonText?: string
  showResetButton?: boolean
  resetButtonText?: string
  layout?: 'standard' | 'compact' | 'comfortable'
  labelPosition?: 'top' | 'left'
  theme?: 'light' | 'dark' | 'system'
  showProgressBar?: boolean
  allowPageNavigation?: boolean
  formMode?: 'single-page' | 'wizard' | 'conversational'
  themePreset?: 'monochrome-zinc' | 'slate' | 'neutral' | 'minimal-outline' | 'flat-borderless'
  webhook?: WebhookConfig
}

export interface FormBuilderSchema {
  id: string
  version: string
  title: string
  description?: string
  settings: FormSettings
  pages: Record<string, FormPage>
  rows: Record<string, FormRow>
  columns: Record<string, FormColumn>
  fields: Record<string, FormField>
  pageOrder: string[]
}
