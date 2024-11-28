import { config, log } from '../utils/helpers'
import { fetch, FormData } from 'undici'
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

// Interface for Worker bindings
interface WorkerBinding {
  type: 'kv_namespace' | 'r2_bucket' | 'd1_database' | 'service' | 'analytics_engine' | 'queue'
  name: string
  namespace_id?: string // For KV
  bucket_name?: string // For R2
  database_id?: string // For D1
  service?: string // For service bindings
  dataset?: string // For analytics
  queue_name?: string // For queues
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

// Update the WORKER_PUT_TOOL definition
const WORKER_PUT_TOOL: Tool = {
  name: 'worker_put',
  description: 'Create or update a Worker script using Module Syntax with optional bindings and compatibility settings',
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
      bindings: {
        type: 'array',
        description: 'Optional array of resource bindings (KV, R2, D1, etc)',
        items: {
          type: 'object',
          properties: {
            type: {
              type: 'string',
              description: 'Type of binding (kv_namespace, r2_bucket, d1_database, service, analytics_engine, queue)',
              enum: ['kv_namespace', 'r2_bucket', 'd1_database', 'service', 'analytics_engine', 'queue'],
            },
            name: {
              type: 'string',
              description: 'Name of the binding in the Worker code',
            },
            namespace_id: {
              type: 'string',
              description: 'ID of the KV namespace (required for kv_namespace type)',
            },
            bucket_name: {
              type: 'string',
              description: 'Name of the R2 bucket (required for r2_bucket type)',
            },
            database_id: {
              type: 'string',
              description: 'ID of the D1 database (required for d1_database type)',
            },
            service: {
              type: 'string',
              description: 'Name of the service (required for service type)',
            },
            dataset: {
              type: 'string',
              description: 'Name of the analytics dataset (required for analytics_engine type)',
            },
            queue_name: {
              type: 'string',
              description: 'Name of the queue (required for queue type)',
            },
          },
          required: ['type', 'name'],
        },
      },
      compatibility_date: {
        type: 'string',
        description: 'Optional compatibility date for the Worker (e.g., "2024-01-01")',
      },
      compatibility_flags: {
        type: 'array',
        description: 'Optional array of compatibility flags',
        items: {
          type: 'string',
        },
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

// Update the handleWorkerPut function
export async function handleWorkerPut(
  name: string,
  script: string,
  bindings?: WorkerBinding[],
  compatibility_date?: string,
  compatibility_flags?: string[],
) {
  log('Executing worker_put for script:', name)
  const url = `https://api.cloudflare.com/client/v4/accounts/${config.accountId}/workers/scripts/${name}`

  const metadata = {
    main_module: 'worker.js',
    bindings: bindings || [],
    compatibility_date: compatibility_date || '2024-01-01',
    compatibility_flags: compatibility_flags || [],
  }

  // Create form data with metadata and script
  const formData = new FormData()
  formData.set('metadata', JSON.stringify(metadata))
  formData.set(
    'worker.js',
    new File([script], 'worker.js', {
      type: 'application/javascript+module',
    }),
  )

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
    const { name, script, bindings, compatibility_date, compatibility_flags } = request.params.arguments as {
      name: string
      script: string
      bindings?: WorkerBinding[]
      compatibility_date?: string
      compatibility_flags?: string[]
    }
    await handleWorkerPut(name, script, bindings, compatibility_date, compatibility_flags)
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
