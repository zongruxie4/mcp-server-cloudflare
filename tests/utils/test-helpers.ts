import { vi, expect } from 'vitest'

/**
 * Interface for content items in the tool result
 */
export interface ToolResultContentItem {
  type: string
  text: string
}

/**
 * Interface for the tool result structure
 */
export interface CloudflareToolResult {
  isError?: boolean
  content: ToolResultContentItem[]
}

/**
 * Interface for the complete tool response
 */
export interface CloudflareToolResponse {
  toolResult: CloudflareToolResult
}

/**
 * Custom type for our test mock request structure
 */
export interface MockCallToolRequest {
  jsonrpc: string
  id: string
  method: 'tools/call'
  params: {
    name: string
    input: string
    _meta?: any
    arguments?: Record<string, any>
  }
}

/**
 * Creates a mock MCP tool request
 * @param toolName Name of the tool to call
 * @param input Input parameters for the tool
 * @returns A mock CallToolRequest object
 */
export function createMockToolRequest(toolName: string, input: Record<string, any> = {}): MockCallToolRequest {
  return {
    jsonrpc: '2.0',
    id: 'test-id',
    method: 'tools/call',
    params: {
      name: toolName,
      input: JSON.stringify(input),
    },
  }
}

/**
 * Creates a mock API error response
 * @param message Error message
 * @param code HTTP status code (default: 400)
 * @returns A mock error response object
 */
export function createErrorResponse(message: string, code = 400) {
  return {
    success: false,
    errors: [{ message, code }],
    messages: [],
    result: null,
  }
}

/**
 * Utility to spy on console logging
 */
export function mockConsoleOutput() {
  // Create console spies
  const consoleSpy = {
    log: vi.spyOn(console, 'log').mockImplementation(() => {}),
    error: vi.spyOn(console, 'error').mockImplementation(() => {}),
    warn: vi.spyOn(console, 'warn').mockImplementation(() => {}),
    info: vi.spyOn(console, 'info').mockImplementation(() => {}),
  }

  return consoleSpy
}

/**
 * Verify the structure of a tool response
 * @param response The response to verify
 * @param isError Whether the response should be an error
 * @param skipIsErrorCheck Whether to skip checking the isError property
 */
export function verifyToolResponse(response: any, isError = false, skipIsErrorCheck = false): void {
  expect(response).toHaveProperty('toolResult')

  // Type assertion - assume this structure for testing purposes
  const toolResult = response.toolResult as CloudflareToolResult

  expect(toolResult).toHaveProperty('content')
  expect(Array.isArray(toolResult.content)).toBe(true)

  // Only check isError if we're not skipping that check
  if (!skipIsErrorCheck) {
    if (isError) {
      expect(toolResult.isError).toBe(true)
    } else {
      expect(toolResult.isError).toBeFalsy()
    }
  }
}
