import { describe, it, expect } from 'vitest'
import { TEMPLATES_HANDLERS } from '../../src/tools/templates'
import { createMockToolRequest, verifyToolResponse } from '../utils/test-helpers'

describe('Templates API Tools', () => {
  describe('template_list', () => {
    it('should list templates successfully', async () => {
      const request = createMockToolRequest('template_list', {
        emptyList: false,
        errorTest: false,
      })
      // @ts-ignore - Ignore type errors for testing purposes
      const response = await TEMPLATES_HANDLERS.template_list(request)

      verifyToolResponse(response)
      // @ts-ignore - We know this structure exists in our tests
      expect(response.toolResult.content[0].text).toContain('test-template-1')
      // @ts-ignore - We know this structure exists in our tests
      expect(response.toolResult.content[0].text).toContain('test-template-2')
    })

    it('should handle empty template list', async () => {
      const request = createMockToolRequest('template_list', {
        emptyList: true,
        errorTest: false,
      })
      // @ts-ignore - Ignore type errors for testing purposes
      const response = await TEMPLATES_HANDLERS.template_list(request)

      verifyToolResponse(response)
      // @ts-ignore - We know this structure exists in our tests
      expect(response.toolResult.content[0].text).toContain('No templates found')
    })

    it('should handle API errors', async () => {
      const request = createMockToolRequest('template_list', {
        emptyList: false,
        errorTest: true,
      })
      // @ts-ignore - Ignore type errors for testing purposes
      const response = await TEMPLATES_HANDLERS.template_list(request)

      verifyToolResponse(response, true)
      // @ts-ignore - We know this structure exists in our tests
      expect(response.toolResult.content[0].text).toContain('Error')
    })
  })

  describe('template_get', () => {
    it('should get template details successfully', async () => {
      const request = createMockToolRequest('template_get', {
        templateId: 'template-abc123',
        errorTest: false,
      })
      // @ts-ignore - Ignore type errors for testing purposes
      const response = await TEMPLATES_HANDLERS.template_get(request)

      verifyToolResponse(response)
      // @ts-ignore - We know this structure exists in our tests
      expect(response.toolResult.content[0].text).toContain('test-template')
      // @ts-ignore - We know this structure exists in our tests
      expect(response.toolResult.content[0].text).toContain('addEventListener')
    })

    it('should handle API errors', async () => {
      const request = createMockToolRequest('template_get', {
        templateId: 'non-existent-template',
        errorTest: true,
      })
      // @ts-ignore - Ignore type errors for testing purposes
      const response = await TEMPLATES_HANDLERS.template_get(request)

      verifyToolResponse(response, true)
      // @ts-ignore - We know this structure exists in our tests
      expect(response.toolResult.content[0].text).toContain('Error')
    })
  })

  describe('template_create_worker', () => {
    it('should create worker from template successfully', async () => {
      const request = createMockToolRequest('template_create_worker', {
        templateId: 'template-abc123',
        name: 'test-worker',
        config: {},
        errorTest: false,
      })
      // @ts-ignore - Ignore type errors for testing purposes
      const response = await TEMPLATES_HANDLERS.template_create_worker(request)

      verifyToolResponse(response)
      // @ts-ignore - We know this structure exists in our tests
      expect(response.toolResult.content[0].text).toContain('Worker created successfully')
    })

    it('should handle API errors', async () => {
      const request = createMockToolRequest('template_create_worker', {
        templateId: 'non-existent-template',
        name: 'test-worker',
        config: {},
        errorTest: true,
      })
      // @ts-ignore - Ignore type errors for testing purposes
      const response = await TEMPLATES_HANDLERS.template_create_worker(request)

      verifyToolResponse(response, true)
      // @ts-ignore - We know this structure exists in our tests
      expect(response.toolResult.content[0].text).toContain('Error')
    })
  })
})
