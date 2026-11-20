import React from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { FormField } from '../core/types'
import { getCustomField, CustomFieldComponentProps } from '../core/customFields'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { Label } from '../ui/label'
import { Switch } from '../ui/switch'
import { Checkbox } from '../ui/checkbox'
import { RadioGroup, RadioGroupItem } from '../ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'
import { Slider } from '../ui/slider'
import { Button } from '../ui/button'
import { Separator } from '../ui/separator'
import { Badge } from '../ui/badge'
import { Plus, Trash2, X } from 'lucide-react'
import { cn } from '../ui/utils'

export interface FormFieldProps {
  field: FormField
  disabled?: boolean
  required?: boolean
  error?: string
  customFields?: Record<string, React.ComponentType<CustomFieldComponentProps>>
}

export const FormFieldRenderer: React.FC<FormFieldProps> = ({
  field,
  disabled = false,
  required = false,
  error,
  customFields = {},
}) => {
  const { control } = useFormContext()
  const fieldKey = field.name || field.id

  const isStatic = ['heading', 'paragraph', 'separator', 'button', 'logo', 'image', 'avatar'].includes(field.type)

  // Check for custom field component (passed via prop or globally registered)
  const CustomComponent = customFields[field.type] || getCustomField(field.type)?.component

  const renderControl = () => {
    if (CustomComponent) {
      return (
        <Controller
          name={fieldKey}
          control={control}
          render={({ field: formField }) => (
            <CustomComponent
              field={field}
              value={formField.value}
              onChange={formField.onChange}
              disabled={disabled}
              required={required}
              error={error}
            />
          )}
        />
      )
    }

    switch (field.type) {
      case 'text':
      case 'email':
      case 'password':
      case 'phone':
      case 'url':
        return (
          <Controller
            name={fieldKey}
            control={control}
            render={({ field: formField }) => (
              <Input
                {...formField}
                type={
                  field.type === 'email'
                    ? 'email'
                    : field.type === 'password'
                    ? 'password'
                    : field.type === 'phone'
                    ? 'tel'
                    : field.type === 'url'
                    ? 'url'
                    : 'text'
                }
                value={String(formField.value ?? '')}
                placeholder={field.placeholder}
                disabled={disabled}
                className={cn(error && 'border-destructive focus-visible:ring-destructive')}
              />
            )}
          />
        )

      case 'number':
        return (
          <Controller
            name={fieldKey}
            control={control}
            render={({ field: formField }) => (
              <Input
                {...formField}
                type="number"
                value={formField.value ?? ''}
                onChange={(e) =>
                  formField.onChange(
                    e.target.value === '' ? '' : Number(e.target.value)
                  )
                }
                placeholder={field.placeholder}
                disabled={disabled}
                className={cn(error && 'border-destructive focus-visible:ring-destructive')}
              />
            )}
          />
        )

      case 'textarea':
        return (
          <Controller
            name={fieldKey}
            control={control}
            render={({ field: formField }) => (
              <Textarea
                {...formField}
                value={String(formField.value ?? '')}
                placeholder={field.placeholder}
                disabled={disabled}
                rows={4}
                className={cn(error && 'border-destructive focus-visible:ring-destructive')}
              />
            )}
          />
        )

      case 'select':
        return (
          <Controller
            name={fieldKey}
            control={control}
            render={({ field: formField }) => (
              <Select
                value={String(formField.value ?? '')}
                onValueChange={formField.onChange}
                disabled={disabled}
              >
                <SelectTrigger className={cn(error && 'border-destructive')}>
                  <SelectValue placeholder={field.placeholder || 'Select an option'} />
                </SelectTrigger>
                <SelectContent>
                  {(field.options || []).map((opt) => (
                    <SelectItem
                      key={opt.value}
                      value={opt.value}
                      disabled={opt.disabled}
                    >
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        )

      case 'multi-select':
        return (
          <Controller
            name={fieldKey}
            control={control}
            render={({ field: formField }) => {
              const selectedValues = Array.isArray(formField.value)
                ? (formField.value as string[])
                : []

              const toggleOption = (val: string) => {
                if (selectedValues.includes(val)) {
                  formField.onChange(selectedValues.filter((v) => v !== val))
                } else {
                  formField.onChange([...selectedValues, val])
                }
              }

              return (
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-1.5 p-2 rounded-md border bg-background min-h-[38px]">
                    {selectedValues.length === 0 ? (
                      <span className="text-xs text-muted-foreground self-center">
                        Select one or more choices below
                      </span>
                    ) : (
                      selectedValues.map((val) => {
                        const opt = (field.options || []).find((o) => o.value === val)
                        return (
                          <Badge
                            key={val}
                            variant="secondary"
                            className="text-xs py-0.5 pl-2 pr-1 flex items-center space-x-1"
                          >
                            <span>{opt?.label || val}</span>
                            <button
                              type="button"
                              onClick={() => toggleOption(val)}
                              className="hover:text-destructive p-0.5"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        )
                      })
                    )}
                  </div>

                  <div className="flex flex-wrap gap-1 pt-1">
                    {(field.options || []).map((opt) => {
                      const isChecked = selectedValues.includes(opt.value)
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => toggleOption(opt.value)}
                          disabled={disabled || opt.disabled}
                          className={cn(
                            'text-xs px-2.5 py-1 rounded-full border transition-colors',
                            isChecked
                              ? 'bg-primary text-primary-foreground border-primary font-medium'
                              : 'bg-muted/50 hover:bg-muted text-muted-foreground'
                          )}
                        >
                          {opt.label}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )
            }}
          />
        )

      case 'checkbox':
        return (
          <Controller
            name={fieldKey}
            control={control}
            render={({ field: formField }) => (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={field.id}
                  checked={!!formField.value}
                  onCheckedChange={formField.onChange}
                  disabled={disabled}
                />
                <label
                  htmlFor={field.id}
                  className="text-sm font-medium leading-none cursor-pointer"
                >
                  {field.label}
                </label>
              </div>
            )}
          />
        )

      case 'checkbox-group':
        return (
          <Controller
            name={fieldKey}
            control={control}
            render={({ field: formField }) => {
              const selectedValues = Array.isArray(formField.value)
                ? (formField.value as string[])
                : []

              const toggleValue = (val: string) => {
                if (selectedValues.includes(val)) {
                  formField.onChange(selectedValues.filter((v) => v !== val))
                } else {
                  formField.onChange([...selectedValues, val])
                }
              }

              return (
                <div className="space-y-2">
                  {(field.options || []).map((opt) => (
                    <div key={opt.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`${field.id}_${opt.value}`}
                        checked={selectedValues.includes(opt.value)}
                        onCheckedChange={() => toggleValue(opt.value)}
                        disabled={disabled || opt.disabled}
                      />
                      <label
                        htmlFor={`${field.id}_${opt.value}`}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {opt.label}
                      </label>
                    </div>
                  ))}
                </div>
              )
            }}
          />
        )

      case 'switch':
        return (
          <Controller
            name={fieldKey}
            control={control}
            render={({ field: formField }) => (
              <div className="flex items-center space-x-2">
                <Switch
                  id={field.id}
                  checked={!!formField.value}
                  onCheckedChange={formField.onChange}
                  disabled={disabled}
                />
                <label
                  htmlFor={field.id}
                  className="text-sm font-medium leading-none cursor-pointer"
                >
                  {field.label}
                </label>
              </div>
            )}
          />
        )

      case 'radio-group':
        return (
          <Controller
            name={fieldKey}
            control={control}
            render={({ field: formField }) => (
              <RadioGroup
                value={String(formField.value ?? '')}
                onValueChange={formField.onChange}
                disabled={disabled}
                className="space-y-1.5"
              >
                {(field.options || []).map((opt) => (
                  <div key={opt.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={opt.value} id={`${field.id}_${opt.value}`} />
                    <Label
                      htmlFor={`${field.id}_${opt.value}`}
                      className="cursor-pointer font-normal"
                    >
                      {opt.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            )}
          />
        )

      case 'slider':
        return (
          <Controller
            name={fieldKey}
            control={control}
            render={({ field: formField }) => {
              const val = typeof formField.value === 'number' ? formField.value : 50
              return (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>0</span>
                    <span className="font-semibold text-foreground">{val}</span>
                    <span>100</span>
                  </div>
                  <Slider
                    value={[val]}
                    min={0}
                    max={100}
                    step={1}
                    onValueChange={(vals) => formField.onChange(vals[0])}
                    disabled={disabled}
                  />
                </div>
              )
            }}
          />
        )

      case 'date':
        return (
          <Controller
            name={fieldKey}
            control={control}
            render={({ field: formField }) => (
              <Input
                {...formField}
                type="date"
                value={String(formField.value ?? '')}
                disabled={disabled}
                className={cn(error && 'border-destructive focus-visible:ring-destructive')}
              />
            )}
          />
        )

      case 'time':
        return (
          <Controller
            name={fieldKey}
            control={control}
            render={({ field: formField }) => (
              <Input
                {...formField}
                type="time"
                value={String(formField.value ?? '')}
                disabled={disabled}
                className={cn(error && 'border-destructive focus-visible:ring-destructive')}
              />
            )}
          />
        )

      case 'table-matrix': {
        const matrix = field.matrixConfig
        if (!matrix) return null
        return (
          <Controller
            name={fieldKey}
            control={control}
            render={({ field: formField }) => {
              const matrixValues = (formField.value || {}) as Record<string, string>
              return (
                <div className="overflow-x-auto border rounded-md">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-muted text-muted-foreground text-xs uppercase">
                      <tr>
                        <th className="px-4 py-2"></th>
                        {matrix.columns.map((col) => (
                          <th key={col.id} className="px-4 py-2 text-center">
                            {col.label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {matrix.rows.map((row) => (
                        <tr key={row.id} className="hover:bg-muted/50">
                          <td className="px-4 py-3 font-medium">{row.label}</td>
                          {matrix.columns.map((col) => (
                            <td key={col.id} className="px-4 py-3 text-center">
                              <input
                                type="radio"
                                name={`${fieldKey}_${row.value}`}
                                value={col.value}
                                checked={matrixValues[row.value] === col.value}
                                onChange={() =>
                                  formField.onChange({
                                    ...matrixValues,
                                    [row.value]: col.value,
                                  })
                                }
                                disabled={disabled}
                                className="h-4 w-4 text-primary"
                              />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            }}
          />
        )
      }

      case 'repeat-row': {
        const repeat = field.repeatRowConfig
        const template = repeat?.fieldTemplate || []

        return (
          <Controller
            name={fieldKey}
            control={control}
            render={({ field: formField }) => {
              const items = Array.isArray(formField.value)
                ? (formField.value as Array<Record<string, unknown>>)
                : [{}]

              const handleAddItem = () => {
                if (repeat?.maxRows && items.length >= repeat.maxRows) return
                formField.onChange([...items, {}])
              }

              const handleRemoveItem = (index: number) => {
                if (repeat?.minRows && items.length <= repeat.minRows) return
                formField.onChange(items.filter((_, i) => i !== index))
              }

              const handleItemFieldChange = (index: number, subKey: string, val: unknown) => {
                const updated = [...items]
                updated[index] = { ...updated[index], [subKey]: val }
                formField.onChange(updated)
              }

              return (
                <div className="space-y-3 border rounded-lg p-3 bg-muted/10">
                  <div className="space-y-2">
                    {items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-start space-x-2 p-2.5 rounded-md border bg-background"
                      >
                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {template.map((subField) => (
                            <div key={subField.id} className="space-y-1">
                              <label className="text-[11px] font-medium text-muted-foreground">
                                {subField.label}
                              </label>
                              <Input
                                value={String(item[subField.name || subField.id] ?? '')}
                                onChange={(e) =>
                                  handleItemFieldChange(
                                    idx,
                                    subField.name || subField.id,
                                    e.target.value
                                  )
                                }
                                placeholder={subField.placeholder}
                                className="h-8 text-xs"
                              />
                            </div>
                          ))}
                        </div>

                        {items.length > (repeat?.minRows || 1) && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveItem(idx)}
                            className="h-8 w-8 text-destructive hover:bg-destructive/10 shrink-0"
                            title="Remove item"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddItem}
                    disabled={repeat?.maxRows ? items.length >= repeat.maxRows : false}
                    className="h-8 text-xs"
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" />
                    {repeat?.addButtonText || 'Add Item'}
                  </Button>
                </div>
              )
            }}
          />
        )
      }

      case 'heading': {
        return (
          <h3 className="text-lg font-semibold tracking-tight text-foreground">
            {field.defaultValue ? String(field.defaultValue) : field.label}
          </h3>
        )
      }

      case 'paragraph': {
        return (
          <p className="text-sm text-muted-foreground">
            {field.defaultValue ? String(field.defaultValue) : field.description || field.label}
          </p>
        )
      }

      case 'separator': {
        return <Separator className="my-2" />
      }

      case 'button': {
        return (
          <Button
            type="button"
            variant="secondary"
            disabled={disabled}
            onClick={() => {}}
          >
            {field.defaultValue ? String(field.defaultValue) : field.label}
          </Button>
        )
      }

      case 'logo': {
        const logo = field.logoConfig
        const alignClass =
          logo?.align === 'center'
            ? 'justify-center'
            : logo?.align === 'right'
            ? 'justify-end'
            : 'justify-start'

        const img = (
          <img
            src={logo?.url || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80'}
            alt={logo?.alt || field.label}
            style={{ maxWidth: logo?.width ? `${logo.width}px` : '150px' }}
            className="h-auto max-h-16 object-contain"
          />
        )

        return (
          <div className={cn('flex items-center w-full py-1', alignClass)}>
            {logo?.linkUrl ? (
              <a href={logo.linkUrl} target="_blank" rel="noopener noreferrer" className="hover:opacity-85 transition-opacity">
                {img}
              </a>
            ) : (
              img
            )}
          </div>
        )
      }

      case 'image': {
        const image = field.imageConfig
        const roundedClass =
          image?.rounded === 'none'
            ? 'rounded-none'
            : image?.rounded === 'sm'
            ? 'rounded-sm'
            : image?.rounded === 'lg'
            ? 'rounded-xl'
            : image?.rounded === 'full'
            ? 'rounded-full'
            : 'rounded-lg'

        const aspectClass =
          image?.aspectRatio === '16/9'
            ? 'aspect-video'
            : image?.aspectRatio === '4/3'
            ? 'aspect-[4/3]'
            : image?.aspectRatio === '1/1'
            ? 'aspect-square'
            : 'h-auto max-h-80'

        return (
          <figure className="w-full space-y-1.5 py-1">
            <img
              src={image?.url || 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&auto=format&fit=crop&q=80'}
              alt={image?.alt || field.label}
              className={cn('w-full object-cover border border-border/80 shadow-sm', roundedClass, aspectClass)}
            />
            {image?.caption && (
              <figcaption className="text-[11px] text-muted-foreground text-center font-normal">
                {image.caption}
              </figcaption>
            )}
          </figure>
        )
      }

      case 'avatar': {
        const avatar = field.avatarConfig
        const sizeClass =
          avatar?.size === 'sm'
            ? 'h-8 w-8 text-xs'
            : avatar?.size === 'lg'
            ? 'h-16 w-16 text-base'
            : avatar?.size === 'xl'
            ? 'h-20 w-20 text-lg'
            : 'h-12 w-12 text-sm'

        const shapeClass = avatar?.shape === 'rounded' ? 'rounded-xl' : 'rounded-full'

        return (
          <div className="flex items-center space-x-3 py-1">
            <div className="relative shrink-0">
              <img
                src={avatar?.url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                alt={field.label}
                className={cn('object-cover border border-border/80 shadow-sm bg-muted', sizeClass, shapeClass)}
              />
              {avatar?.status && avatar.status !== 'none' && (
                <span
                  className={cn(
                    'absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full ring-2 ring-background',
                    avatar.status === 'online'
                      ? 'bg-foreground'
                      : avatar.status === 'busy'
                      ? 'bg-foreground/50'
                      : 'bg-muted-foreground/30'
                  )}
                />
              )}
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground leading-tight">{field.label}</p>
              {avatar?.subtitle && (
                <p className="text-xs text-muted-foreground mt-0.5">{avatar.subtitle}</p>
              )}
            </div>
          </div>
        )
      }

      default:
        return (
          <Controller
            name={fieldKey}
            control={control}
            render={({ field: formField }) => (
              <Input
                {...formField}
                value={String(formField.value ?? '')}
                placeholder={field.placeholder}
                disabled={disabled}
              />
            )}
          />
        )
    }
  }

  // Checkbox & switch have their own inline label layout
  if (field.type === 'checkbox' || field.type === 'switch') {
    return (
      <div className="space-y-1.5 py-1">
        {renderControl()}
        {field.description && (
          <p className="text-xs text-muted-foreground pl-6">{field.description}</p>
        )}
        {error && <p className="text-xs font-medium text-destructive pl-6">{error}</p>}
      </div>
    )
  }

  if (isStatic) {
    return <div className="py-1">{renderControl()}</div>
  }

  return (
    <div className="space-y-1.5 py-1">
      {field.labelPosition !== 'hidden' && (
        <div className="flex items-center justify-between">
          <Label className={cn('text-sm font-medium', error && 'text-destructive')}>
            {field.label}
            {required && <span className="text-destructive ml-1">*</span>}
          </Label>
          {field.helpText && (
            <span className="text-xs text-muted-foreground">{field.helpText}</span>
          )}
        </div>
      )}

      {renderControl()}

      {field.description && (
        <p className="text-xs text-muted-foreground">{field.description}</p>
      )}

      {error && (
        <p className="text-xs font-medium text-destructive">{error}</p>
      )}
    </div>
  )
}
