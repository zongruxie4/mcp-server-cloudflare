import { afterEach, vi } from 'vitest'
import dotenv from 'dotenv'

// Load environment variables from .env file for testing
dotenv.config({ path: '.env.test' })

// Override Cloudflare config values for testing
process.env.CLOUDFLARE_ACCOUNT_ID = 'test-account-id'
process.env.CLOUDFLARE_API_TOKEN = 'test-api-token'

// Reset mocks after each test
afterEach(() => {
  vi.clearAllMocks()
})
