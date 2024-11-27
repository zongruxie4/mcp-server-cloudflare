import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { CallToolRequestSchema, ListToolsRequestSchema, Tool } from '@modelcontextprotocol/sdk/types.js'
import fetch from 'node-fetch'
import { config, log } from './utils/helpers'

// Types for Cloudflare responses

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

const WORKER_TOOLS = [WORKER_LIST_TOOL, WORKER_GET_TOOL, WORKER_PUT_TOOL, WORKER_DELETE_TOOL]

// Combine all tools

interface CloudflareListResponse {
  result: Array<{
    name: string
    expiration?: number
  }>
  success: boolean
  errors: any[]
  messages: any[]
}

const ANALYTICS_GET_TOOL: Tool = {
  name: 'analytics_get',
  description: 'Get analytics data from Cloudflare',
  inputSchema: {
    type: 'object',
    properties: {
      zoneId: {
        type: 'string',
        description: 'The zone ID to get analytics for',
      },
      since: {
        type: 'string',
        description: 'Start time for analytics (ISO string)',
      },
      until: {
        type: 'string',
        description: 'End time for analytics (ISO string)',
      },
    },
    required: ['zoneId'],
  },
}

// Add the new KV list namespaces tool definition
const GET_KVS_TOOL: Tool = {
  name: 'get_kvs',
  description: 'List KV namespaces in your account',
  inputSchema: {
    type: 'object',
    properties: {},
  },
}

// Modify existing KV tool definitions to include namespaceId
const KV_GET_TOOL: Tool = {
  name: 'kv_get',
  description: 'Get a value from Cloudflare KV store',
  inputSchema: {
    type: 'object',
    properties: {
      namespaceId: {
        type: 'string',
        description: 'The KV namespace ID',
      },
      key: {
        type: 'string',
        description: 'The key to retrieve',
      },
    },
    required: ['namespaceId', 'key'],
  },
}

const KV_PUT_TOOL: Tool = {
  name: 'kv_put',
  description: 'Put a value into Cloudflare KV store',
  inputSchema: {
    type: 'object',
    properties: {
      namespaceId: {
        type: 'string',
        description: 'The KV namespace ID',
      },
      key: {
        type: 'string',
        description: 'The key to store',
      },
      value: {
        type: 'string',
        description: 'The value to store',
      },
      expirationTtl: {
        type: 'number',
        description: 'Optional expiration time in seconds',
      },
    },
    required: ['namespaceId', 'key', 'value'],
  },
}

const KV_DELETE_TOOL: Tool = {
  name: 'kv_delete',
  description: 'Delete a key from Cloudflare KV store',
  inputSchema: {
    type: 'object',
    properties: {
      namespaceId: {
        type: 'string',
        description: 'The KV namespace ID',
      },
      key: {
        type: 'string',
        description: 'The key to delete',
      },
    },
    required: ['namespaceId', 'key'],
  },
}

const KV_LIST_TOOL: Tool = {
  name: 'kv_list',
  description: 'List keys in Cloudflare KV store',
  inputSchema: {
    type: 'object',
    properties: {
      namespaceId: {
        type: 'string',
        description: 'The KV namespace ID',
      },
      prefix: {
        type: 'string',
        description: 'Optional prefix to filter keys',
      },
      limit: {
        type: 'number',
        description: 'Maximum number of keys to return',
      },
    },
    required: ['namespaceId'],
  },
}

// Add R2 tool definitions
const R2_LIST_BUCKETS_TOOL: Tool = {
  name: 'r2_list_buckets',
  description: 'List all R2 buckets in your account',
  inputSchema: {
    type: 'object',
    properties: {},
  },
}

const R2_CREATE_BUCKET_TOOL: Tool = {
  name: 'r2_create_bucket',
  description: 'Create a new R2 bucket',
  inputSchema: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        description: 'Name of the bucket to create',
      },
    },
    required: ['name'],
  },
}

const R2_DELETE_BUCKET_TOOL: Tool = {
  name: 'r2_delete_bucket',
  description: 'Delete an R2 bucket',
  inputSchema: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        description: 'Name of the bucket to delete',
      },
    },
    required: ['name'],
  },
}

const R2_LIST_OBJECTS_TOOL: Tool = {
  name: 'r2_list_objects',
  description: 'List objects in an R2 bucket',
  inputSchema: {
    type: 'object',
    properties: {
      bucket: {
        type: 'string',
        description: 'Name of the bucket',
      },
      prefix: {
        type: 'string',
        description: 'Optional prefix to filter objects',
      },
      delimiter: {
        type: 'string',
        description: 'Optional delimiter for hierarchical listing',
      },
      limit: {
        type: 'number',
        description: 'Maximum number of objects to return',
      },
    },
    required: ['bucket'],
  },
}

const R2_GET_OBJECT_TOOL: Tool = {
  name: 'r2_get_object',
  description: 'Get an object from an R2 bucket',
  inputSchema: {
    type: 'object',
    properties: {
      bucket: {
        type: 'string',
        description: 'Name of the bucket',
      },
      key: {
        type: 'string',
        description: 'Key of the object to get',
      },
    },
    required: ['bucket', 'key'],
  },
}

const R2_PUT_OBJECT_TOOL: Tool = {
  name: 'r2_put_object',
  description: 'Put an object into an R2 bucket',
  inputSchema: {
    type: 'object',
    properties: {
      bucket: {
        type: 'string',
        description: 'Name of the bucket',
      },
      key: {
        type: 'string',
        description: 'Key of the object to put',
      },
      content: {
        type: 'string',
        description: 'Content to store in the object',
      },
      contentType: {
        type: 'string',
        description: 'Optional MIME type of the content',
      },
    },
    required: ['bucket', 'key', 'content'],
  },
}

const R2_DELETE_OBJECT_TOOL: Tool = {
  name: 'r2_delete_object',
  description: 'Delete an object from an R2 bucket',
  inputSchema: {
    type: 'object',
    properties: {
      bucket: {
        type: 'string',
        description: 'Name of the bucket',
      },
      key: {
        type: 'string',
        description: 'Key of the object to delete',
      },
    },
    required: ['bucket', 'key'],
  },
}

const ANALYTICS_TOOLS = [ANALYTICS_GET_TOOL]
const KV_TOOLS = [GET_KVS_TOOL, KV_GET_TOOL, KV_PUT_TOOL, KV_DELETE_TOOL, KV_LIST_TOOL]
const R2_TOOLS = [
  R2_LIST_BUCKETS_TOOL,
  R2_CREATE_BUCKET_TOOL,
  R2_DELETE_BUCKET_TOOL,
  R2_LIST_OBJECTS_TOOL,
  R2_GET_OBJECT_TOOL,
  R2_PUT_OBJECT_TOOL,
  R2_DELETE_OBJECT_TOOL,
]
const ALL_TOOLS = [...KV_TOOLS, ...WORKER_TOOLS, ...ANALYTICS_TOOLS, ...R2_TOOLS]

// Create server
const server = new Server(
  { name: 'cloudflare', version: '1.0.0' }, // Changed from cloudflare-kv to cloudflare
  { capabilities: { tools: {} } },
)

async function handleWorkerList() {
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

async function handleWorkerGet(name: string) {
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

async function handleWorkerPut(name: string, script: string) {
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

async function handleWorkerDelete(name: string) {
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

// Handle list tools request
server.setRequestHandler(ListToolsRequestSchema, async () => {
  log('Received list tools request')
  return { tools: ALL_TOOLS }
})

// Add interface for KV namespace response
interface CloudflareKVNamespacesResponse {
  result: Array<{
    id: string
    title: string
    supports_url_encoding?: boolean
  }>
  success: boolean
  errors: any[]
  messages: any[]
}

// Add handler for getting KV namespaces
async function handleGetKVs() {
  log('Executing get_kvs')
  const url = `https://api.cloudflare.com/client/v4/accounts/${config.accountId}/storage/kv/namespaces`

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${config.apiToken}` },
  })

  log('KV namespaces response status:', response.status)

  if (!response.ok) {
    const error = await response.text()
    log('KV namespaces error:', error)
    throw new Error(`Failed to list KV namespaces: ${error}`)
  }

  const data = (await response.json()) as CloudflareKVNamespacesResponse
  log('KV namespaces success:', data)
  return data.result
}

// Modify existing handlers to accept namespaceId
async function handleGet(namespaceId: string, key: string) {
  log('Executing kv_get for key:', key, 'in namespace:', namespaceId)
  const url = `https://api.cloudflare.com/client/v4/accounts/${config.accountId}/storage/kv/namespaces/${namespaceId}/values/${key}`

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${config.apiToken}` },
  })

  log('KV get response status:', response.status)

  if (!response.ok) {
    const error = await response.text()
    log('KV get error:', error)
    throw new Error(`Failed to get value: ${error}`)
  }

  const value = await response.text()
  log('KV get success:', value)
  return value
}

async function handlePut(namespaceId: string, key: string, value: string, expirationTtl?: number) {
  log('Executing kv_put for key:', key, 'in namespace:', namespaceId)
  const url = `https://api.cloudflare.com/client/v4/accounts/${config.accountId}/storage/kv/namespaces/${namespaceId}/values/${key}`

  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${config.apiToken}`,
      'Content-Type': 'text/plain',
    },
    body: value,
    ...(expirationTtl ? { query: { expiration_ttl: expirationTtl } } : {}),
  })

  log('KV put response status:', response.status)

  if (!response.ok) {
    const error = await response.text()
    log('KV put error:', error)
    throw new Error(`Failed to put value: ${error}`)
  }

  return 'Success'
}

async function handleDelete(namespaceId: string, key: string) {
  log('Executing kv_delete for key:', key, 'in namespace:', namespaceId)
  const url = `https://api.cloudflare.com/client/v4/accounts/${config.accountId}/storage/kv/namespaces/${namespaceId}/values/${key}`

  const response = await fetch(url, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${config.apiToken}` },
  })

  log('KV delete response status:', response.status)

  if (!response.ok) {
    const error = await response.text()
    log('KV delete error:', error)
    throw new Error(`Failed to delete key: ${error}`)
  }

  return 'Success'
}

async function handleList(namespaceId: string, prefix?: string, limit?: number) {
  log('Executing kv_list in namespace:', namespaceId)
  const params = new URLSearchParams()
  if (prefix) params.append('prefix', prefix)
  if (limit) params.append('limit', limit.toString())

  const url = `https://api.cloudflare.com/client/v4/accounts/${config.accountId}/storage/kv/namespaces/${namespaceId}/keys?${params}`

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${config.apiToken}` },
  })

  log('KV list response status:', response.status)

  if (!response.ok) {
    const error = await response.text()
    log('KV list error:', error)
    throw new Error(`Failed to list keys: ${error}`)
  }

  const data = (await response.json()) as CloudflareListResponse
  log('KV list success:', data)
  return data.result
}

// Add R2 response interfaces
interface CloudflareR2BucketsResponse {
  result: Array<{
    name: string
    creation_date: string
  }>
  success: boolean
  errors: any[]
  messages: any[]
}

interface CloudflareR2ObjectsResponse {
  objects: Array<{
    key: string
    size: number
    uploaded: string
    etag: string
    httpEtag: string
    version: string
  }>
  delimitedPrefixes: string[]
  truncated: boolean
}

// Add R2 handlers
async function handleR2ListBuckets() {
  log('Executing r2_list_buckets')
  const url = `https://api.cloudflare.com/client/v4/accounts/${config.accountId}/r2/buckets`

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${config.apiToken}` },
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to list R2 buckets: ${error}`)
  }

  const data = (await response.json()) as CloudflareR2BucketsResponse
  return data.result
}

async function handleR2CreateBucket(name: string) {
  log('Executing r2_create_bucket:', name)
  const url = `https://api.cloudflare.com/client/v4/accounts/${config.accountId}/r2/buckets`

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.apiToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to create R2 bucket: ${error}`)
  }

  return 'Success'
}

async function handleR2DeleteBucket(name: string) {
  log('Executing r2_delete_bucket:', name)
  const url = `https://api.cloudflare.com/client/v4/accounts/${config.accountId}/r2/buckets/${name}`

  const response = await fetch(url, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${config.apiToken}` },
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to delete R2 bucket: ${error}`)
  }

  return 'Success'
}

async function handleR2ListObjects(bucket: string, prefix?: string, delimiter?: string, limit?: number) {
  log('Executing r2_list_objects for bucket:', bucket)
  const params = new URLSearchParams()
  if (prefix) params.append('prefix', prefix)
  if (delimiter) params.append('delimiter', delimiter)
  if (limit) params.append('limit', limit.toString())

  const url = `https://api.cloudflare.com/client/v4/accounts/${config.accountId}/r2/buckets/${bucket}/objects?${params}`

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${config.apiToken}` },
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to list R2 objects: ${error}`)
  }

  const data = (await response.json()) as CloudflareR2ObjectsResponse
  return data
}

async function handleR2GetObject(bucket: string, key: string) {
  log('Executing r2_get_object for bucket:', bucket, 'key:', key)
  const url = `https://api.cloudflare.com/client/v4/accounts/${config.accountId}/r2/buckets/${bucket}/objects/${key}`

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${config.apiToken}` },
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to get R2 object: ${error}`)
  }

  const content = await response.text()
  return content
}

async function handleR2PutObject(bucket: string, key: string, content: string, contentType?: string) {
  log('Executing r2_put_object for bucket:', bucket, 'key:', key)
  const url = `https://api.cloudflare.com/client/v4/accounts/${config.accountId}/r2/buckets/${bucket}/objects/${key}`

  const headers: Record<string, string> = {
    Authorization: `Bearer ${config.apiToken}`,
  }
  if (contentType) {
    headers['Content-Type'] = contentType
  }

  const response = await fetch(url, {
    method: 'PUT',
    headers,
    body: content,
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to put R2 object: ${error}`)
  }

  return 'Success'
}

async function handleR2DeleteObject(bucket: string, key: string) {
  log('Executing r2_delete_object for bucket:', bucket, 'key:', key)
  const url = `https://api.cloudflare.com/client/v4/accounts/${config.accountId}/r2/buckets/${bucket}/objects/${key}`

  const response = await fetch(url, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${config.apiToken}` },
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to delete R2 object: ${error}`)
  }

  return 'Success'
}

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  log('Received tool call:', request.params.name)

  try {
    switch (request.params.name) {
      case 'analytics_get': {
        const { zoneId, since, until } = request.params.arguments as {
          zoneId: string
          since?: string
          until?: string
        }
        const date = since ? new Date(since).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]

        const graphqlQuery = {
          query: `query {
                  viewer {
                      zones(filter: {zoneTag: "${zoneId}"}) {
                          httpRequests1dGroups(
                              limit: 1,
                              filter: {date: "${date}"},
                              orderBy: [date_DESC]
                          ) {
                              dimensions {
                                  date
                              }
                              sum {
                                  requests
                                  bytes
                                  threats
                                  pageViews
                              }
                              uniq {
                                  uniques
                              }
                          }
                      }
                  }
              }`,
        }

        const analyticsResponse = await fetch('https://api.cloudflare.com/client/v4/graphql', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${config.apiToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(graphqlQuery),
        })

        if (!analyticsResponse.ok) {
          throw new Error(`Analytics API error: ${await analyticsResponse.text()}`)
        }

        const analyticsData = await analyticsResponse.json()
        return {
          toolResult: {
            content: [
              {
                type: 'text',
                text: JSON.stringify(analyticsData, null, 2),
              },
            ],
          },
        }
      }
      case 'get_kvs': {
        const results = await handleGetKVs()
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
      }

      case 'kv_get': {
        const { namespaceId, key } = request.params.arguments as { namespaceId: string; key: string }
        const value = await handleGet(namespaceId, key)
        return {
          toolResult: {
            content: [
              {
                type: 'text',
                text: value,
              },
            ],
          },
        }
      }

      case 'kv_put': {
        const { namespaceId, key, value, expirationTtl } = request.params.arguments as {
          namespaceId: string
          key: string
          value: string
          expirationTtl?: number
        }
        await handlePut(namespaceId, key, value, expirationTtl)
        return {
          toolResult: {
            content: [
              {
                type: 'text',
                text: `Successfully stored value for key: ${key}`,
              },
            ],
          },
        }
      }

      case 'kv_delete': {
        const { namespaceId, key } = request.params.arguments as { namespaceId: string; key: string }
        await handleDelete(namespaceId, key)
        return {
          toolResult: {
            content: [
              {
                type: 'text',
                text: `Successfully deleted key: ${key}`,
              },
            ],
          },
        }
      }

      case 'kv_list': {
        const { namespaceId, prefix, limit } = request.params.arguments as {
          namespaceId: string
          prefix?: string
          limit?: number
        }
        const results = await handleList(namespaceId, prefix, limit)
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
      }

      case 'worker_list': {
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
      }

      case 'worker_get': {
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
      }

      case 'worker_put': {
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
      }

      case 'worker_delete': {
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
      }

      // Add R2 cases to the tool call handler
      case 'r2_list_buckets': {
        const results = await handleR2ListBuckets()
        return {
          toolResult: {
            content: [{ type: 'text', text: JSON.stringify(results, null, 2) }],
          },
        }
      }

      case 'r2_create_bucket': {
        const { name } = request.params.arguments as { name: string }
        await handleR2CreateBucket(name)
        return {
          toolResult: {
            content: [{ type: 'text', text: `Successfully created bucket: ${name}` }],
          },
        }
      }

      case 'r2_delete_bucket': {
        const { name } = request.params.arguments as { name: string }
        await handleR2DeleteBucket(name)
        return {
          toolResult: {
            content: [{ type: 'text', text: `Successfully deleted bucket: ${name}` }],
          },
        }
      }

      case 'r2_list_objects': {
        const { bucket, prefix, delimiter, limit } = request.params.arguments as {
          bucket: string
          prefix?: string
          delimiter?: string
          limit?: number
        }
        const results = await handleR2ListObjects(bucket, prefix, delimiter, limit)
        return {
          toolResult: {
            content: [{ type: 'text', text: JSON.stringify(results, null, 2) }],
          },
        }
      }

      case 'r2_get_object': {
        const { bucket, key } = request.params.arguments as { bucket: string; key: string }
        const content = await handleR2GetObject(bucket, key)
        return {
          toolResult: {
            content: [{ type: 'text', text: content }],
          },
        }
      }

      case 'r2_put_object': {
        const { bucket, key, content, contentType } = request.params.arguments as {
          bucket: string
          key: string
          content: string
          contentType?: string
        }
        await handleR2PutObject(bucket, key, content, contentType)
        return {
          toolResult: {
            content: [{ type: 'text', text: `Successfully stored object: ${key}` }],
          },
        }
      }

      case 'r2_delete_object': {
        const { bucket, key } = request.params.arguments as { bucket: string; key: string }
        await handleR2DeleteObject(bucket, key)
        return {
          toolResult: {
            content: [{ type: 'text', text: `Successfully deleted object: ${key}` }],
          },
        }
      }

      default:
        throw new Error(`Unknown tool: ${request.params.name}`)
    }
  } catch (error) {
    log('Error handling tool call:', error)
    return {
      toolResult: {
        content: [
          {
            type: 'text',
            text: `Error: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
        isError: true,
      },
    }
  }
})

// Start server
export async function main() {
  log('Starting server...')
  try {
    const transport = new StdioServerTransport()
    log('Created transport')
    await server.connect(transport)
    log('Server connected and running')
  } catch (error) {
    log('Fatal error:', error)
    process.exit(1)
  }
}
