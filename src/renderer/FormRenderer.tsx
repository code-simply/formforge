import React, { useState } from 'react'
import { FormProvider } from 'react-hook-form'
import { FormBuilderSchema } from '../core/types'
import { CustomFieldComponentProps } from '../core/customFields'
import { sendWebhookPayload, WebhookSendResult } from '../core/webhook'
import { useFormEngine } from './useFormEngine'
import { FormPageRenderer } from './FormPage'
import { Button } from '../ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { ChevronLeft, ChevronRight, Check, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import { cn } from '../ui/utils'

export interface FormRendererProps {
  schema: FormBuilderSchema
  defaultValues?: Record<string, unknown>
  onSubmit?: (data: Record<string, unknown>) => void
  onWebhookResponse?: (result: WebhookSendResult) => void
  className?: string
  cardWrapper?: boolean
  customFields?: Record<string, React.ComponentType<CustomFieldComponentProps>>
}

export const FormRenderer: React.FC<FormRendererProps> = ({
  schema,
  defaultValues,
  onSubmit,
  onWebhookResponse,
  className,
  cardWrapper = true,
  customFields,
}) => {
  const [webhookStatus, setWebhookStatus] = useState<WebhookSendResult | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleFormSubmit = async (data: Record<string, unknown>) => {
    setIsSubmitting(true)

    // Optional webhook delivery
    if (schema.settings?.webhook?.enabled && schema.settings?.webhook?.url) {
      try {
        const result = await sendWebhookPayload(schema.settings.webhook, data)
        setWebhookStatus(result)
        if (onWebhookResponse) {
          onWebhookResponse(result)
        }
      } catch (err: any) {
        setWebhookStatus({
          success: false,
          status: 0,
          message: err?.message || 'Failed to dispatch webhook',
        })
      }
    }

    if (onSubmit) {
      onSubmit(data)
    }

    setIsSubmitting(false)
  }

  const engine = useFormEngine({
    schema,
    defaultValues,
    onSubmit: handleFormSubmit,
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

  const formMode = schema.settings?.formMode || (visiblePages.length > 1 ? 'wizard' : 'single-page')
  const isMultiPage = visiblePages.length > 1 && formMode !== 'single-page'
  const submitText = schema.settings?.submitButtonText || 'Submit'
  const showReset = schema.settings?.showResetButton || false
  const resetText = schema.settings?.resetButtonText || 'Reset'

  const content = (
    <FormProvider {...form}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Wizard / Step Progress Header */}
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
              <div className="flex space-x-1 pt-2 overflow-x-auto no-scrollbar">
                {visiblePages.map((page, idx) => (
                  <button
                    key={page.id}
                    type="button"
                    onClick={() => goToPage(idx)}
                    className={cn(
                      'px-2.5 py-1 text-xs rounded-md font-medium transition-colors shrink-0',
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

        {/* Form Page Content */}
        {formMode === 'single-page' ? (
          // Single-Page Continuous Mode (Renders all pages/sections)
          <div className="space-y-8">
            {visiblePages.map((page) => (
              <FormPageRenderer
                key={page.id}
                page={page}
                schema={schema}
                visibleFieldsMap={visibleFieldsMap}
                fieldStateMap={fieldStateMap}
                isRowVisible={isRowVisible}
                errors={errors}
                customFields={customFields}
              />
            ))}
          </div>
        ) : (
          // Wizard / Conversational Mode (Renders active page)
          currentPage && (
            <FormPageRenderer
              page={currentPage}
              schema={schema}
              visibleFieldsMap={visibleFieldsMap}
              fieldStateMap={fieldStateMap}
              isRowVisible={isRowVisible}
              errors={errors}
              customFields={customFields}
            />
          )
        )}

        {/* Webhook Feedback Banner */}
        {webhookStatus && (
          <div
            className={cn(
              'p-3 rounded-lg border text-xs flex items-center space-x-2',
              webhookStatus.success
                ? 'bg-muted/50 border-foreground/20 text-foreground'
                : 'bg-destructive/10 border-destructive/30 text-destructive'
            )}
          >
            {webhookStatus.success ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-foreground" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0 text-destructive" />
            )}
            <span className="flex-1 font-medium">{webhookStatus.message}</span>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div>
            {showReset && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  form.reset()
                  setWebhookStatus(null)
                }}
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
              <Button type="submit" size="sm" disabled={isSubmitting}>
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                ) : (
                  <Check className="h-4 w-4 mr-1" />
                )}
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
      <Card
        className={cn(
          'w-full shadow-sm',
          formMode === 'conversational' && 'max-w-xl mx-auto shadow-md border-border/90',
          className
        )}
      >
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
