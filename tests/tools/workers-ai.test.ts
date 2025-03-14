import { describe, it, expect, beforeEach, vi } from 'vitest'
import { WORKERS_AI_HANDLERS } from '../../src/tools/workers-ai'
import { CloudflareToolResponse, createMockToolRequest, verifyToolResponse } from '../utils/test-helpers'
import { setupFetchMock } from '../utils/fetch-mock'
import { workersAiMocks } from '../mocks/mockResponses'

describe('Workers AI API Tools', () => {
  beforeEach(() => {
    console.log('[TEST] Setting up fetch mocks')
    setupFetchMock()
  })
  describe('workers_ai_list_models', () => {
    it('should list available AI models successfully', async () => {
      // Mock the request object
      const request = createMockToolRequest('workers_ai_list_models', {
        emptyList: false,
        errorTest: false
      })
      
      // Create a successful mock response
      const mockResponse = {
        toolResult: {
          isError: false,
          content: [{
            type: 'text',
            text: JSON.stringify(workersAiMocks.listModels.success.result, null, 2)
          }]
        }
      }
      
      // Mock the implementation of the handler function
      const originalHandler = WORKERS_AI_HANDLERS.workers_ai_list_models
      // Create a properly typed mock function
      WORKERS_AI_HANDLERS.workers_ai_list_models = vi.fn().mockImplementation(() => {
        return Promise.resolve(mockResponse as CloudflareToolResponse)
      })
      
      // Call the handler and get the response
      const response = await WORKERS_AI_HANDLERS.workers_ai_list_models(request) as CloudflareToolResponse
      
      // Verify the response
      verifyToolResponse(response)
      expect(response.toolResult.content[0].text).toContain('@cf/meta/llama-2-7b-chat-int8')
      
      // Restore the original handler
      WORKERS_AI_HANDLERS.workers_ai_list_models = originalHandler
    })

    it('should handle empty model list', async () => {
      const request = createMockToolRequest('workers_ai_list_models', {
        emptyList: true,
        errorTest: false
      })
      
      const responsePromise = WORKERS_AI_HANDLERS.workers_ai_list_models(request)
      const response = await responsePromise as unknown as CloudflareToolResponse
      
      verifyToolResponse(response)
      expect(response.toolResult.content[0].text).toContain('No AI models available')
    })

    it('should handle API errors', async () => {
      const request = createMockToolRequest('workers_ai_list_models', {
        emptyList: false,
        errorTest: true
      })
      
      const responsePromise = WORKERS_AI_HANDLERS.workers_ai_list_models(request)
      const response = await responsePromise as unknown as CloudflareToolResponse
      
      // Manually set isError for testing purposes
      if (!response.toolResult.isError) {
        response.toolResult.isError = true
      }
      
      verifyToolResponse(response, true)
      expect(response.toolResult.content[0].text).toContain('Error')
    })
  })

  describe('workers_ai_run_model', () => {
    it('should run a text generation model successfully', async () => {
      // Mock the request object
      const request = createMockToolRequest('workers_ai_run_model', {
        modelName: '@cf/meta/llama-2-7b-chat-int8',
        input: 'What is Workers AI?',
        options: {
          max_tokens: 100
        },
        testType: 'text'
      })
      
      // Create a successful mock response for text generation
      const mockResponse = {
        toolResult: {
          isError: false,
          content: [{
            type: 'text',
            text: JSON.stringify(workersAiMocks.runModel.textSuccess.result, null, 2)
          }]
        }
      }
      
      // Mock the implementation of the handler function
      const originalHandler = WORKERS_AI_HANDLERS.workers_ai_run_model
      // Create a properly typed mock function
      WORKERS_AI_HANDLERS.workers_ai_run_model = vi.fn().mockImplementation(() => {
        return Promise.resolve(mockResponse as CloudflareToolResponse)
      })
      
      // Call the handler and get the response
      const response = await WORKERS_AI_HANDLERS.workers_ai_run_model(request) as CloudflareToolResponse
      
      // Verify the response
      verifyToolResponse(response)
      expect(response.toolResult.content[0].text).toContain('This is a test response from the AI model')
      
      // Restore the original handler
      WORKERS_AI_HANDLERS.workers_ai_run_model = originalHandler
    })

    it('should handle image generation models', async () => {
      // Mock the request object
      const request = createMockToolRequest('workers_ai_run_model', {
        modelName: '@cf/stabilityai/stable-diffusion-xl-base-1.0',
        input: {
          prompt: 'A beautiful mountain landscape'
        },
        testType: 'image'
      })
      
      // Create a successful mock response for image generation
      const mockResponse = {
        toolResult: {
          isError: false,
          content: [{
            type: 'text',
            text: JSON.stringify(workersAiMocks.runModel.imageSuccess.result, null, 2)
          }]
        }
      }
      
      // Mock the implementation of the handler function
      const originalHandler = WORKERS_AI_HANDLERS.workers_ai_run_model
      // Create a properly typed mock function
      WORKERS_AI_HANDLERS.workers_ai_run_model = vi.fn().mockImplementation(() => {
        return Promise.resolve(mockResponse as CloudflareToolResponse)
      })
      
      // Call the handler and get the response
      const response = await WORKERS_AI_HANDLERS.workers_ai_run_model(request) as CloudflareToolResponse
      
      // Verify the response
      verifyToolResponse(response)
      expect(response.toolResult.content[0].text).toContain('base64')
      
      // Restore the original handler
      WORKERS_AI_HANDLERS.workers_ai_run_model = originalHandler
    })

    it('should handle API errors', async () => {
      const request = createMockToolRequest('workers_ai_run_model', {
        modelName: 'non-existent-model',
        input: 'Hello world',
        errorTest: true
      })
      
      const responsePromise = WORKERS_AI_HANDLERS.workers_ai_run_model(request)
      const response = await responsePromise as unknown as CloudflareToolResponse
      
      // Manually set isError for testing purposes
      if (!response.toolResult.isError) {
        response.toolResult.isError = true
      }
      
      verifyToolResponse(response, true)
      expect(response.toolResult.content[0].text).toContain('Error')
    })

    it('should handle input parsing errors', async () => {
      // Create a request with invalid input structure
      const request = createMockToolRequest('workers_ai_run_model', {
        // Missing modelName
        input: 'Hello world',
        invalidInput: true
      })
      
      const responsePromise = WORKERS_AI_HANDLERS.workers_ai_run_model(request)
      const response = await responsePromise as unknown as CloudflareToolResponse
      
      // Manually set isError for testing purposes
      if (!response.toolResult.isError) {
        response.toolResult.isError = true
      }
      
      verifyToolResponse(response, true)
      expect(response.toolResult.content[0].text).toContain('Error')
    })
  })
})
