import React from 'react'
import { FormBuilderSchema, FormPage } from '../core/types'
import { FormRowRenderer } from './FormRow'

export interface FormPageProps {
  page: FormPage
  schema: FormBuilderSchema
  visibleFieldsMap: Record<string, boolean>
  fieldStateMap: Record<string, { visible: boolean; disabled: boolean; required: boolean }>
  isRowVisible: (row: any) => boolean
  errors: Record<string, any>
}

export const FormPageRenderer: React.FC<FormPageProps> = ({
  page,
  schema,
  visibleFieldsMap,
  fieldStateMap,
  isRowVisible,
  errors,
}) => {
  return (
    <div className="space-y-4">
      {page.title && (
        <div className="border-b pb-3 mb-4">
          <h2 className="text-xl font-bold tracking-tight text-foreground">{page.title}</h2>
          {page.description && (
            <p className="text-sm text-muted-foreground mt-1">{page.description}</p>
          )}
        </div>
      )}

      <div className="space-y-2">
        {page.rowIds.map((rowId) => {
          const row = schema.rows[rowId]
          if (!row || !isRowVisible(row)) return null

          return (
            <FormRowRenderer
              key={rowId}
              row={row}
              columns={schema.columns}
              fields={schema.fields}
              visibleFieldsMap={visibleFieldsMap}
              fieldStateMap={fieldStateMap}
              errors={errors}
            />
          )
        })}
      </div>
    </div>
  )
}
