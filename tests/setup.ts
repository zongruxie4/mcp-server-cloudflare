import { beforeAll, afterAll, afterEach, vi } from 'vitest'
import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'
import { mockHandlers } from './mocks/handlers'
import dotenv from 'dotenv'

// Load environment variables from .env file for testing
dotenv.config({ path: '.env.test' })

// Override Cloudflare config values for testing
process.env.CLOUDFLARE_ACCOUNT_ID = 'test-account-id'
process.env.CLOUDFLARE_API_TOKEN = 'test-api-token'

// Setup MSW server with mock handlers
export const server = setupServer(...mockHandlers)

// Start server before all tests
// More aggressive debugging configuration for MSW
beforeAll(() => {
  // Enable network request debugging
  server.listen({ 
    onUnhandledRequest: 'warn',
  })
  
  // Log all requests that pass through MSW
  server.events.on('request:start', ({ request }) => {
    console.log(`[MSW] Request started: ${request.method} ${request.url}`)
  })
  
  server.events.on('request:match', ({ request }) => {
    console.log(`[MSW] Request matched: ${request.method} ${request.url}`)
  })
  
  server.events.on('request:unhandled', ({ request }) => {
    console.log(`[MSW] Request not handled: ${request.method} ${request.url}`)
  })
})

// Reset handlers after each test
afterEach(() => {
  server.resetHandlers()
  vi.clearAllMocks()
})

// Close server after all tests
afterAll(() => server.close())
