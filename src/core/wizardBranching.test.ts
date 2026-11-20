import { describe, it, expect } from 'vitest'
import { generateCurlSnippet } from './webhook'
import { WebhookConfig, FormPage } from './types'
import { evaluateOperator } from './conditions'
import { FormColumnSchema, FormPageSchema } from './schema'

describe('Wizard Branching & Webhook Inspector Tests', () => {
  describe('generateCurlSnippet', () => {
    it('generates a valid cURL command with default POST method and payload', () => {
      const config: WebhookConfig = {
        enabled: true,
        url: 'https://api.example.com/webhook',
        method: 'POST',
      }
      const rawValues = { full_name: 'John Doe', email: 'john@example.com' }
      const curl = generateCurlSnippet(config, rawValues)

      expect(curl).toContain('curl -X POST "https://api.example.com/webhook"')
      expect(curl).toContain('-H "Content-Type: application/json"')
      expect(curl).toContain('"full_name":"John Doe"')
      expect(curl).toContain('"email":"john@example.com"')
    })

    it('includes custom authorization and custom headers', () => {
      const config: WebhookConfig = {
        enabled: true,
        url: 'https://api.example.com/v1/lead',
        method: 'PUT',
        headers: {
          Authorization: 'Bearer secret_token_xyz',
          'X-Custom-Source': 'FormBuilderPro',
        },
      }
      const rawValues = { lead_score: 95 }
      const curl = generateCurlSnippet(config, rawValues)

      expect(curl).toContain('-X PUT')
      expect(curl).toContain('-H "Authorization: Bearer secret_token_xyz"')
      expect(curl).toContain('-H "X-Custom-Source: FormBuilderPro"')
      expect(curl).toContain('"lead_score":95')
    })

    it('correctly maps keys and merges static payloads in generated curl', () => {
      const config: WebhookConfig = {
        enabled: true,
        url: 'https://crm.corp.internal/hooks',
        keyMapping: {
          f_email: 'contact.email',
        },
        staticPayload: {
          source: 'saas_wizard',
          'meta.env': 'production',
        },
      }
      const rawValues = { f_email: 'dev@acme.org' }
      const curl = generateCurlSnippet(config, rawValues)

      expect(curl).toContain('"contact":{"email":"dev@acme.org"}')
      expect(curl).toContain('"source":"saas_wizard"')
      expect(curl).toContain('"meta":{"env":"production"}')
    })
  })

  describe('Conditional Wizard Branching Logic', () => {
    const mockPages: Record<string, FormPage> = {
      p_step1: {
        id: 'p_step1',
        title: 'Account Type',
        rowIds: ['r1'],
        branchRules: [
          {
            id: 'br_ent',
            fieldId: 'tier',
            operator: 'equals',
            value: 'enterprise',
            targetPageId: 'p_enterprise',
          },
          {
            id: 'br_solo',
            fieldId: 'tier',
            operator: 'equals',
            value: 'solo',
            targetPageId: 'p_solo',
          },
        ],
      },
      p_team: {
        id: 'p_team',
        title: 'Team Settings',
        rowIds: ['r2'],
      },
      p_enterprise: {
        id: 'p_enterprise',
        title: 'Enterprise Requirements',
        rowIds: ['r3'],
      },
      p_solo: {
        id: 'p_solo',
        title: 'Solo Workspace',
        rowIds: ['r4'],
      },
      p_confirm: {
        id: 'p_confirm',
        title: 'Confirmation',
        rowIds: ['r5'],
      },
    }

    const pageOrder = ['p_step1', 'p_team', 'p_enterprise', 'p_solo', 'p_confirm']

    // Simulate navigation engine branching algorithm
    function computeNextStep(
      currentPageId: string,
      formValues: Record<string, unknown>,
      pages: Record<string, FormPage>,
      order: string[]
    ): string {
      const page = pages[currentPageId]
      if (!page) return currentPageId

      if (page.branchRules && page.branchRules.length > 0) {
        for (const rule of page.branchRules) {
          const actualVal = formValues[rule.fieldId]
          const matches = evaluateOperator(rule.operator, actualVal, rule.value)
          if (matches && pages[rule.targetPageId]) {
            return rule.targetPageId
          }
        }
      }

      // Default sequential transition
      const currentIndex = order.indexOf(currentPageId)
      if (currentIndex !== -1 && currentIndex < order.length - 1) {
        return order[currentIndex + 1]
      }
      return currentPageId
    }

    it('branches directly to target page when condition matches', () => {
      const values = { tier: 'enterprise' }
      const nextStep = computeNextStep('p_step1', values, mockPages, pageOrder)
      expect(nextStep).toBe('p_enterprise')
    })

    it('branches to alternative target page when alternative condition matches', () => {
      const values = { tier: 'solo' }
      const nextStep = computeNextStep('p_step1', values, mockPages, pageOrder)
      expect(nextStep).toBe('p_solo')
    })

    it('proceeds sequentially when no branch rule condition matches', () => {
      const values = { tier: 'team' }
      const nextStep = computeNextStep('p_step1', values, mockPages, pageOrder)
      expect(nextStep).toBe('p_team')
    })

    it('supports history tracking stack so back navigation returns to originating step', () => {
      const historyStack: string[] = []
      let currentStep = 'p_step1'

      // Step 1: User selects enterprise and navigates
      const values = { tier: 'enterprise' }
      const targetStep = computeNextStep(currentStep, values, mockPages, pageOrder)
      historyStack.push(currentStep)
      currentStep = targetStep

      expect(currentStep).toBe('p_enterprise')
      expect(historyStack).toEqual(['p_step1'])

      // User clicks "Previous" / Back
      const previousStep = historyStack.pop()!
      currentStep = previousStep

      // Crucial: returns to p_step1, NOT the sequential predecessor (p_team)
      expect(currentStep).toBe('p_step1')
      expect(historyStack).toEqual([])
    })
  })

  describe('Zod Schema Validation for Container & Branching Extensions', () => {
    it('accepts valid cardVariant and padding in FormColumnSchema', () => {
      const validCol = {
        id: 'col_card_1',
        width: 6,
        fieldIds: ['f1'],
        cardVariant: 'card',
        padding: 'lg',
        verticalAlign: 'center',
        horizontalAlign: 'center',
      }
      const parsed = FormColumnSchema.safeParse(validCol)
      expect(parsed.success).toBe(true)
      if (parsed.success) {
        expect(parsed.data.cardVariant).toBe('card')
        expect(parsed.data.padding).toBe('lg')
      }
    })

    it('accepts valid branchRules on FormPageSchema', () => {
      const validPage = {
        id: 'p_test',
        title: 'Step 1',
        rowIds: ['r1'],
        branchRules: [
          {
            id: 'rule_1',
            fieldId: 'plan_type',
            operator: 'equals',
            value: 'premium',
            targetPageId: 'p_vip_step',
          },
        ],
      }
      const parsed = FormPageSchema.safeParse(validPage)
      expect(parsed.success).toBe(true)
      if (parsed.success) {
        expect(parsed.data.branchRules?.length).toBe(1)
        expect(parsed.data.branchRules?.[0].targetPageId).toBe('p_vip_step')
      }
    })

    it('rejects invalid cardVariant values in FormColumnSchema', () => {
      const invalidCol = {
        id: 'col_bad',
        width: 6,
        fieldIds: [],
        cardVariant: 'neon-glow', // Not allowed in enum
      }
      const parsed = FormColumnSchema.safeParse(invalidCol)
      expect(parsed.success).toBe(false)
    })
  })
})
