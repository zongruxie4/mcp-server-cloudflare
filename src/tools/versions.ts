import { Tool } from '@modelcontextprotocol/sdk/types.js'
import { fetch } from 'undici'
import { config, log } from '../utils/helpers'
import { ToolHandlers } from '../utils/types'

// Version Management tool definitions
const VERSION_LIST_TOOL: Tool = {
  name: 'version_list',
  description: 'List versions of a Worker',
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

const VERSION_GET_TOOL: Tool = {
  name: 'version_get',
  description: 'Get a specific version of a Worker',
  inputSchema: {
    type: 'object',
    properties: {
      scriptName: {
        type: 'string',
        description: 'The name of the Worker script',
      },
      versionId: {
        type: 'string',
        description: 'ID of the version to get',
      },
    },
    required: ['scriptName', 'versionId'],
  },
}

const VERSION_ROLLBACK_TOOL: Tool = {
  name: 'version_rollback',
  description: 'Rollback to a previous version',
  inputSchema: {
    type: 'object',
    properties: {
      scriptName: {
        type: 'string',
        description: 'The name of the Worker script',
      },
      versionId: {
        type: 'string',
        description: 'ID of the version to rollback to',
      },
    },
    required: ['scriptName', 'versionId'],
  },
}

export const VERSIONS_TOOLS = [VERSION_LIST_TOOL, VERSION_GET_TOOL, VERSION_ROLLBACK_TOOL]

// Handler functions for Version Management operations
async function handleVersionList(scriptName: string) {
  log('Executing version_list for script:', scriptName)
  const url = `https://api.cloudflare.com/client/v4/accounts/${config.accountId}/workers/scripts/${scriptName}/versions`

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${config.apiToken}`,
    },
  })

  if (!response.ok) {
    const error = await response.text()
    log('Version list error:', error)
    throw new Error(`Failed to list versions: ${error}`)
  }

  const data = (await response.json()) as { result: any; success: boolean }
  log('Version list success:', data)
  return data.result
}

async function handleVersionGet(scriptName: string, versionId: string) {
  log('Executing version_get for script:', scriptName, 'version:', versionId)
  const url = `https://api.cloudflare.com/client/v4/accounts/${config.accountId}/workers/scripts/${scriptName}/versions/${versionId}`

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${config.apiToken}`,
    },
  })

  if (!response.ok) {
    const error = await response.text()
    log('Version get error:', error)
    throw new Error(`Failed to get version: ${error}`)
  }

  const data = (await response.json()) as { result: any; success: boolean }
  log('Version get success:', data)
  return data.result
}

async function handleVersionRollback(scriptName: string, versionId: string) {
  log('Executing version_rollback for script:', scriptName, 'to version:', versionId)
  const url = `https://api.cloudflare.com/client/v4/accounts/${config.accountId}/workers/scripts/${scriptName}/rollback`

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.apiToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      version_id: versionId,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    log('Version rollback error:', error)
    throw new Error(`Failed to rollback to version: ${error}`)
  }

  const data = (await response.json()) as { result: any; success: boolean }
  log('Version rollback success:', data)
  return data.result
}

// Export handlers
export const VERSIONS_HANDLERS: ToolHandlers = {
  version_list: async (request) => {
    const { scriptName } = request.params.input as { scriptName: string }
    const result = await handleVersionList(scriptName)
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
  version_get: async (request) => {
    const { scriptName, versionId } = request.params.input as { scriptName: string; versionId: string }
    const result = await handleVersionGet(scriptName, versionId)
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
  version_rollback: async (request) => {
    const { scriptName, versionId } = request.params.input as { scriptName: string; versionId: string }
    const result = await handleVersionRollback(scriptName, versionId)
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
