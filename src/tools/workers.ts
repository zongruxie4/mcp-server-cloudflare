import { config, log } from '../utils/helpers'
import fetch from 'node-fetch'
import { ToolHandlers } from '../utils/types'
import { Tool } from '@modelcontextprotocol/sdk/types.js'

interface CloudflareListResponse {
  result: Array<{
    name: string
    expiration?: number
  }>
  success: boolean
  errors: any[]
  messages: any[]
}

interface CloudflareWorkerListResponse {
  result: Array<{
    id: string
    name: string
    script?: string
    modified_on?: string
  }>
  success: boolean
  errors: any[]
  messages: any[]
}

interface CloudflareWorkerResponse {
  result: {
    id: string
    script: string
    modified_on: string
  }
  success: boolean
  errors: any[]
  messages: any[]
}

// New Worker Tool definitions
const WORKER_LIST_TOOL: Tool = {
  name: 'worker_list',
  description: 'List all Workers in your account',
  inputSchema: {
    type: 'object',
    properties: {},
  },
}
const WORKER_GET_TOOL: Tool = {
  name: 'worker_get',
  description: "Get a Worker's script content",
  inputSchema: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        description: 'Name of the Worker script',
      },
    },
    required: ['name'],
  },
}
const WORKER_PUT_TOOL: Tool = {
  name: 'worker_put',
  description: 'Create or update a Worker script',
  inputSchema: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        description: 'Name of the Worker script',
      },
      script: {
        type: 'string',
        description: 'The Worker script content',
      },
    },
    required: ['name', 'script'],
  },
}
const WORKER_DELETE_TOOL: Tool = {
  name: 'worker_delete',
  description: 'Delete a Worker script',
  inputSchema: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        description: 'Name of the Worker script',
      },
    },
    required: ['name'],
  },
}
export const WORKER_TOOLS = [WORKER_LIST_TOOL, WORKER_GET_TOOL, WORKER_PUT_TOOL, WORKER_DELETE_TOOL]

export async function handleWorkerList() {
  log('Executing worker_list')
  const url = `https://api.cloudflare.com/client/v4/accounts/${config.accountId}/workers/scripts`

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${config.apiToken}` },
  })

  log('Worker list response status:', response.status)

  if (!response.ok) {
    const error = await response.text()
    log('Worker list error:', error)
    throw new Error(`Failed to list workers: ${error}`)
  }

  const data = (await response.json()) as CloudflareWorkerListResponse // Add type assertion here
  log('Worker list success:', data)
  return data.result
}

export async function handleWorkerGet(name: string) {
  log('Executing worker_get for script:', name)
  const url = `https://api.cloudflare.com/client/v4/accounts/${config.accountId}/workers/scripts/${name}`

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${config.apiToken}` },
  })

  log('Worker get response status:', response.status)

  if (!response.ok) {
    const error = await response.text()
    log('Worker get error:', error)
    throw new Error(`Failed to get worker: ${error}`)
  }

  const data = await response.text()
  return data
}

export async function handleWorkerPut(name: string, script: string) {
  log('Executing worker_put for script:', name)
  const url = `https://api.cloudflare.com/client/v4/accounts/${config.accountId}/workers/scripts/${name}`

  const metadata = {
    body_part: 'script',
    'content-type': 'application/javascript',
  }

  // Create form data with metadata and script
  const formData = new FormData()
  formData.append('metadata', JSON.stringify(metadata))
  formData.append('script', script)

  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${config.apiToken}`,
    },
    body: formData,
  })

  log('Worker put response status:', response.status)

  if (!response.ok) {
    const error = await response.text()
    log('Worker put error:', error)
    throw new Error(`Failed to put worker: ${error}`)
  }

  return 'Success'
}

export async function handleWorkerDelete(name: string) {
  log('Executing worker_delete for script:', name)
  const url = `https://api.cloudflare.com/client/v4/accounts/${config.accountId}/workers/scripts/${name}`

  const response = await fetch(url, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${config.apiToken}` },
  })

  log('Worker delete response status:', response.status)

  if (!response.ok) {
    const error = await response.text()
    log('Worker delete error:', error)
    throw new Error(`Failed to delete worker: ${error}`)
  }

  return 'Success'
}

export const WORKERS_HANDLERS: ToolHandlers = {
  worker_list: async (request) => {
    const results = await handleWorkerList()
    return {
      toolResult: {
        content: [
          {
            type: 'text',
            text: JSON.stringify(results, null, 2),
          },
        ],
      },
    }
  },

  worker_get: async (request) => {
    const { name } = request.params.arguments as { name: string }
    const script = await handleWorkerGet(name)
    return {
      toolResult: {
        content: [
          {
            type: 'text',
            text: script,
          },
        ],
      },
    }
  },

  worker_put: async (request) => {
    const { name, script } = request.params.arguments as {
      name: string
      script: string
    }
    await handleWorkerPut(name, script)
    return {
      toolResult: {
        content: [
          {
            type: 'text',
            text: `Successfully deployed worker: ${name}`,
          },
        ],
      },
    }
  },

  worker_delete: async (request) => {
    const { name } = request.params.arguments as { name: string }
    await handleWorkerDelete(name)
    return {
      toolResult: {
        content: [
          {
            type: 'text',
            text: `Successfully deleted worker: ${name}`,
          },
        ],
      },
    }
  },
}
