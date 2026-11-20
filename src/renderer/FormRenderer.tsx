import React from 'react'
import { FormProvider } from 'react-hook-form'
import { FormBuilderSchema } from '../core/types'
import { useFormEngine } from './useFormEngine'
import { FormPageRenderer } from './FormPage'
import { Button } from '../ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { ChevronLeft, ChevronRight, Check } from 'lucide-react'
import { cn } from '../ui/utils'

export interface FormRendererProps {
  schema: FormBuilderSchema
  defaultValues?: Record<string, unknown>
  onSubmit?: (data: Record<string, unknown>) => void
  className?: string
  cardWrapper?: boolean
}

export const FormRenderer: React.FC<FormRendererProps> = ({
  schema,
  defaultValues,
  onSubmit,
  className,
  cardWrapper = true,
}) => {
  const engine = useFormEngine({
    schema,
    defaultValues,
    onSubmit,
  })

  const {
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
    goToNextPage,
    goToPrevPage,
    goToPage,
    handleSubmit,
  } = engine

  const errors = form.formState.errors

  const isMultiPage = visiblePages.length > 1
  const submitText = schema.settings?.submitButtonText || 'Submit'
  const showReset = schema.settings?.showResetButton || false
  const resetText = schema.settings?.resetButtonText || 'Reset'

  const content = (
    <FormProvider {...form}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Progress bar for multi-page forms */}
        {isMultiPage && schema.settings?.showProgressBar && (
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-medium text-muted-foreground">
              <span>
                Step {currentPageIndex + 1} of {visiblePages.length}:{' '}
                <strong className="text-foreground">{currentPage?.title}</strong>
              </span>
              <span>{progressPercentage}%</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full bg-primary transition-all duration-300 ease-in-out"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>

            {/* Step navigation tabs */}
            {schema.settings?.allowPageNavigation && (
              <div className="flex space-x-1 pt-2 overflow-x-auto">
                {visiblePages.map((page, idx) => (
                  <button
                    key={page.id}
                    type="button"
                    onClick={() => goToPage(idx)}
                    className={cn(
                      'px-3 py-1 text-xs rounded-md font-medium transition-colors',
                      idx === currentPageIndex
                        ? 'bg-primary text-primary-foreground'
                        : idx < currentPageIndex
                        ? 'bg-muted text-foreground hover:bg-accent'
                        : 'text-muted-foreground hover:bg-muted'
                    )}
                  >
                    {idx + 1}. {page.title}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Current Active Page */}
        {currentPage && (
          <FormPageRenderer
            page={currentPage}
            schema={schema}
            visibleFieldsMap={visibleFieldsMap}
            fieldStateMap={fieldStateMap}
            isRowVisible={isRowVisible}
            errors={errors}
          />
        )}

        {/* Action Controls */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div>
            {showReset && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => form.reset()}
              >
                {resetText}
              </Button>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {isMultiPage && !isFirstPage && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={goToPrevPage}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
            )}

            {isMultiPage && !isLastPage ? (
              <Button
                type="button"
                size="sm"
                onClick={goToNextPage}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button type="submit" size="sm">
                <Check className="h-4 w-4 mr-1" />
                {submitText}
              </Button>
            )}
          </div>
        </div>
      </form>
    </FormProvider>
  )

  if (cardWrapper) {
    return (
      <Card className={cn('w-full shadow-sm', className)}>
        {(schema.title || schema.description) && (
          <CardHeader>
            {schema.title && <CardTitle>{schema.title}</CardTitle>}
            {schema.description && (
              <CardDescription>{schema.description}</CardDescription>
            )}
          </CardHeader>
        )}
        <CardContent>{content}</CardContent>
      </Card>
    )
  }

  return <div className={cn('w-full', className)}>{content}</div>
}
