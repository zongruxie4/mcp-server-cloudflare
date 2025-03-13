import { describe, it, expect } from 'vitest'
import { ZONES_HANDLERS } from '../../src/tools/zones'
import { createMockToolRequest, verifyToolResponse } from '../utils/test-helpers'

describe('Zones API Tools', () => {

  describe('zones_list', () => {
    it('should list zones successfully', async () => {
      const request = createMockToolRequest('zones_list')
      // @ts-ignore - Ignore type errors for testing purposes
      const response = await ZONES_HANDLERS.zones_list(request)
      
      verifyToolResponse(response)
      // @ts-ignore - We know this structure exists in our tests
      expect(response.toolResult.content[0].text).toContain('example.com')
      // @ts-ignore - We know this structure exists in our tests
      expect(response.toolResult.content[0].text).toContain('test.com')
    })

    it('should handle empty zones list', async () => {
      // Add emptyList parameter to identify this as the empty list test
      // This is similar to how bindings test does it
      const request = createMockToolRequest('zones_list', {
        emptyList: true
      })
      // @ts-ignore - Ignore type errors for testing purposes
      const response = await ZONES_HANDLERS.zones_list(request)
      
      verifyToolResponse(response)
      // @ts-ignore - We know this structure exists in our tests
      expect(response.toolResult.content[0].text).toContain('No zones found')
    })

    it('should handle API errors', async () => {
      // Add errorTest parameter to identify this as the error test
      const request = createMockToolRequest('zones_list', {
        errorTest: true
      })
      // @ts-ignore - Ignore type errors for testing purposes
      const response = await ZONES_HANDLERS.zones_list(request)
      
      verifyToolResponse(response, true)
      // @ts-ignore - We know this structure exists in our tests
      expect(response.toolResult.content[0].text).toContain('Error')
    })
  })

  describe('zones_get', () => {
    it('should get zone details successfully', async () => {
      const request = createMockToolRequest('zones_get', {
        zoneId: 'zone-abc123'
      })
      // @ts-ignore - Ignore type errors for testing purposes
      const response = await ZONES_HANDLERS.zones_get(request)
      
      verifyToolResponse(response)
      // @ts-ignore - We know this structure exists in our tests
      expect(response.toolResult.content[0].text).toContain('example.com')
      // @ts-ignore - We know this structure exists in our tests
      expect(response.toolResult.content[0].text).toContain('active')
    })

    it('should handle API errors', async () => {
      // Using the non-existent-zone ID with no MSW setup
      const request = createMockToolRequest('zones_get', {
        zoneId: 'non-existent-zone'
      })
      // @ts-ignore - Ignore type errors for testing purposes
      const response = await ZONES_HANDLERS.zones_get(request)
      
      verifyToolResponse(response, true)
      // @ts-ignore - We know this structure exists in our tests
      expect(response.toolResult.content[0].text).toContain('Error')
    })
  })
})
