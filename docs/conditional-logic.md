# Conditional Logic Guide

`shadcn-form-builder` includes a pure TypeScript condition evaluation engine that dynamically toggles fields based on user input.

---

## 1. Supported Operators

| Operator | Description | Example |
| :--- | :--- | :--- |
| `equals` | Strict equality | Field equals `"yes"` |
| `notEquals` | Inequality | Field does not equal `"none"` |
| `contains` | Substring or array member | Array includes `"admin"` |
| `notContains` | Excludes substring or array member | Array excludes `"guest"` |
| `greaterThan` | Numeric greater than | Age > 18 |
| `lessThan` | Numeric less than | Score < 50 |
| `isEmpty` | Checks if null, empty string, or empty array | Comments is empty |
| `isNotEmpty` | Checks if value is provided | Feedback is provided |

---

## 2. Supported Actions

- **`show`**: Shows the target field if the condition evaluates to true (hidden otherwise).
- **`hide`**: Hides the target field if the condition evaluates to true.
- **`enable`**: Enables input interaction.
- **`disable`**: Disables the input.
- **`require`**: Dynamically marks the field as required and includes it in Zod schema validation.

---

## 3. Example Schema Definition

```json
{
  "id": "f_feedback",
  "type": "textarea",
  "name": "dissatisfied_reason",
  "label": "Why were you unsatisfied?",
  "conditions": [
    {
      "logic": "OR",
      "action": "show",
      "rules": [
        {
          "fieldId": "f_rating",
          "operator": "equals",
          "value": "1"
        },
        {
          "fieldId": "f_rating",
          "operator": "equals",
          "value": "2"
        }
      ]
    }
  ]
}
```
