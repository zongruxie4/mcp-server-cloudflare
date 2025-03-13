import { describe, it, expect } from 'vitest'
import { SECRETS_HANDLERS } from '../../src/tools/secrets'
import { createMockToolRequest, verifyToolResponse } from '../utils/test-helpers'

describe('Secrets API Tools', () => {

  describe('secrets_list', () => {
    it('should list secrets successfully', async () => {
      const request = createMockToolRequest('secrets_list', {
        scriptName: 'test-script',
        envName: 'production',
        emptyList: false,
        errorTest: false
      })
      // @ts-ignore - Ignore type errors for testing purposes
      const response = await SECRETS_HANDLERS.secrets_list(request)
      
      verifyToolResponse(response)
      // @ts-ignore - We know this structure exists in our tests
      expect(response.toolResult.content[0].text).toContain('SECRET_KEY_1')
      // @ts-ignore - We know this structure exists in our tests
      expect(response.toolResult.content[0].text).toContain('SECRET_KEY_2')
    })

    it('should handle empty secrets list', async () => {
      const request = createMockToolRequest('secrets_list', {
        scriptName: 'test-script',
        envName: 'production',
        emptyList: true,
        errorTest: false
      })
      // @ts-ignore - Ignore type errors for testing purposes
      const response = await SECRETS_HANDLERS.secrets_list(request)
      
      verifyToolResponse(response)
      // @ts-ignore - We know this structure exists in our tests
      expect(response.toolResult.content[0].text).toContain('No secrets found')
    })

    it('should handle API errors', async () => {
      const request = createMockToolRequest('secrets_list', {
        scriptName: 'non-existent-script',
        envName: 'production',
        emptyList: false,
        errorTest: true
      })
      // @ts-ignore - Ignore type errors for testing purposes
      const response = await SECRETS_HANDLERS.secrets_list(request)
      
      verifyToolResponse(response, true)
      // @ts-ignore - We know this structure exists in our tests
      expect(response.toolResult.content[0].text).toContain('Error')
    })
  })

  describe('secrets_create', () => {
    it('should create a secret successfully', async () => {
      const request = createMockToolRequest('secrets_create', {
        scriptName: 'test-script',
        envName: 'production',
        secretName: 'SECRET_KEY',
        secretValue: 'secret-value',
        errorTest: false
      })
      // @ts-ignore - Ignore type errors for testing purposes
      const response = await SECRETS_HANDLERS.secrets_create(request)
      
      verifyToolResponse(response)
      // @ts-ignore - We know this structure exists in our tests
      expect(response.toolResult.content[0].text).toContain('Secret created successfully')
      // @ts-ignore - We know this structure exists in our tests
      expect(response.toolResult.content[0].text).toContain('SECRET_KEY')
    })

    it('should handle API errors', async () => {
      const request = createMockToolRequest('secrets_create', {
        scriptName: 'test-script',
        envName: 'production',
        secretName: 'INVALID-SECRET-NAME',
        secretValue: 'secret-value',
        errorTest: true
      })
      // @ts-ignore - Ignore type errors for testing purposes
      const response = await SECRETS_HANDLERS.secrets_create(request)
      
      verifyToolResponse(response, true)
      // @ts-ignore - We know this structure exists in our tests
      expect(response.toolResult.content[0].text).toContain('Error')
    })
  })

  describe('secrets_delete', () => {
    it('should delete a secret successfully', async () => {
      const request = createMockToolRequest('secrets_delete', {
        scriptName: 'test-script',
        envName: 'production',
        secretName: 'SECRET_KEY',
        errorTest: false
      })
      // @ts-ignore - Ignore type errors for testing purposes
      const response = await SECRETS_HANDLERS.secrets_delete(request)
      
      verifyToolResponse(response)
      // @ts-ignore - We know this structure exists in our tests
      expect(response.toolResult.content[0].text).toContain('Secret deleted successfully')
    })

    it('should handle API errors', async () => {
      const request = createMockToolRequest('secrets_delete', {
        scriptName: 'test-script',
        envName: 'production',
        secretName: 'NON_EXISTENT_SECRET',
        errorTest: true
      })
      // @ts-ignore - Ignore type errors for testing purposes
      const response = await SECRETS_HANDLERS.secrets_delete(request)
      
      verifyToolResponse(response, true)
      // @ts-ignore - We know this structure exists in our tests
      expect(response.toolResult.content[0].text).toContain('Error')
    })
  })
})
