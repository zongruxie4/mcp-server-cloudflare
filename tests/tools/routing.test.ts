import { describe, it, expect } from 'vitest'
import { ROUTING_HANDLERS } from '../../src/tools/routing'
import { createMockToolRequest, verifyToolResponse } from '../utils/test-helpers'

describe('Routing API Tools', () => {
  describe('route_list', () => {
    it('should list routes successfully', async () => {
      const request = createMockToolRequest('route_list', { 
        zoneId: 'zone-abc123',
        emptyList: false,
        errorTest: false
      })
      // @ts-ignore - Ignore type errors for testing purposes
      const response = await ROUTING_HANDLERS.route_list(request)
      
      verifyToolResponse(response)
      // @ts-ignore - We know this structure exists in our tests
      expect(response.toolResult.content[0].text).toContain('example.com/*')
      // @ts-ignore - We know this structure exists in our tests
      expect(response.toolResult.content[0].text).toContain('api.example.com/*')
    })

    it('should handle empty routes list', async () => {
      const request = createMockToolRequest('route_list', { 
        zoneId: 'zone-abc123',
        emptyList: true,
        errorTest: false
      })
      // @ts-ignore - Ignore type errors for testing purposes
      const response = await ROUTING_HANDLERS.route_list(request)
      
      verifyToolResponse(response)
      // @ts-ignore - We know this structure exists in our tests
      expect(response.toolResult.content[0].text).toContain('No routes found')
    })

    it('should handle API errors when listing routes', async () => {
      const request = createMockToolRequest('route_list', { 
        zoneId: 'zone-abc123',
        emptyList: false,
        errorTest: true
      })
      // @ts-ignore - Ignore type errors for testing purposes
      const response = await ROUTING_HANDLERS.route_list(request)
      
      verifyToolResponse(response, true)
      // @ts-ignore - We know this structure exists in our tests
      expect(response.toolResult.content[0].text).toContain('Error')
      // @ts-ignore - We know this structure exists in our tests
      expect(response.toolResult.content[0].text).toContain('Failed to fetch routes')
    })
  })

  describe('route_create', () => {
    it('should create a route successfully', async () => {
      const request = createMockToolRequest('route_create', {
        zoneId: 'zone-abc123',
        pattern: 'new.example.com/*',
        scriptName: 'new-script',
        errorTest: false,
        invalidPattern: false
      })
      // @ts-ignore - Ignore type errors for testing purposes
      const response = await ROUTING_HANDLERS.route_create(request)
      
      verifyToolResponse(response)
      // @ts-ignore - We know this structure exists in our tests
      expect(response.toolResult.content[0].text).toContain('route-new123')
      // @ts-ignore - We know this structure exists in our tests
      expect(response.toolResult.content[0].text).toContain('new.example.com/*')
    })

    it('should handle errors with invalid patterns', async () => {
      const request = createMockToolRequest('route_create', {
        zoneId: 'zone-abc123',
        pattern: 'invalid-pattern',
        scriptName: 'test-script',
        invalidPattern: true
      })
      // @ts-ignore - Ignore type errors for testing purposes
      const response = await ROUTING_HANDLERS.route_create(request)
      
      verifyToolResponse(response, true)
      // @ts-ignore - We know this structure exists in our tests
      expect(response.toolResult.content[0].text).toContain('Error')
      // @ts-ignore - We know this structure exists in our tests
      expect(response.toolResult.content[0].text).toContain('Invalid pattern format')
    })

    it('should handle general API errors', async () => {
      const request = createMockToolRequest('route_create', {
        zoneId: 'zone-abc123',
        pattern: 'example.com/*',
        scriptName: 'test-script',
        errorTest: true
      })
      // @ts-ignore - Ignore type errors for testing purposes
      const response = await ROUTING_HANDLERS.route_create(request)
      
      verifyToolResponse(response, true)
      // @ts-ignore - We know this structure exists in our tests
      expect(response.toolResult.content[0].text).toContain('Error')
      // @ts-ignore - We know this structure exists in our tests
      expect(response.toolResult.content[0].text).toContain('Failed to create route')
    })
  })

  describe('route_delete', () => {
    it('should delete a route successfully', async () => {
      const request = createMockToolRequest('route_delete', {
        zoneId: 'zone-abc123',
        routeId: 'route-abc123',
        errorTest: false
      })
      // @ts-ignore - Ignore type errors for testing purposes
      const response = await ROUTING_HANDLERS.route_delete(request)
      
      verifyToolResponse(response)
      // @ts-ignore - We know this structure exists in our tests
      expect(response.toolResult.content[0].text).toContain('Route deleted successfully')
    })

    it('should handle API errors when deleting routes', async () => {
      const request = createMockToolRequest('route_delete', {
        zoneId: 'zone-abc123',
        routeId: 'non-existent-route',
        errorTest: true
      })
      // @ts-ignore - Ignore type errors for testing purposes
      const response = await ROUTING_HANDLERS.route_delete(request)
      
      verifyToolResponse(response, true)
      // @ts-ignore - We know this structure exists in our tests
      expect(response.toolResult.content[0].text).toContain('Error')
      // @ts-ignore - We know this structure exists in our tests
      expect(response.toolResult.content[0].text).toContain('Route not found')
    })
  })
})
