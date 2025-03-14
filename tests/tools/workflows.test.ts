import { describe, it, expect, beforeEach } from 'vitest'
import { WORKFLOWS_HANDLERS } from '../../src/tools/workflows'
import { createMockToolRequest, verifyToolResponse } from '../utils/test-helpers'
import { mockData } from '../mocks/data'

describe('Workflows API Tools', () => {

  describe('workflow_list', () => {
    it('should list workflows successfully', async () => {
      const request = createMockToolRequest('workflow_list')
      // @ts-ignore - Ignore type errors for testing purposes
      const response = await WORKFLOWS_HANDLERS.workflow_list(request)
      
      verifyToolResponse(response)
      // @ts-ignore - We know this structure exists in our tests
      expect(response.toolResult.content[0].text).toContain('test-workflow-1')
      // @ts-ignore - We know this structure exists in our tests
      expect(response.toolResult.content[0].text).toContain('test-workflow-2')
    })

    it('should handle empty workflow list', async () => {
      const request = createMockToolRequest('workflow_list', {
        emptyList: true
      })
      // @ts-ignore - Ignore type errors for testing purposes
      const response = await WORKFLOWS_HANDLERS.workflow_list(request)
      
      verifyToolResponse(response)
      // @ts-ignore - We know this structure exists in our tests
      expect(response.toolResult.content[0].text).toContain('No workflows found')
    })

    it('should handle API errors', async () => {
      const request = createMockToolRequest('workflow_list', {
        errorTest: true
      })
      // @ts-ignore - Ignore type errors for testing purposes
      const response = await WORKFLOWS_HANDLERS.workflow_list(request)
      
      verifyToolResponse(response, true)
      // @ts-ignore - We know this structure exists in our tests
      expect(response.toolResult.content[0].text).toContain('Error')
    })
  })

  describe('workflow_get', () => {
    it('should get workflow details successfully', async () => {
      const request = createMockToolRequest('workflow_get', { 
        workflowId: 'workflow-abc123' 
      })
      // @ts-ignore - Ignore type errors for testing purposes
      const response = await WORKFLOWS_HANDLERS.workflow_get(request)
      
      verifyToolResponse(response)
      // @ts-ignore - We know this structure exists in our tests
      expect(response.toolResult.content[0].text).toContain('test-workflow')
      // @ts-ignore - We know this structure exists in our tests
      expect(response.toolResult.content[0].text).toContain('step1')
      // @ts-ignore - We know this structure exists in our tests
      expect(response.toolResult.content[0].text).toContain('step2')
    })

    it('should handle API errors', async () => {
      const request = createMockToolRequest('workflow_get', { 
        workflowId: 'non-existent-workflow' 
      })
      // @ts-ignore - Ignore type errors for testing purposes
      const response = await WORKFLOWS_HANDLERS.workflow_get(request)
      
      verifyToolResponse(response, true)
      // @ts-ignore - We know this structure exists in our tests
      expect(response.toolResult.content[0].text).toContain('Error')
    })
  })

  describe('workflow_create', () => {
    it('should create a workflow successfully', async () => {
      const request = createMockToolRequest('workflow_create', { 
        name: 'test-workflow',
        content: {
          steps: [
            {
              name: 'step1',
              type: 'script',
              script: 'test-script-1'
            },
            {
              name: 'step2',
              type: 'wait',
              timeout: 30
            }
          ]
        }
      })
      // @ts-ignore - Ignore type errors for testing purposes
      const response = await WORKFLOWS_HANDLERS.workflow_create(request)
      
      verifyToolResponse(response)
      // @ts-ignore - We know this structure exists in our tests
      expect(response.toolResult.content[0].text).toContain('test-workflow')
      // @ts-ignore - We know this structure exists in our tests
      expect(response.toolResult.content[0].text).toContain('workflow-abc123')
    })

    it('should handle API errors', async () => {
      const request = createMockToolRequest('workflow_create', { 
        name: 'test-workflow',
        content: {},
        errorTest: true
      })
      // @ts-ignore - Ignore type errors for testing purposes
      const response = await WORKFLOWS_HANDLERS.workflow_create(request)
      
      verifyToolResponse(response, true)
      // @ts-ignore - We know this structure exists in our tests
      expect(response.toolResult.content[0].text).toContain('Error')
    })
  })

  describe('workflow_delete', () => {
    it('should delete a workflow successfully', async () => {
      const request = createMockToolRequest('workflow_delete', { 
        workflowId: 'workflow-abc123' 
      })
      // @ts-ignore - Ignore type errors for testing purposes
      const response = await WORKFLOWS_HANDLERS.workflow_delete(request)
      
      verifyToolResponse(response)
      // @ts-ignore - We know this structure exists in our tests
      expect(response.toolResult.content[0].text).toContain('Workflow deleted successfully')
    })

    it('should handle API errors', async () => {
      const request = createMockToolRequest('workflow_delete', { 
        workflowId: 'non-existent-workflow' 
      })
      // @ts-ignore - Ignore type errors for testing purposes
      const response = await WORKFLOWS_HANDLERS.workflow_delete(request)
      
      verifyToolResponse(response, true)
      // @ts-ignore - We know this structure exists in our tests
      expect(response.toolResult.content[0].text).toContain('Error')
    })
  })
})
