import { FormSubmissionRecord, FormBuilderSchema } from './types'

/**
 * Escapes a single CSV value, wrapping in quotes if it contains commas, quotes, or newlines.
 */
export function escapeCsvValue(val: unknown): string {
  if (val === null || val === undefined) return '""'
  let str: string
  if (typeof val === 'object') {
    str = JSON.stringify(val)
  } else {
    str = String(val)
  }
  // Replace internal quotes with double quotes
  str = str.replace(/"/g, '""')
  return `"${str}"`
}

/**
 * Exports submissions to CSV format.
 * If schema is provided, uses field labels for human-readable column headers.
 */
export function exportSubmissionsToCsv(
  submissions: FormSubmissionRecord[],
  schema?: FormBuilderSchema
): string {
  if (submissions.length === 0) {
    return 'Submission ID,Timestamp,Form Title,Webhook Status\r\n'
  }

  // Collect all unique keys present in values across all submissions
  const valueKeysSet = new Set<string>()
  submissions.forEach((s) => {
    Object.keys(s.values || {}).forEach((k) => valueKeysSet.add(k))
  })
  const valueKeys = Array.from(valueKeysSet)

  // Map keys to human labels if schema is available
  const keyToLabel = (key: string): string => {
    if (!schema) return key
    const field = Object.values(schema.fields).find((f) => (f.name || f.id) === key)
    return field?.label ? `${field.label} (${key})` : key
  }

  const baseHeaders = ['Submission ID', 'Timestamp', 'Form Title', 'Webhook Status']
  const fieldHeaders = valueKeys.map((k) => keyToLabel(k))
  const allHeaders = [...baseHeaders, ...fieldHeaders]

  const rows = [allHeaders.map(escapeCsvValue).join(',')]

  for (const s of submissions) {
    const webhookStr = s.webhookStatus?.attempted
      ? s.webhookStatus.success
        ? `HTTP ${s.webhookStatus.status || 200} (Delivered)`
        : `Failed (${s.webhookStatus.message || 'Error'})`
      : 'Not Enabled'

    const baseValues = [
      escapeCsvValue(s.id),
      escapeCsvValue(s.timestamp),
      escapeCsvValue(s.formTitle),
      escapeCsvValue(webhookStr),
    ]

    const fieldValues = valueKeys.map((k) => escapeCsvValue(s.values[k]))

    rows.push([...baseValues, ...fieldValues].join(','))
  }

  return rows.join('\r\n')
}

/**
 * Exports submissions array as formatted JSON string.
 */
export function exportSubmissionsToJson(submissions: FormSubmissionRecord[]): string {
  return JSON.stringify(submissions, null, 2)
}

/**
 * Triggers a browser file download for a text blob (CSV, JSON, etc.)
 */
export function downloadFile(content: string, filename: string, mimeType: string): void {
  if (typeof document === 'undefined') return
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
