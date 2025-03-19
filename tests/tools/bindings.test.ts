import { describe, it, expect } from 'vitest'
import { BINDINGS_HANDLERS } from '../../src/tools/bindings'
import { createMockToolRequest, verifyToolResponse, CloudflareToolResponse } from '../utils/test-helpers'

describe('Bindings API Tools', () => {
  describe('bindings_list', () => {
    it('should list bindings successfully', async () => {
      const request = createMockToolRequest('bindings_list', {
        serviceName: 'test-service',
        envName: 'production',
        emptyList: false,
        errorTest: false,
      })
      // @ts-ignore - Ignore type errors for testing purposes
      const response = (await BINDINGS_HANDLERS.bindings_list(request)) as CloudflareToolResponse

      verifyToolResponse(response)
      // @ts-ignore - We know this structure exists in our tests
      expect((response as any).toolResult.content[0].text).toContain('KV_BINDING')
      // @ts-ignore - We know this structure exists in our tests
      expect((response as any).toolResult.content[0].text).toContain('R2_BINDING')
      // @ts-ignore - We know this structure exists in our tests
      expect((response as any).toolResult.content[0].text).toContain('DO_BINDING')
    })

    it('should handle empty bindings list', async () => {
      const request = createMockToolRequest('bindings_list', {
        serviceName: 'test-service',
        envName: 'production',
        emptyList: true,
        errorTest: false,
      })
      // @ts-ignore - Ignore type errors for testing purposes
      const response = (await BINDINGS_HANDLERS.bindings_list(request)) as CloudflareToolResponse

      verifyToolResponse(response)
      // @ts-ignore - We know this structure exists in our tests
      expect((response as any).toolResult.content[0].text).toContain('No bindings found')
    })

    it('should handle API errors', async () => {
      const request = createMockToolRequest('bindings_list', {
        serviceName: 'non-existent-service',
        envName: 'production',
        emptyList: false,
        errorTest: true,
      })
      // @ts-ignore - Ignore type errors for testing purposes
      const response = (await BINDINGS_HANDLERS.bindings_list(request)) as CloudflareToolResponse

      verifyToolResponse(response, true)
      // @ts-ignore - We know this structure exists in our tests
      expect((response as any).toolResult.content[0].text).toContain('Error')
    })
  })

  describe('bindings_update', () => {
    it('should update bindings successfully', async () => {
      const request = createMockToolRequest('bindings_update', {
        serviceName: 'test-service',
        envName: 'production',
        bindings: [
          {
            name: 'KV_BINDING',
            type: 'kv_namespace',
            kv_namespace_id: 'kv-abc123',
          },
          {
            name: 'R2_BINDING',
            type: 'r2_bucket',
            bucket_name: 'test-bucket',
          },
        ],
      })
      // @ts-ignore - Ignore type errors for testing purposes
      const response = (await BINDINGS_HANDLERS.bindings_update(request)) as CloudflareToolResponse

      verifyToolResponse(response)
      // @ts-ignore - We know this structure exists in our tests
      expect((response as any).toolResult.content[0].text).toContain('Bindings updated successfully')
    })

    it('should handle API errors', async () => {
      const request = createMockToolRequest('bindings_update', {
        serviceName: 'non-existent-service',
        envName: 'production',
        bindings: [],
        errorTest: true,
        invalidConfig: false,
      })
      // @ts-ignore - Ignore type errors for testing purposes
      const response = (await BINDINGS_HANDLERS.bindings_update(request)) as CloudflareToolResponse

      verifyToolResponse(response, true)
      // @ts-ignore - We know this structure exists in our tests
      expect((response as any).toolResult.content[0].text).toContain('Error')
    })

    it('should reject invalid binding configurations', async () => {
      const request = createMockToolRequest('bindings_update', {
        serviceName: 'test-service',
        envName: 'production',
        bindings: [
          {
            name: 'INVALID_BINDING',
            type: 'invalid_type',
          },
        ],
        errorTest: false,
        invalidConfig: true,
      })
      // @ts-ignore - Ignore type errors for testing purposes
      const response = (await BINDINGS_HANDLERS.bindings_update(request)) as CloudflareToolResponse

      verifyToolResponse(response, true) // Expect error
      // @ts-ignore - We know this structure exists in our tests
      expect((response as any).toolResult.content[0].text).toContain('Invalid binding configuration')
    })
  })
})
