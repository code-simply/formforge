import { WebhookConfig } from './types'

/**
 * Sets a value in an object using dot notation path (e.g. "user.profile.name")
 */
function setNestedValue(obj: Record<string, any>, path: string, value: unknown): void {
  const parts = path.split('.')
  let current = obj

  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i]
    if (!current[part] || typeof current[part] !== 'object') {
      current[part] = {}
    }
    current = current[part]
  }

  current[parts[parts.length - 1]] = value
}

/**
 * Remaps raw form data using keyMapping and merges staticPayload
 */
export function remapFormPayload(
  rawValues: Record<string, unknown>,
  keyMapping?: Record<string, string>,
  staticPayload?: Record<string, unknown>
): Record<string, unknown> {
  const result: Record<string, any> = {}

  // 1. Apply key mapping
  for (const [key, value] of Object.entries(rawValues)) {
    const targetKey = keyMapping?.[key] || key

    if (targetKey.includes('.')) {
      setNestedValue(result, targetKey, value)
    } else {
      result[targetKey] = value
    }
  }

  // 2. Merge static payload (e.g. source, env, tracking)
  if (staticPayload) {
    for (const [sKey, sValue] of Object.entries(staticPayload)) {
      if (sKey.includes('.')) {
        setNestedValue(result, sKey, sValue)
      } else {
        result[sKey] = sValue
      }
    }
  }

  return result
}

export interface WebhookSendResult {
  success: boolean
  status: number
  message: string
  responseBody?: unknown
}

/**
 * Sends remapped payload to configured Webhook endpoint
 */
export async function sendWebhookPayload(
  config: WebhookConfig,
  rawValues: Record<string, unknown>
): Promise<WebhookSendResult> {
  if (!config.enabled || !config.url) {
    return {
      success: false,
      status: 0,
      message: 'Webhook is not enabled or URL is missing',
    }
  }

  const payload = remapFormPayload(rawValues, config.keyMapping, config.staticPayload)

  try {
    const response = await fetch(config.url, {
      method: config.method || 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(config.headers || {}),
      },
      body: JSON.stringify(payload),
    })

    let responseBody: unknown
    try {
      responseBody = await response.json()
    } catch {
      responseBody = await response.text()
    }

    if (response.ok) {
      return {
        success: true,
        status: response.status,
        message: 'Webhook delivered successfully',
        responseBody,
      }
    } else {
      return {
        success: false,
        status: response.status,
        message: `Webhook failed with HTTP ${response.status}`,
        responseBody,
      }
    }
  } catch (error: any) {
    return {
      success: false,
      status: 0,
      message: error?.message || 'Network error while delivering webhook',
    }
  }
}

/**
 * Generates an executable copyable cURL command snippet for terminal testing
 */
export function generateCurlSnippet(
  config: WebhookConfig,
  rawValues: Record<string, unknown>
): string {
  const payload = remapFormPayload(rawValues, config.keyMapping, config.staticPayload)
  const headerFlags = Object.entries(config.headers || {})
    .map(([k, v]) => `-H "${k}: ${v}"`)
    .join(' ')

  const headerPart = headerFlags ? ` ${headerFlags}` : ''
  const escapedBody = JSON.stringify(payload).replace(/'/g, `'\\''`)

  return `curl -X ${config.method || 'POST'} "${config.url || 'https://example.com/webhook'}" -H "Content-Type: application/json"${headerPart} -d '${escapedBody}'`
}
