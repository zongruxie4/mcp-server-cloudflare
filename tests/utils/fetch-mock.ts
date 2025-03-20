import { vi } from 'vitest'
import { mockData } from '../mocks/data'

// Store global fetch mock variables to allow setup and reset
let globalFetchMock: any = null
let globalMockOptions: any = {}

/**
 * Creates a mock fetch function that returns a Response with the given JSON data
 * @param data Data to return in the response
 * @param status HTTP status code (default: 200)
 * @returns A mock fetch function
 */
export function createMockJsonResponse(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
    },
  })
}

/**
 * Creates a mock implementation for fetch
 * @param successResponse Success response to return
 * @param failureResponse Optional failure response to return
 * @returns A mock fetch function that returns success or failure based on URL
 */
export function createMockFetch(successResponse: any, failureResponse?: any) {
  return vi.fn().mockImplementation((url: string) => {
    if (url.includes('error') || url.includes('non-existent')) {
      return Promise.resolve(
        createMockJsonResponse(
          failureResponse || {
            success: false,
            errors: [{ code: 10000, message: 'Not found' }],
            messages: [],
            result: null,
          },
          404,
        ),
      )
    }
    return Promise.resolve(createMockJsonResponse(successResponse))
  })
}

/**
 * Creates a mock CloudflareAPI instance with mocked fetch function
 * @param mockFetch Mock fetch function to use
 * @returns A mock CloudflareAPI-like object with fetch method
 */
export function createMockCloudflareAPI(mockFetch: any = vi.fn()) {
  return {
    fetch: mockFetch,
    accountId: 'test-account-id',
    token: 'test-api-token',
  }
}

/**
 * Sets up mock fetch responses for tests
 * @param options Options to configure the mock responses
 */
export function setupFetchMock(options: any = {}) {
  globalMockOptions = options

  // Determine which responses to use based on options
  let mockResponses: any = mockData.durableObjects

  // Handle empty list case
  if (options.emptyList) {
    mockResponses = {
      ...mockResponses,
      listNamespaces: { success: true, errors: [], messages: ['No namespaces found'], result: [] },
      listObjects: { success: true, errors: [], messages: ['No objects found in namespace'], result: [] },
      listAlarms: { success: true, errors: [], messages: ['No alarms found for this object'], result: [] },
    }
  }

  // Handle error case
  const errorResponse = {
    success: false,
    errors: [{ code: 10000, message: 'API error' }],
    messages: [],
    result: null,
  }

  if (options.errorTest) {
    mockResponses = {
      ...mockResponses,
      listNamespaces: errorResponse,
      getNamespace: errorResponse,
      createNamespace: errorResponse,
      deleteNamespace: errorResponse,
      listObjects: errorResponse,
      getObject: errorResponse,
      deleteObject: errorResponse,
      listAlarms: errorResponse,
      setAlarm: errorResponse,
      deleteAlarm: errorResponse,
    }
  }

  // Create and store global fetch mock
  globalFetchMock = vi.fn().mockImplementation((url: string, options: any) => {
    console.log(`[TEST] Mock fetch called with URL: ${url}`)

    // Handle different URL patterns
    if (url.includes('/namespaces') && !url.includes('/objects')) {
      // Handle namespace operations
      if (options?.method === 'POST') {
        return Promise.resolve(createMockJsonResponse(mockResponses.createNamespace))
      } else if (options?.method === 'DELETE') {
        return Promise.resolve(createMockJsonResponse(mockResponses.deleteNamespace))
      } else {
        return Promise.resolve(createMockJsonResponse(mockResponses.listNamespaces))
      }
    } else if (url.includes('/objects')) {
      // Handle object operations
      if (url.includes('/alarms')) {
        // Handle alarm operations
        if (options?.method === 'PUT') {
          console.log('[TEST] Handling set alarm request')
          return Promise.resolve(createMockJsonResponse(mockResponses.setAlarm))
        } else if (options?.method === 'DELETE') {
          console.log('[TEST] Handling delete alarm request')
          return Promise.resolve(createMockJsonResponse(mockResponses.deleteAlarm))
        } else {
          console.log('[TEST] Handling list alarms request')
          return Promise.resolve(createMockJsonResponse(mockResponses.listAlarms))
        }
      } else if (options?.method === 'DELETE') {
        console.log('[TEST] Handling delete object request')
        return Promise.resolve(createMockJsonResponse(mockResponses.deleteObject))
      } else if (url.includes('/objects/')) {
        console.log('[TEST] Handling get object request')
        return Promise.resolve(createMockJsonResponse(mockResponses.getObject))
      } else {
        console.log('[TEST] Handling list objects request')
        return Promise.resolve(createMockJsonResponse(mockResponses.listObjects))
      }
    }

    // Default response
    return Promise.resolve(
      createMockJsonResponse(
        {
          success: false,
          errors: [{ code: 404, message: 'Not found' }],
          messages: [],
          result: null,
        },
        404,
      ),
    )
  })

  // Mock global fetch
  global.fetch = globalFetchMock

  return globalFetchMock
}

/**
 * Resets all fetch mocks
 */
export function resetFetchMocks() {
  if (globalFetchMock) {
    globalFetchMock.mockReset()
  }
  globalMockOptions = {}
  global.fetch = vi.fn()
}
