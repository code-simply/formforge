import { describe, it, expect, vi, beforeEach } from 'vitest'
import { remapFormPayload, sendWebhookPayload } from './webhook'
import { WebhookConfig } from './types'

describe('webhook engine: remapFormPayload', () => {
  it('returns raw values untouched when no mapping or static payload is provided', () => {
    const raw = { firstName: 'Alice', age: 30 }
    const result = remapFormPayload(raw)
    expect(result).toEqual({ firstName: 'Alice', age: 30 })
  })

  it('renames keys according to simple keyMapping dictionary', () => {
    const raw = { f_123: 'John', f_456: 'john@example.com' }
    const mapping = { f_123: 'fullName', f_456: 'email' }

    const result = remapFormPayload(raw, mapping)
    expect(result).toEqual({
      fullName: 'John',
      email: 'john@example.com',
    })
  })

  it('supports deep nested dot-notation paths', () => {
    const raw = {
      user_name: 'John Doe',
      user_email: 'john@example.com',
      company_name: 'Acme Corp',
      city: 'San Francisco',
    }
    const mapping = {
      user_name: 'profile.personal.name',
      user_email: 'profile.contact.email',
      company_name: 'organization.name',
      city: 'organization.address.city',
    }

    const result = remapFormPayload(raw, mapping)
    expect(result).toEqual({
      profile: {
        personal: {
          name: 'John Doe',
        },
        contact: {
          email: 'john@example.com',
        },
      },
      organization: {
        name: 'Acme Corp',
        address: {
          city: 'San Francisco',
        },
      },
    })
  })

  it('merges static payload and supports dot-notation in static fields', () => {
    const raw = { message: 'Hello' }
    const staticPayload = {
      source: 'web-landing',
      'meta.version': '2.1.0',
      'meta.env': 'production',
    }

    const result = remapFormPayload(raw, undefined, staticPayload)
    expect(result).toEqual({
      message: 'Hello',
      source: 'web-landing',
      meta: {
        version: '2.1.0',
        env: 'production',
      },
    })
  })

  it('retains unmapped fields alongside mapped fields', () => {
    const raw = { mappedField: 'Value1', unmappedField: 'Value2' }
    const mapping = { mappedField: 'custom.destination' }

    const result = remapFormPayload(raw, mapping)
    expect(result).toEqual({
      custom: {
        destination: 'Value1',
      },
      unmappedField: 'Value2',
    })
  })
})

describe('webhook engine: sendWebhookPayload', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('returns failure immediately if webhook is disabled', async () => {
    const config: WebhookConfig = {
      enabled: false,
      url: 'https://example.com/api',
    }

    const result = await sendWebhookPayload(config, { test: 123 })
    expect(result.success).toBe(false)
    expect(result.message).toContain('not enabled')
  })

  it('returns failure immediately if url is empty', async () => {
    const config: WebhookConfig = {
      enabled: true,
      url: '',
    }

    const result = await sendWebhookPayload(config, { test: 123 })
    expect(result.success).toBe(false)
    expect(result.message).toContain('URL is missing')
  })

  it('dispatches HTTP request with correct headers, method, and remapped payload', async () => {
    const mockResponse = { ok: true, status: 200, json: async () => ({ received: true }) }
    const fetchSpy = vi.fn().mockResolvedValue(mockResponse)
    global.fetch = fetchSpy

    const config: WebhookConfig = {
      enabled: true,
      url: 'https://api.example.com/webhook',
      method: 'POST',
      headers: {
        Authorization: 'Bearer test-token',
        'X-Client': 'FormBuilder',
      },
      keyMapping: {
        field_a: 'data.itemA',
      },
      staticPayload: {
        environment: 'testing',
      },
    }

    const raw = { field_a: 'Hello World' }
    const result = await sendWebhookPayload(config, raw)

    expect(result.success).toBe(true)
    expect(result.status).toBe(200)
    expect(fetchSpy).toHaveBeenCalledTimes(1)

    const [calledUrl, options] = fetchSpy.mock.calls[0]
    expect(calledUrl).toBe('https://api.example.com/webhook')
    expect(options.method).toBe('POST')
    expect(options.headers).toEqual({
      'Content-Type': 'application/json',
      Authorization: 'Bearer test-token',
      'X-Client': 'FormBuilder',
    })

    const parsedBody = JSON.parse(options.body)
    expect(parsedBody).toEqual({
      data: {
        itemA: 'Hello World',
      },
      environment: 'testing',
    })
  })

  it('handles HTTP error responses gracefully', async () => {
    const mockResponse = {
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      text: async () => 'Database connection failed',
    }
    global.fetch = vi.fn().mockResolvedValue(mockResponse)

    const config: WebhookConfig = {
      enabled: true,
      url: 'https://api.example.com/error-test',
    }

    const result = await sendWebhookPayload(config, { data: 'test' })
    expect(result.success).toBe(false)
    expect(result.status).toBe(500)
    expect(result.message).toContain('500')
  })

  it('catches network/exception errors and returns clean error message', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network offline'))

    const config: WebhookConfig = {
      enabled: true,
      url: 'https://offline-endpoint.test',
    }

    const result = await sendWebhookPayload(config, { data: 'test' })
    expect(result.success).toBe(false)
    expect(result.status).toBe(0)
    expect(result.message).toBe('Network offline')
  })
})
