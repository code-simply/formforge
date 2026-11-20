# Custom Fields Extension API

`shadcn-form-builder` provides a pluggable Custom Fields API that allows you to register and render any custom React component.

---

## 1. Defining a Custom Field Component

A custom field component receives standard `CustomFieldComponentProps`:

```tsx
import React from 'react'
import { CustomFieldComponentProps } from 'shadcn-form-builder/core'

export const StarRatingField: React.FC<CustomFieldComponentProps> = ({
  field,
  value,
  onChange,
  disabled,
  error,
}) => {
  const rating = Number(value) || 0

  return (
    <div className="space-y-1">
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={disabled}
            onClick={() => onChange(star)}
            className={`text-2xl transition-colors ${
              star <= rating ? 'text-amber-500' : 'text-muted-foreground/30'
            }`}
          >
            ★
          </button>
        ))}
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}
```

---

## 2. Registering Globally in the Builder & Renderer

Register the custom field so it appears in the editor palette and automatically renders in any `<FormRenderer />`:

```tsx
import { registerCustomField } from 'shadcn-form-builder/core'
import { StarRatingField } from './StarRatingField'
import { Star } from 'lucide-react'

registerCustomField({
  type: 'star-rating',
  label: 'Star Rating',
  description: 'Interactive 5-star rating widget',
  icon: Star,
  category: 'choice',
  component: StarRatingField,
  defaultConfig: {
    defaultValue: 5,
  },
})
```

---

## 3. Passing Custom Fields via Props to `<FormRenderer />`

You can also pass components scoped to a single `<FormRenderer />`:

```tsx
import { FormRenderer } from 'shadcn-form-builder/renderer'
import { StarRatingField } from './StarRatingField'

export function MyPage({ schema }) {
  return (
    <FormRenderer
      schema={schema}
      customFields={{
        'star-rating': StarRatingField,
      }}
      onSubmit={(data) => console.log(data)}
    />
  )
}
```
