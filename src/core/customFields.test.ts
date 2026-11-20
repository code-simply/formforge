import { describe, it, expect } from 'vitest'
import React from 'react'
import {
  registerCustomField,
  getCustomField,
  getAllCustomFields,
  unregisterCustomField,
  CustomFieldDefinition,
} from './customFields'

describe('Custom Fields Registry API', () => {
  it('registers and retrieves a custom field component', () => {
    const StarRatingComponent: React.FC<any> = ({ value }) => {
      return React.createElement('div', { 'data-testid': 'star-rating' }, `Stars: ${value}`)
    }

    const starDef: CustomFieldDefinition = {
      type: 'star-rating',
      label: 'Star Rating',
      description: 'Interactive 5-star rating widget',
      component: StarRatingComponent,
      defaultConfig: {
        defaultValue: 5,
      },
    }

    registerCustomField(starDef)

    const retrieved = getCustomField('star-rating')
    expect(retrieved).toBeDefined()
    expect(retrieved?.label).toBe('Star Rating')
    expect(getAllCustomFields().some((f) => f.type === 'star-rating')).toBe(true)

    unregisterCustomField('star-rating')
    expect(getCustomField('star-rating')).toBeUndefined()
  })
})
