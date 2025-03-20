import { Tool } from '@modelcontextprotocol/sdk/types.js'
import { fetch } from 'undici'
import { config, log } from '../utils/helpers'
import { ToolHandlers } from '../utils/types'

// Wrangler.toml tool definitions
const WRANGLER_CONFIG_GET_TOOL: Tool = {
  name: 'wrangler_config_get',
  description: 'Get the wrangler.toml configuration',
  inputSchema: {
    type: 'object',
    properties: {
      scriptName: {
        type: 'string',
        description: 'The name of the Worker script',
      },
    },
    required: ['scriptName'],
  },
}

const WRANGLER_CONFIG_UPDATE_TOOL: Tool = {
  name: 'wrangler_config_update',
  description: 'Update the wrangler.toml configuration',
  inputSchema: {
    type: 'object',
    properties: {
      scriptName: {
        type: 'string',
        description: 'The name of the Worker script',
      },
      config: {
        type: 'string',
        description: 'The wrangler.toml configuration content',
      },
    },
    required: ['scriptName', 'config'],
  },
}

export const WRANGLER_TOOLS = [WRANGLER_CONFIG_GET_TOOL, WRANGLER_CONFIG_UPDATE_TOOL]

// Handler functions for Wrangler.toml operations
async function handleWranglerConfigGet(scriptName: string) {
  log('Executing wrangler_config_get for script:', scriptName)
  const url = `https://api.cloudflare.com/client/v4/accounts/${config.accountId}/workers/scripts/${scriptName}/config`

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${config.apiToken}`,
    },
  })

  if (!response.ok) {
    const error = await response.text()
    log('Wrangler config get error:', error)
    throw new Error(`Failed to get wrangler.toml configuration: ${error}`)
  }

  const data = (await response.json()) as { result: any; success: boolean }
  log('Wrangler config get success:', data)
  return data.result
}

async function handleWranglerConfigUpdate(scriptName: string, configContent: string) {
  log('Executing wrangler_config_update for script:', scriptName)
  const url = `https://api.cloudflare.com/client/v4/accounts/${config.accountId}/workers/scripts/${scriptName}/config`

  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${config.apiToken}`,
      'Content-Type': 'application/toml',
    },
    body: configContent,
  })

  if (!response.ok) {
    const error = await response.text()
    log('Wrangler config update error:', error)
    throw new Error(`Failed to update wrangler.toml configuration: ${error}`)
  }

  const data = (await response.json()) as { result: any; success: boolean }
  log('Wrangler config update success:', data)
  return data.result
}

// Export handlers
export const WRANGLER_HANDLERS: ToolHandlers = {
  wrangler_config_get: async (request) => {
    const { scriptName } = request.params.input as { scriptName: string }
    const result = await handleWranglerConfigGet(scriptName)
    return {
      toolResult: {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      },
    }
  },
  wrangler_config_update: async (request) => {
    const { scriptName, config } = request.params.input as { scriptName: string; config: string }
    const result = await handleWranglerConfigUpdate(scriptName, config)
    return {
      toolResult: {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      },
    }
  },
}
