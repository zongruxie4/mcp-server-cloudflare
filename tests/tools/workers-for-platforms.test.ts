import { describe, it, expect, beforeEach } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from '../setup'
import { WFP_HANDLERS } from '../../src/tools/workers-for-platforms'
import { createMockToolRequest, verifyToolResponse } from '../utils/test-helpers'
import { mockData } from '../mocks/data'

describe('Workers for Platforms API Tools', () => {
  beforeEach(() => {
    server.resetHandlers()
  })

  describe('wfp_list_namespaces', () => {
    it('should list namespaces successfully', async () => {
      const request = createMockToolRequest('wfp_list_namespaces')
      // @ts-ignore - Ignore type errors for testing purposes
      const response = await WFP_HANDLERS.wfp_list_namespaces(request)
      
      verifyToolResponse(response)
      // @ts-ignore - We know this structure exists in our tests
      expect(response.toolResult.content[0].text).toContain('test-namespace-1')
      // @ts-ignore - We know this structure exists in our tests
      expect(response.toolResult.content[0].text).toContain('test-namespace-2')
    })

    it('should handle empty namespace list', async () => {
      const request = createMockToolRequest('wfp_list_namespaces', { emptyList: true })
      // @ts-ignore - Ignore type errors for testing purposes
      const response = await WFP_HANDLERS.wfp_list_namespaces(request)
      
      verifyToolResponse(response)
      // @ts-ignore - We know this structure exists in our tests
      expect(response.toolResult.content[0].text).toContain('No namespaces found')
    })

    it('should handle API errors', async () => {
      const request = createMockToolRequest('wfp_list_namespaces', { errorTest: true })
      // @ts-ignore - Ignore type errors for testing purposes
      const response = await WFP_HANDLERS.wfp_list_namespaces(request)
      
      verifyToolResponse(response, true)
      // @ts-ignore - We know this structure exists in our tests
      expect(response.toolResult.content[0].text).toContain('Error')
    })
  })

  describe('wfp_create_namespace', () => {
    it('should create a namespace successfully', async () => {
      const request = createMockToolRequest('wfp_create_namespace', {
        name: 'test-namespace'
      })
      // @ts-ignore - Ignore type errors for testing purposes
      const response = await WFP_HANDLERS.wfp_create_namespace(request)
      
      verifyToolResponse(response)
      // @ts-ignore - We know this structure exists in our tests
      expect(response.toolResult.content[0].text).toContain('Namespace created successfully')
      // @ts-ignore - We know this structure exists in our tests
      expect(response.toolResult.content[0].text).toContain('test-namespace')
    })

    it('should handle API errors', async () => {
      const request = createMockToolRequest('wfp_create_namespace', {
        name: 'invalid-namespace',
        errorTest: true
      })
      // @ts-ignore - Ignore type errors for testing purposes
      const response = await WFP_HANDLERS.wfp_create_namespace(request)
      
      verifyToolResponse(response, true)
      // @ts-ignore - We know this structure exists in our tests
      expect(response.toolResult.content[0].text).toContain('Error')
    })
  })

  describe('wfp_delete_namespace', () => {
    it('should delete a namespace successfully', async () => {
      const request = createMockToolRequest('wfp_delete_namespace', {
        namespace: 'test-namespace'
      })
      // @ts-ignore - Ignore type errors for testing purposes
      const response = await WFP_HANDLERS.wfp_delete_namespace(request)
      
      verifyToolResponse(response)
      // @ts-ignore - We know this structure exists in our tests
      expect(response.toolResult.content[0].text).toContain('Namespace deleted successfully')
    })

    it('should handle API errors', async () => {
      const request = createMockToolRequest('wfp_delete_namespace', {
        namespace: 'non-existent-namespace',
        errorTest: true
      })
      // @ts-ignore - Ignore type errors for testing purposes
      const response = await WFP_HANDLERS.wfp_delete_namespace(request)
      
      verifyToolResponse(response, true)
      // @ts-ignore - We know this structure exists in our tests
      expect(response.toolResult.content[0].text).toContain('Error')
    })
  })

  describe('wfp_list_scripts', () => {
    it('should list scripts successfully', async () => {
      const request = createMockToolRequest('wfp_list_scripts', {
        namespace: 'test-namespace'
      })
      // @ts-ignore - Ignore type errors for testing purposes
      const response = await WFP_HANDLERS.wfp_list_scripts(request)
      
      verifyToolResponse(response)
      // @ts-ignore - We know this structure exists in our tests
      expect(response.toolResult.content[0].text).toContain('test-script-1')
      // @ts-ignore - We know this structure exists in our tests
      expect(response.toolResult.content[0].text).toContain('test-script-2')
    })

    it('should handle empty script list', async () => {
      const request = createMockToolRequest('wfp_list_scripts', {
        namespace: 'test-namespace',
        emptyList: true
      })
      // @ts-ignore - Ignore type errors for testing purposes
      const response = await WFP_HANDLERS.wfp_list_scripts(request)
      
      verifyToolResponse(response)
      // @ts-ignore - We know this structure exists in our tests
      expect(response.toolResult.content[0].text).toContain('No scripts found')
    })
  })

  describe('wfp_update_script', () => {
    it('should update a script successfully', async () => {
      const request = createMockToolRequest('wfp_update_script', {
        namespace: 'test-namespace',
        scriptName: 'test-script',
        script: 'addEventListener("fetch", (event) => { event.respondWith(new Response("Hello World")); });'
      })
      // @ts-ignore - Ignore type errors for testing purposes
      const response = await WFP_HANDLERS.wfp_update_script(request)
      
      verifyToolResponse(response)
      // @ts-ignore - We know this structure exists in our tests
      expect(response.toolResult.content[0].text).toContain('Script updated successfully')
      // @ts-ignore - We know this structure exists in our tests
      expect(response.toolResult.content[0].text).toContain('test-script')
    })

    it('should handle API errors', async () => {
      const request = createMockToolRequest('wfp_update_script', {
        namespace: 'test-namespace',
        scriptName: 'test-script',
        script: 'invalid-script',
        errorTest: true
      })
      // @ts-ignore - Ignore type errors for testing purposes
      const response = await WFP_HANDLERS.wfp_update_script(request)
      
      verifyToolResponse(response, true)
      // @ts-ignore - We know this structure exists in our tests
      expect(response.toolResult.content[0].text).toContain('Error')
    })
  })

  describe('wfp_delete_script', () => {
    it('should delete a script successfully', async () => {
      const request = createMockToolRequest('wfp_delete_script', {
        namespace: 'test-namespace',
        scriptName: 'test-script'
      })
      // @ts-ignore - Ignore type errors for testing purposes
      const response = await WFP_HANDLERS.wfp_delete_script(request)
      
      verifyToolResponse(response)
      // @ts-ignore - We know this structure exists in our tests
      expect(response.toolResult.content[0].text).toContain('Script deleted successfully')
    })

    it('should handle API errors', async () => {
      const request = createMockToolRequest('wfp_delete_script', {
        namespace: 'test-namespace',
        scriptName: 'non-existent-script',
        errorTest: true
      })
      // @ts-ignore - Ignore type errors for testing purposes
      const response = await WFP_HANDLERS.wfp_delete_script(request)
      
      verifyToolResponse(response, true)
      // @ts-ignore - We know this structure exists in our tests
      expect(response.toolResult.content[0].text).toContain('Error')
    })
  })
})
