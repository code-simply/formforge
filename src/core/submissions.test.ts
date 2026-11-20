import { describe, it, expect } from 'vitest'
import {
  escapeCsvValue,
  exportSubmissionsToCsv,
  exportSubmissionsToJson,
} from './submissions'
import { FormSubmissionRecord, FormBuilderSchema } from './types'

describe('Submissions Manager & Data Exporter', () => {
  describe('escapeCsvValue', () => {
    it('escapes null and undefined as empty quoted string', () => {
      expect(escapeCsvValue(null)).toBe('""')
      expect(escapeCsvValue(undefined)).toBe('""')
    })

    it('wraps regular string in quotes', () => {
      expect(escapeCsvValue('John Doe')).toBe('"John Doe"')
    })

    it('escapes internal quotes with double quotes', () => {
      expect(escapeCsvValue('He said "Hello"')).toBe('"He said ""Hello"""')
    })

    it('serializes objects and arrays cleanly inside quotes', () => {
      const escaped = escapeCsvValue({ role: 'admin', tier: 2 })
      expect(escaped).toBe('"{""role"":""admin"",""tier"":2}"')
    })
  })

  describe('exportSubmissionsToCsv', () => {
    const mockSubmissions: FormSubmissionRecord[] = [
      {
        id: 'sub_001',
        formId: 'form_lead',
        formTitle: 'Contact Form',
        timestamp: '2026-11-20T10:00:00.000Z',
        values: {
          name: 'Alice Johnson',
          email: 'alice@example.com',
          tier: 'enterprise',
        },
        webhookStatus: {
          attempted: true,
          success: true,
          status: 200,
          message: 'Delivered',
        },
      },
      {
        id: 'sub_002',
        formId: 'form_lead',
        formTitle: 'Contact Form',
        timestamp: '2026-11-20T10:15:00.000Z',
        values: {
          name: 'Bob Smith',
          email: 'bob@example.com',
          tier: 'starter',
        },
        webhookStatus: {
          attempted: true,
          success: false,
          status: 500,
          message: 'Internal Server Error',
        },
      },
    ]

    it('exports submissions with correct headers and rows', () => {
      const csv = exportSubmissionsToCsv(mockSubmissions)
      const lines = csv.split('\r\n')

      expect(lines.length).toBe(3) // Header + 2 data rows
      expect(lines[0]).toContain('"Submission ID"')
      expect(lines[0]).toContain('"Timestamp"')
      expect(lines[0]).toContain('"Form Title"')
      expect(lines[0]).toContain('"name"')
      expect(lines[0]).toContain('"email"')
      expect(lines[0]).toContain('"tier"')

      // First data row
      expect(lines[1]).toContain('"sub_001"')
      expect(lines[1]).toContain('"Alice Johnson"')
      expect(lines[1]).toContain('"HTTP 200 (Delivered)"')

      // Second data row
      expect(lines[2]).toContain('"sub_002"')
      expect(lines[2]).toContain('"Bob Smith"')
      expect(lines[2]).toContain('"Failed (Internal Server Error)"')
    })

    it('uses human labels when FormBuilderSchema is provided', () => {
      const mockSchema = {
        id: 'form_lead',
        title: 'Contact Form',
        fields: {
          f_name: {
            id: 'f_name',
            name: 'name',
            type: 'text',
            label: 'Full Legal Name',
          },
          f_email: {
            id: 'f_email',
            name: 'email',
            type: 'email',
            label: 'Corporate Email',
          },
        },
      } as unknown as FormBuilderSchema

      const csv = exportSubmissionsToCsv(mockSubmissions, mockSchema)
      expect(csv).toContain('"Full Legal Name (name)"')
      expect(csv).toContain('"Corporate Email (email)"')
    })

    it('handles empty submissions array gracefully', () => {
      const csv = exportSubmissionsToCsv([])
      expect(csv).toContain('Submission ID')
    })
  })

  describe('exportSubmissionsToJson', () => {
    it('serializes submissions array to valid formatted JSON', () => {
      const mockRecord: FormSubmissionRecord = {
        id: 'sub_test',
        formId: 'f1',
        formTitle: 'Test Form',
        timestamp: '2026-11-20T12:00:00Z',
        values: { test: true },
      }
      const json = exportSubmissionsToJson([mockRecord])
      const parsed = JSON.parse(json)
      expect(parsed).toHaveLength(1)
      expect(parsed[0].id).toBe('sub_test')
      expect(parsed[0].values.test).toBe(true)
    })
  })
})
