#!/usr/bin/env node
import { init } from './init'
import { config, log } from './utils/helpers'
import { main } from './main'
import { getAuthTokens, isAccessTokenExpired, refreshToken } from './utils/wrangler'

// Handle process events
process.on('uncaughtException', (error) => {
  log('Uncaught exception:', error)
})

process.on('unhandledRejection', (error) => {
  log('Unhandled rejection:', error)
})

const [cmd, ...args] = process.argv.slice(2)
if (cmd === 'init') {
  const [accountId, ...rest] = args
  if (rest.length > 0) {
    throw new Error(`Usage: npx @cloudflare/mcp-server-cloudflare-preview init [account_id]`)
  }

  init(accountId)
} else if (cmd === 'run') {
  const [accountId, ...rest] = args
  if (!accountId && !config.accountId) {
    throw new Error(`Missing account ID. Usage: npx @cloudflare/mcp-server-cloudflare-preview run [account_id]`)
  }
  if (rest.length > 0) {
    throw new Error(`Too many arguments. Usage: npx @cloudflare/mcp-server-cloudflare-preview run [account_id]`)
  }
  config.accountId = accountId

  if (!config.accountId || !config.apiToken) {
    getAuthTokens()

    if (isAccessTokenExpired())
      if (await refreshToken()) {
        console.log('Successfully refreshed access token')
      } else {
        console.log('Failed to refresh access token')
      }
  }

  log(
    'Config loaded:',
    JSON.stringify({
      accountId: config.accountId ? '✓' : '✗',
      apiToken: config.apiToken ? '✓' : '✗',
    }),
  )

  // Start the server
  main()
} else {
  throw new Error(`Unknown command: ${cmd}. Expected 'init' or 'run'.`)
}
