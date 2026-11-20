import React from 'react'
import { FormField } from './types'

export interface CustomFieldComponentProps {
  field: FormField
  value: unknown
  onChange: (value: unknown) => void
  disabled?: boolean
  required?: boolean
  error?: string
}

export interface CustomFieldDefinition {
  type: string
  label: string
  description?: string
  icon?: any
  category?: 'input' | 'choice' | 'advanced' | 'layout'
  component: React.ComponentType<CustomFieldComponentProps>
  defaultConfig?: Partial<FormField>
}

// Global registry for custom fields
const customFieldRegistry = new Map<string, CustomFieldDefinition>()

export function registerCustomField(definition: CustomFieldDefinition): void {
  customFieldRegistry.set(definition.type, definition)
}

export function getCustomField(type: string): CustomFieldDefinition | undefined {
  return customFieldRegistry.get(type)
}

export function getAllCustomFields(): CustomFieldDefinition[] {
  return Array.from(customFieldRegistry.values())
}

export function unregisterCustomField(type: string): void {
  customFieldRegistry.delete(type)
}
