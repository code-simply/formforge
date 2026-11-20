import { z } from 'zod'

export const FieldTypeSchema = z.enum([
  'text',
  'email',
  'password',
  'number',
  'phone',
  'url',
  'textarea',
  'select',
  'multi-select',
  'checkbox',
  'checkbox-group',
  'radio-group',
  'switch',
  'slider',
  'date',
  'time',
  'file',
  'table-matrix',
  'repeat-row',
  'heading',
  'paragraph',
  'separator',
  'button',
  'logo',
  'image',
  'avatar',
])

export const ConditionOperatorSchema = z.enum([
  'equals',
  'notEquals',
  'contains',
  'notContains',
  'startsWith',
  'endsWith',
  'greaterThan',
  'greaterThanOrEqual',
  'lessThan',
  'lessThanOrEqual',
  'isEmpty',
  'isNotEmpty',
  'in',
  'notIn',
])

export const ConditionActionSchema = z.enum(['show', 'hide', 'enable', 'disable', 'require'])

export const ConditionRuleSchema = z.object({
  fieldId: z.string(),
  operator: ConditionOperatorSchema,
  value: z.unknown().optional(),
})

export const ConditionGroupSchema = z.object({
  logic: z.enum(['AND', 'OR']).default('AND'),
  rules: z.array(ConditionRuleSchema).default([]),
  action: ConditionActionSchema.default('show'),
})

export const SelectOptionSchema = z.object({
  label: z.string(),
  value: z.string(),
  disabled: z.boolean().optional(),
  description: z.string().optional(),
})

export const ValidationRuleSchema = z.object({
  type: z.enum(['min', 'max', 'minLength', 'maxLength', 'pattern', 'custom']),
  value: z.union([z.number(), z.string()]),
  message: z.string().optional(),
})

export const MatrixRowConfigSchema = z.object({
  id: z.string(),
  label: z.string(),
  value: z.string(),
})

export const MatrixColumnConfigSchema = z.object({
  id: z.string(),
  label: z.string(),
  value: z.string(),
})

export const MatrixFieldConfigSchema = z.object({
  cellType: z.enum(['radio', 'checkbox', 'text', 'number']).default('radio'),
  rows: z.array(MatrixRowConfigSchema).default([]),
  columns: z.array(MatrixColumnConfigSchema).default([]),
})

export const LogoConfigSchema = z.object({
  url: z.string(),
  alt: z.string().optional(),
  align: z.enum(['left', 'center', 'right']).default('left'),
  width: z.number().optional(),
  linkUrl: z.string().optional(),
})

export const ImageConfigSchema = z.object({
  url: z.string(),
  alt: z.string().optional(),
  caption: z.string().optional(),
  aspectRatio: z.enum(['auto', '16/9', '4/3', '1/1']).default('auto'),
  rounded: z.enum(['none', 'sm', 'md', 'lg', 'full']).default('md'),
  align: z.enum(['left', 'center', 'right']).default('center'),
})

export const AvatarConfigSchema = z.object({
  url: z.string(),
  fallbackText: z.string().optional(),
  size: z.enum(['sm', 'md', 'lg', 'xl']).default('md'),
  shape: z.enum(['circle', 'rounded']).default('circle'),
  status: z.enum(['online', 'offline', 'busy', 'none']).default('none'),
  subtitle: z.string().optional(),
})

export const WebhookConfigSchema = z.object({
  enabled: z.boolean().default(false),
  url: z.string().default(''),
  method: z.enum(['POST', 'PUT']).default('POST'),
  headers: z.record(z.string()).optional(),
  keyMapping: z.record(z.string()).optional(),
  staticPayload: z.record(z.unknown()).optional(),
})

export const FormFieldSchema: z.ZodType<any> = z.lazy(() =>
  z.object({
    id: z.string(),
    type: FieldTypeSchema,
    name: z.string(),
    label: z.string(),
    placeholder: z.string().optional(),
    description: z.string().optional(),
    helpText: z.string().optional(),
    defaultValue: z.unknown().optional(),
    required: z.boolean().optional().default(false),
    disabled: z.boolean().optional().default(false),
    readOnly: z.boolean().optional().default(false),
    prefix: z.string().optional(),
    suffix: z.string().optional(),
    labelPosition: z.enum(['top', 'left', 'right', 'hidden']).optional().default('top'),
    options: z.array(SelectOptionSchema).optional(),
    validationRules: z.array(ValidationRuleSchema).optional(),
    conditions: z.array(ConditionGroupSchema).optional(),
    matrixConfig: MatrixFieldConfigSchema.optional(),
    logoConfig: LogoConfigSchema.optional(),
    imageConfig: ImageConfigSchema.optional(),
    avatarConfig: AvatarConfigSchema.optional(),
    repeatRowConfig: z
      .object({
        minRows: z.number().optional(),
        maxRows: z.number().optional(),
        addButtonText: z.string().optional(),
        removeButtonText: z.string().optional(),
        fieldTemplate: z.array(FormFieldSchema).default([]),
      })
      .optional(),
    customAttributes: z.record(z.unknown()).optional(),
  })
)

export const FormColumnSchema = z.object({
  id: z.string(),
  width: z.number().min(1).max(12).default(12),
  fieldIds: z.array(z.string()).default([]),
  className: z.string().optional(),
})

export const FormRowSchema = z.object({
  id: z.string(),
  columnIds: z.array(z.string()).default([]),
  className: z.string().optional(),
  conditions: z.array(ConditionGroupSchema).optional(),
})

export const FormPageSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  rowIds: z.array(z.string()).default([]),
  conditions: z.array(ConditionGroupSchema).optional(),
})

export const FormSettingsSchema = z.object({
  submitButtonText: z.string().default('Submit'),
  showResetButton: z.boolean().default(false),
  resetButtonText: z.string().default('Reset'),
  layout: z.enum(['standard', 'compact', 'comfortable']).default('standard'),
  labelPosition: z.enum(['top', 'left']).default('top'),
  theme: z.enum(['light', 'dark', 'system']).default('system'),
  showProgressBar: z.boolean().default(true),
  allowPageNavigation: z.boolean().default(true),
  formMode: z.enum(['single-page', 'wizard', 'conversational']).default('wizard'),
  themePreset: z.enum(['monochrome-zinc', 'slate', 'neutral', 'minimal-outline', 'flat-borderless']).default('monochrome-zinc'),
  webhook: WebhookConfigSchema.optional(),
})

export const FormBuilderSchemaZod = z.object({
  id: z.string(),
  version: z.string().default('1.0.0'),
  title: z.string(),
  description: z.string().optional(),
  settings: FormSettingsSchema.default({}),
  pages: z.record(FormPageSchema).default({}),
  rows: z.record(FormRowSchema).default({}),
  columns: z.record(FormColumnSchema).default({}),
  fields: z.record(FormFieldSchema).default({}),
  pageOrder: z.array(z.string()).default([]),
})
