import { useState, useMemo, useCallback } from 'react'
import { useForm, UseFormReturn } from 'react-hook-form'
import {
  FormBuilderSchema,
  FormPage,
  FormRow,
} from '../core/types'
import {
  evaluateFieldConditions,
  evaluateRowConditions,
  evaluatePageConditions,
} from '../core/conditions'

export interface UseFormEngineOptions {
  schema: FormBuilderSchema
  defaultValues?: Record<string, unknown>
  onSubmit?: (data: Record<string, unknown>) => void
}

export interface FormEngineReturn {
  form: UseFormReturn<Record<string, unknown>>
  currentPageIndex: number
  currentPage: FormPage | undefined
  isFirstPage: boolean
  isLastPage: boolean
  progressPercentage: number
  visiblePages: FormPage[]
  visibleFieldsMap: Record<string, boolean>
  fieldStateMap: Record<
    string,
    { visible: boolean; disabled: boolean; required: boolean }
  >
  isRowVisible: (row: FormRow) => boolean
  isFieldVisible: (fieldId: string) => boolean
  goToNextPage: () => Promise<boolean>
  goToPrevPage: () => void
  goToPage: (index: number) => void
  handleSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>
}

export function useFormEngine({
  schema,
  defaultValues = {},
  onSubmit,
}: UseFormEngineOptions): FormEngineReturn {
  const [currentPageIndex, setCurrentPageIndex] = useState(0)

  // Extract initial default values from schema fields
  const initialValues = useMemo(() => {
    const values: Record<string, unknown> = { ...defaultValues }
    for (const field of Object.values(schema.fields)) {
      const key = field.name || field.id
      if (values[key] === undefined && field.defaultValue !== undefined) {
        values[key] = field.defaultValue
      }
    }
    return values
  }, [schema.fields, defaultValues])

  const form = useForm<Record<string, unknown>>({
    defaultValues: initialValues,
    mode: 'onTouched',
  })

  const formValues = form.watch()

  // Evaluate dynamic field conditions
  const fieldStateMap = useMemo(() => {
    const map: Record<
      string,
      { visible: boolean; disabled: boolean; required: boolean }
    > = {}
    for (const field of Object.values(schema.fields)) {
      map[field.id] = evaluateFieldConditions(field, formValues, schema.fields)
    }
    return map
  }, [schema.fields, formValues])

  const visibleFieldsMap = useMemo(() => {
    const map: Record<string, boolean> = {}
    for (const [id, state] of Object.entries(fieldStateMap)) {
      map[id] = state.visible
    }
    return map
  }, [fieldStateMap])

  const isFieldVisible = useCallback(
    (fieldId: string) => {
      return fieldStateMap[fieldId]?.visible ?? true
    },
    [fieldStateMap]
  )

  const isRowVisible = useCallback(
    (row: FormRow) => {
      if (!evaluateRowConditions(row, formValues, schema.fields)) {
        return false
      }
      // Check if at least one field in row's columns is visible
      let hasVisibleChild = false
      for (const colId of row.columnIds) {
        const col = schema.columns[colId]
        if (col) {
          for (const fId of col.fieldIds) {
            if (isFieldVisible(fId)) {
              hasVisibleChild = true
              break
            }
          }
        }
        if (hasVisibleChild) break
      }
      return hasVisibleChild || row.columnIds.length === 0
    },
    [formValues, schema.fields, schema.columns, isFieldVisible]
  )

  // Visible pages list
  const visiblePages = useMemo(() => {
    return schema.pageOrder
      .map((pId) => schema.pages[pId])
      .filter(
        (page): page is FormPage =>
          !!page && evaluatePageConditions(page, formValues, schema.fields)
      )
  }, [schema.pageOrder, schema.pages, formValues, schema.fields])

  const currentPage = visiblePages[currentPageIndex] || visiblePages[0]
  const isFirstPage = currentPageIndex === 0
  const isLastPage = currentPageIndex >= visiblePages.length - 1
  const progressPercentage =
    visiblePages.length > 0
      ? Math.round(((currentPageIndex + 1) / visiblePages.length) * 100)
      : 100

  // Validate only visible fields on the current page when moving next
  const validateCurrentPage = useCallback(async (): Promise<boolean> => {
    if (!currentPage) return true

    const pageFieldsToValidate: string[] = []
    const visibleSet = new Set<string>()

    for (const rowId of currentPage.rowIds) {
      const row = schema.rows[rowId]
      if (!row || !isRowVisible(row)) continue

      for (const colId of row.columnIds) {
        const col = schema.columns[colId]
        if (!col) continue

        for (const fId of col.fieldIds) {
          if (isFieldVisible(fId)) {
            const field = schema.fields[fId]
            if (field) {
              pageFieldsToValidate.push(field.name || field.id)
              visibleSet.add(field.id)
            }
          }
        }
      }
    }

    if (pageFieldsToValidate.length === 0) return true

    // Trigger validation for current page fields
    const isValid = await form.trigger(pageFieldsToValidate as any)
    return isValid
  }, [currentPage, schema.rows, schema.columns, schema.fields, isRowVisible, isFieldVisible, form])

  const goToNextPage = useCallback(async () => {
    const isValid = await validateCurrentPage()
    if (!isValid) return false

    if (!isLastPage) {
      setCurrentPageIndex((prev) => Math.min(prev + 1, visiblePages.length - 1))
      return true
    }
    return false
  }, [validateCurrentPage, isLastPage, visiblePages.length])

  const goToPrevPage = useCallback(() => {
    setCurrentPageIndex((prev) => Math.max(prev - 1, 0))
  }, [])

  const goToPage = useCallback(
    (index: number) => {
      if (index >= 0 && index < visiblePages.length) {
        setCurrentPageIndex(index)
      }
    },
    [visiblePages.length]
  )

  const handleSubmit = form.handleSubmit((data) => {
    if (onSubmit) {
      // Clean up values for hidden fields
      const cleanData: Record<string, unknown> = {}
      for (const field of Object.values(schema.fields)) {
        const key = field.name || field.id
        if (isFieldVisible(field.id)) {
          cleanData[key] = data[key]
        }
      }
      onSubmit(cleanData)
    }
  })

  return {
    form,
    currentPageIndex,
    currentPage,
    isFirstPage,
    isLastPage,
    progressPercentage,
    visiblePages,
    visibleFieldsMap,
    fieldStateMap,
    isRowVisible,
    isFieldVisible,
    goToNextPage,
    goToPrevPage,
    goToPage,
    handleSubmit,
  }
}
