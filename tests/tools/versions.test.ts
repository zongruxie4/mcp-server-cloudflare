import { describe, it, expect, beforeEach, vi } from 'vitest'
import { VERSIONS_HANDLERS } from '../../src/tools/versions'
import { CloudflareToolResponse, createMockToolRequest, verifyToolResponse } from '../utils/test-helpers'
import { mockData } from '../mocks/data'

describe('Versions API Tools', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    vi.resetAllMocks()
  })

  describe('version_list', () => {
    it('should list versions successfully', async () => {
      // Create mock request
      const request = createMockToolRequest('version_list', {
        scriptName: 'test-service',
      })

      // Create successful mock response
      const mockResponse: CloudflareToolResponse = {
        toolResult: {
          isError: false,
          content: [
            {
              type: 'text',
              text: JSON.stringify(mockData.versions.list.result, null, 2),
            },
          ],
        },
      }

      // Mock the implementation
      const originalHandler = VERSIONS_HANDLERS.version_list
      VERSIONS_HANDLERS.version_list = vi.fn().mockImplementation(() => {
        return Promise.resolve(mockResponse as unknown as ReturnType<typeof originalHandler>)
      })

      // Call the handler
      // @ts-ignore - Ignore type errors for testing purposes
      const response = (await VERSIONS_HANDLERS.version_list(request)) as CloudflareToolResponse

      // Verify response
      verifyToolResponse(response)
      expect(response.toolResult.content[0].text).toContain('version-abc123')
      expect(response.toolResult.content[0].text).toContain('version-def456')
      expect(response.toolResult.content[0].text).toContain('user@example.com')

      // Restore original handler
      VERSIONS_HANDLERS.version_list = originalHandler
    })

    it('should handle empty versions list', async () => {
      // Create mock request
      const request = createMockToolRequest('version_list', {
        scriptName: 'test-service',
      })

      // Create empty list mock response
      const mockResponse: CloudflareToolResponse = {
        toolResult: {
          isError: false,
          content: [
            {
              type: 'text',
              text: JSON.stringify([], null, 2),
            },
          ],
        },
      }

      // Mock the implementation
      const originalHandler = VERSIONS_HANDLERS.version_list
      VERSIONS_HANDLERS.version_list = vi.fn().mockImplementation(() => {
        return Promise.resolve(mockResponse as unknown as ReturnType<typeof originalHandler>)
      })

      // Call the handler
      // @ts-ignore - Ignore type errors for testing purposes
      const response = (await VERSIONS_HANDLERS.version_list(request)) as CloudflareToolResponse

      // Verify response
      verifyToolResponse(response)
      expect(response.toolResult.content[0].text).toBe('[]')

      // Restore original handler
      VERSIONS_HANDLERS.version_list = originalHandler
    })

    it('should handle API errors', async () => {
      // Create mock request
      const request = createMockToolRequest('version_list', {
        scriptName: 'non-existent-service',
      })

      // Create error mock response
      const mockResponse: CloudflareToolResponse = {
        toolResult: {
          isError: true,
          content: [
            {
              type: 'text',
              text: 'Error listing versions: Failed to list versions: Service not found',
            },
          ],
        },
      }

      // Mock the implementation
      const originalHandler = VERSIONS_HANDLERS.version_list
      VERSIONS_HANDLERS.version_list = vi.fn().mockImplementation(() => {
        return Promise.resolve(mockResponse as unknown as ReturnType<typeof originalHandler>)
      })

      // Call the handler
      // @ts-ignore - Ignore type errors for testing purposes
      const response = (await VERSIONS_HANDLERS.version_list(request)) as CloudflareToolResponse

      // Verify response
      verifyToolResponse(response, true)
      expect(response.toolResult.content[0].text).toContain('Error')

      // Restore original handler
      VERSIONS_HANDLERS.version_list = originalHandler
    })
  })

  describe('version_get', () => {
    it('should get version details successfully', async () => {
      // Create mock request
      const request = createMockToolRequest('version_get', {
        scriptName: 'test-service',
        versionId: 'version-abc123',
      })

      // Create successful mock response
      const mockResponse: CloudflareToolResponse = {
        toolResult: {
          isError: false,
          content: [
            {
              type: 'text',
              text: JSON.stringify(mockData.versions.get.result, null, 2),
            },
          ],
        },
      }

      // Mock the implementation
      const originalHandler = VERSIONS_HANDLERS.version_get
      VERSIONS_HANDLERS.version_get = vi.fn().mockImplementation(() => {
        return Promise.resolve(mockResponse as unknown as ReturnType<typeof originalHandler>)
      })

      // Call the handler
      // @ts-ignore - Ignore type errors for testing purposes
      const response = (await VERSIONS_HANDLERS.version_get(request)) as CloudflareToolResponse

      // Verify response
      verifyToolResponse(response)
      expect(response.toolResult.content[0].text).toContain('version-abc123')
      expect(response.toolResult.content[0].text).toContain('user@example.com')
      expect(response.toolResult.content[0].text).toContain('addEventListener')

      // Restore original handler
      VERSIONS_HANDLERS.version_get = originalHandler
    })

    it('should handle API errors', async () => {
      // Create mock request
      const request = createMockToolRequest('version_get', {
        scriptName: 'test-service',
        versionId: 'non-existent-version',
      })

      // Create error mock response
      const mockResponse: CloudflareToolResponse = {
        toolResult: {
          isError: true,
          content: [
            {
              type: 'text',
              text: 'Error getting version: Failed to get version: Version not found',
            },
          ],
        },
      }

      // Mock the implementation
      const originalHandler = VERSIONS_HANDLERS.version_get
      VERSIONS_HANDLERS.version_get = vi.fn().mockImplementation(() => {
        return Promise.resolve(mockResponse as unknown as ReturnType<typeof originalHandler>)
      })

      // Call the handler
      // @ts-ignore - Ignore type errors for testing purposes
      const response = (await VERSIONS_HANDLERS.version_get(request)) as CloudflareToolResponse

      // Verify response
      verifyToolResponse(response, true)
      expect(response.toolResult.content[0].text).toContain('Error')

      // Restore original handler
      VERSIONS_HANDLERS.version_get = originalHandler
    })
  })
})
