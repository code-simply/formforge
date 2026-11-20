import React from 'react'
import { FormColumn, FormField, FormRow } from '../core/types'
import { CustomFieldComponentProps } from '../core/customFields'
import { FormFieldRenderer } from './FormField'
import { cn } from '../ui/utils'

export interface FormRowProps {
  row: FormRow
  columns: Record<string, FormColumn>
  fields: Record<string, FormField>
  visibleFieldsMap: Record<string, boolean>
  fieldStateMap: Record<string, { visible: boolean; disabled: boolean; required: boolean }>
  errors: Record<string, any>
  customFields?: Record<string, React.ComponentType<CustomFieldComponentProps>>
}

export const FormRowRenderer: React.FC<FormRowProps> = ({
  row,
  columns,
  fields,
  visibleFieldsMap,
  fieldStateMap,
  errors,
  customFields,
}) => {
  const gapClass =
    row.gap === 'none'
      ? 'gap-0'
      : row.gap === 'sm'
      ? 'gap-2'
      : row.gap === 'lg'
      ? 'gap-6'
      : row.gap === 'xl'
      ? 'gap-8'
      : 'gap-4'

  const alignClass =
    row.alignItems === 'top'
      ? 'items-start'
      : row.alignItems === 'center'
      ? 'items-center'
      : row.alignItems === 'bottom'
      ? 'items-end'
      : 'items-stretch'

  const justifyClass =
    row.justifyContent === 'center'
      ? 'justify-center'
      : row.justifyContent === 'end'
      ? 'justify-end'
      : row.justifyContent === 'between'
      ? 'justify-between'
      : row.justifyContent === 'around'
      ? 'justify-around'
      : 'justify-start'

  const grid = (
    <div className={cn('grid grid-cols-12', gapClass, alignClass, justifyClass, !row.fieldset && 'py-2', row.className)}>
      {row.columnIds.map((colId) => {
        const column = columns[colId]
        if (!column) return null

        // Calculate Tailwind grid col span class
        const span = Math.min(Math.max(column.width || 12, 1), 12)
        const colSpanClass =
          span === 1
            ? 'col-span-12 sm:col-span-1'
            : span === 2
            ? 'col-span-12 sm:col-span-2'
            : span === 3
            ? 'col-span-12 sm:col-span-3'
            : span === 4
            ? 'col-span-12 sm:col-span-4'
            : span === 5
            ? 'col-span-12 sm:col-span-5'
            : span === 6
            ? 'col-span-12 sm:col-span-6'
            : span === 7
            ? 'col-span-12 sm:col-span-7'
            : span === 8
            ? 'col-span-12 sm:col-span-8'
            : span === 9
            ? 'col-span-12 sm:col-span-9'
            : span === 10
            ? 'col-span-12 sm:col-span-10'
            : span === 11
            ? 'col-span-12 sm:col-span-11'
            : 'col-span-12'

        const colSelfAlignClass =
          column.verticalAlign === 'top'
            ? 'self-start'
            : column.verticalAlign === 'center'
            ? 'self-center'
            : column.verticalAlign === 'bottom'
            ? 'self-end'
            : column.verticalAlign === 'stretch'
            ? 'self-stretch'
            : ''

        const colHorizClass =
          column.horizontalAlign === 'center'
            ? 'items-center text-center'
            : column.horizontalAlign === 'right'
            ? 'items-end text-right'
            : 'items-stretch text-left'

        const hasSubColumns = column.columnIds && column.columnIds.length > 0

        const renderFieldList = (fieldIdList: string[]) =>
          fieldIdList.map((fId) => {
            if (!visibleFieldsMap[fId]) return null
            const field = fields[fId]
            if (!field) return null

            const state = fieldStateMap[fId]
            const errorObj = errors[field.name || field.id]
            const errorMessage = errorObj?.message ? String(errorObj.message) : undefined

            return (
              <FormFieldRenderer
                key={fId}
                field={field}
                disabled={state?.disabled}
                required={state?.required}
                error={errorMessage}
                customFields={customFields}
                columns={columns}
                fields={fields}
                visibleFieldsMap={visibleFieldsMap}
                fieldStateMap={fieldStateMap}
                errors={errors}
              />
            )
          })

        const cardVariantClass =
          column.cardVariant === 'bordered'
            ? 'border rounded-lg bg-card'
            : column.cardVariant === 'card'
            ? 'border rounded-lg bg-muted/30 shadow-xs'
            : ''

        const paddingClass =
          column.padding === 'sm'
            ? 'p-2.5'
            : column.padding === 'md'
            ? 'p-3.5 sm:p-4'
            : column.padding === 'lg'
            ? 'p-5 sm:p-6'
            : ''

        return (
          <div
            key={colId}
            className={cn(
              'flex flex-col space-y-3 cq-column-wrapper',
              colSpanClass,
              colSelfAlignClass,
              colHorizClass,
              cardVariantClass,
              paddingClass,
              column.className
            )}
          >
            {hasSubColumns ? (
              <div className="grid grid-cols-12 gap-3 w-full">
                {column.columnIds!.map((subColId) => {
                  const subCol = columns[subColId]
                  if (!subCol) return null
                  const subSpan = Math.min(Math.max(subCol.width || 12, 1), 12)
                  const subSpanClass =
                    subSpan === 1 ? 'col-span-12 md:col-span-1 cq-auto-stack'
                    : subSpan === 2 ? 'col-span-12 md:col-span-2 cq-auto-stack'
                    : subSpan === 3 ? 'col-span-12 md:col-span-3 cq-auto-stack'
                    : subSpan === 4 ? 'col-span-12 md:col-span-4 cq-auto-stack'
                    : subSpan === 5 ? 'col-span-12 md:col-span-5 cq-auto-stack'
                    : subSpan === 6 ? 'col-span-12 md:col-span-6 cq-auto-stack'
                    : subSpan === 7 ? 'col-span-12 md:col-span-7 cq-auto-stack'
                    : subSpan === 8 ? 'col-span-12 md:col-span-8 cq-auto-stack'
                    : subSpan === 9 ? 'col-span-12 md:col-span-9 cq-auto-stack'
                    : subSpan === 10 ? 'col-span-12 md:col-span-10 cq-auto-stack'
                    : subSpan === 11 ? 'col-span-12 md:col-span-11 cq-auto-stack'
                    : 'col-span-12'

                  const subCardVariantClass =
                    subCol.cardVariant === 'bordered'
                      ? 'border rounded-lg bg-card'
                      : subCol.cardVariant === 'card'
                      ? 'border rounded-lg bg-muted/30 shadow-xs'
                      : ''

                  const subPaddingClass =
                    subCol.padding === 'sm'
                      ? 'p-2'
                      : subCol.padding === 'md'
                      ? 'p-3'
                      : subCol.padding === 'lg'
                      ? 'p-4'
                      : ''

                  return (
                    <div
                      key={subColId}
                      className={cn(
                        'flex flex-col space-y-3',
                        subSpanClass,
                        subCardVariantClass,
                        subPaddingClass,
                        subCol.className
                      )}
                    >
                      {renderFieldList(subCol.fieldIds)}
                    </div>
                  )
                })}
              </div>
            ) : (
              renderFieldList(column.fieldIds)
            )}
          </div>
        )
      })}
    </div>
  )

  if (row.fieldset || row.title) {
    return (
      <fieldset className={cn('border rounded-lg p-3 sm:p-4 my-2 bg-card/20 space-y-2', row.className)}>
        {row.title && (
          <legend className="text-xs font-semibold px-2 text-foreground tracking-tight">
            {row.title}
          </legend>
        )}
        {grid}
      </fieldset>
    )
  }

  return grid
}
