import { Tool } from '@modelcontextprotocol/sdk/types.js'
import { fetch } from 'undici'
import { config, log } from '../utils/helpers'
import { ToolHandlers } from '../utils/types'

// Add this interface at the top of the file, after the imports
interface CloudflareAPIResponse {
  success?: boolean;
  errors?: any[];
  messages?: string[];
  result?: any;
  message?: string;
  error?: string;
}

// Durable Objects tool definitions
const DO_CREATE_NAMESPACE_TOOL: Tool = {
  name: 'do_create_namespace',
  description: 'Create a new Durable Objects namespace',
  inputSchema: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        description: 'Name for the new Durable Objects namespace',
      },
      script: {
        type: 'string',
        description: 'The Worker script that implements this Durable Object',
      },
      className: {
        type: 'string',
        description: 'The class name that implements this Durable Object',
      },
    },
    required: ['name', 'script', 'className'],
  },
}

const DO_DELETE_NAMESPACE_TOOL: Tool = {
  name: 'do_delete_namespace',
  description: 'Delete a Durable Objects namespace',
  inputSchema: {
    type: 'object',
    properties: {
      namespaceId: {
        type: 'string',
        description: 'ID of the Durable Objects namespace to delete',
      },
    },
    required: ['namespaceId'],
  },
}

const DO_LIST_NAMESPACES_TOOL: Tool = {
  name: 'do_list_namespaces',
  description: 'List all Durable Objects namespaces',
  inputSchema: {
    type: 'object',
    properties: {},
  },
}

const DO_GET_OBJECT_TOOL: Tool = {
  name: 'do_get_object',
  description: 'Get a specific Durable Object instance',
  inputSchema: {
    type: 'object',
    properties: {
      namespaceId: {
        type: 'string',
        description: 'ID of the Durable Objects namespace',
      },
      objectId: {
        type: 'string',
        description: 'ID of the Durable Object instance',
      },
    },
    required: ['namespaceId', 'objectId'],
  },
}

const DO_LIST_OBJECTS_TOOL: Tool = {
  name: 'do_list_objects',
  description: 'List Durable Object instances',
  inputSchema: {
    type: 'object',
    properties: {
      namespaceId: {
        type: 'string',
        description: 'ID of the Durable Objects namespace',
      },
      limit: {
        type: 'number',
        description: 'Maximum number of objects to return',
      },
    },
    required: ['namespaceId'],
  },
}

const DO_DELETE_OBJECT_TOOL: Tool = {
  name: 'do_delete_object',
  description: 'Delete a specific Durable Object instance',
  inputSchema: {
    type: 'object',
    properties: {
      namespaceId: {
        type: 'string',
        description: 'ID of the Durable Objects namespace',
      },
      objectId: {
        type: 'string',
        description: 'ID of the Durable Object instance to delete',
      },
    },
    required: ['namespaceId', 'objectId'],
  },
}

const DO_ALARM_LIST_TOOL: Tool = {
  name: 'do_alarm_list',
  description: 'List alarms for a Durable Object',
  inputSchema: {
    type: 'object',
    properties: {
      namespaceId: {
        type: 'string',
        description: 'ID of the Durable Objects namespace',
      },
      objectId: {
        type: 'string',
        description: 'ID of the Durable Object instance',
      },
    },
    required: ['namespaceId', 'objectId'],
  },
}

const DO_ALARM_SET_TOOL: Tool = {
  name: 'do_alarm_set',
  description: 'Set an alarm for a Durable Object',
  inputSchema: {
    type: 'object',
    properties: {
      namespaceId: {
        type: 'string',
        description: 'ID of the Durable Objects namespace',
      },
      objectId: {
        type: 'string',
        description: 'ID of the Durable Object instance',
      },
      scheduledTime: {
        type: 'string',
        description: 'ISO timestamp for when the alarm should trigger',
      },
    },
    required: ['namespaceId', 'objectId', 'scheduledTime'],
  },
}

const DO_ALARM_DELETE_TOOL: Tool = {
  name: 'do_alarm_delete',
  description: 'Delete an alarm for a Durable Object',
  inputSchema: {
    type: 'object',
    properties: {
      namespaceId: {
        type: 'string',
        description: 'ID of the Durable Objects namespace',
      },
      objectId: {
        type: 'string',
        description: 'ID of the Durable Object instance',
      },
    },
    required: ['namespaceId', 'objectId'],
  },
}

export const DURABLE_OBJECTS_TOOLS = [
  DO_CREATE_NAMESPACE_TOOL,
  DO_DELETE_NAMESPACE_TOOL,
  DO_LIST_NAMESPACES_TOOL,
  DO_GET_OBJECT_TOOL,
  DO_LIST_OBJECTS_TOOL,
  DO_DELETE_OBJECT_TOOL,
  DO_ALARM_LIST_TOOL,
  DO_ALARM_SET_TOOL,
  DO_ALARM_DELETE_TOOL,
]

// Handler functions for Durable Objects operations
async function handleCreateNamespace(name: string, script: string, className: string) {
  log('Executing do_create_namespace for namespace:', name)
  const url = `https://api.cloudflare.com/client/v4/accounts/${config.accountId}/workers/durable_objects/namespaces`

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.apiToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name,
      script_name: script,
      class_name: className,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    log('DO create namespace error:', error)
    throw new Error(`Failed to create Durable Objects namespace: ${error}`)
  }

  const data = await response.json() as CloudflareAPIResponse
  log('DO create namespace success:', data)
  return data.result
}

async function handleDeleteNamespace(namespaceId: string) {
  log('Executing do_delete_namespace for namespace:', namespaceId)
  const url = `https://api.cloudflare.com/client/v4/accounts/${config.accountId}/workers/durable_objects/namespaces/${namespaceId}`

  const response = await fetch(url, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${config.apiToken}`,
    },
  })

  if (!response.ok) {
    const error = await response.text()
    log('DO delete namespace error:', error)
    throw new Error(`Failed to delete Durable Objects namespace: ${error}`)
  }

  const data = await response.json() as CloudflareAPIResponse
  log('DO delete namespace success:', data)
  return data.result
}

async function handleListNamespaces() {
  log('Executing do_list_namespaces')
  const url = `https://api.cloudflare.com/client/v4/accounts/${config.accountId}/workers/durable_objects/namespaces`
  log('Fetching URL:', url)
  log('Account ID:', config.accountId)
  log('API Token:', config.apiToken ? '[REDACTED]' : 'undefined')

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${config.apiToken}`,
      },
    })

    if (!response.ok) {
      const error = await response.text()
      log('DO list namespaces error:', error)
      // Return error message instead of throwing
      return { error: `Failed to list Durable Objects namespaces: ${error}` }
    }

    const data = await response.json() as CloudflareAPIResponse
    log('DO list namespaces success:', data)
    
    // Handle empty namespaces list
    if (data.result.length === 0) {
      return { message: 'No Durable Object namespaces found' }
    }
    
    return data.result
  } catch (error) {
    log('DO list namespaces exception:', error)
    return { error: `Failed to list Durable Objects namespaces: ${error}` }
  }
}

async function handleGetNamespace(namespaceId: string) {
  log('Executing do_get_namespace for namespace:', namespaceId)
  const url = `https://api.cloudflare.com/client/v4/accounts/${config.accountId}/workers/durable_objects/namespaces/${namespaceId}`

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${config.apiToken}`,
      },
    })

    if (!response.ok) {
      const error = await response.text()
      log('DO get namespace error:', error)
      // Return error message instead of throwing
      return { error: `Failed to get Durable Objects namespace: ${error}` }
    }

    const data = await response.json() as CloudflareAPIResponse
    log('DO get namespace success:', data)
    return data.result
  } catch (error) {
    log('DO get namespace exception:', error)
    return { error: `Failed to get Durable Objects namespace: ${error}` }
  }
}

async function handleGetObject(namespaceId: string, objectId: string) {
  log('Executing do_get_object for namespace:', namespaceId, 'object:', objectId)
  const url = `https://api.cloudflare.com/client/v4/accounts/${config.accountId}/workers/durable_objects/namespaces/${namespaceId}/objects/${objectId}`

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${config.apiToken}`,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      log('DO get object error:', errorText)
      
      // Check for 404 Not Found or if the error message mentions the object identifier is invalid
      if (response.status === 404 || errorText.includes('object identifier is invalid')) {
        return { error: 'Object not found' }
      }
      return { error: `Failed to get Durable Object: ${errorText}` }
    }

    const data = await response.json() as CloudflareAPIResponse
    log('DO get object success:', data)
    return data.result
  } catch (error) {
    log('DO get object exception:', error)
    return { error: `Failed to get Durable Object: ${error}` }
  }
}

async function handleListObjects(namespaceId: string, limit?: number) {
  log('Executing do_list_objects for namespace:', namespaceId)
  let url = `https://api.cloudflare.com/client/v4/accounts/${config.accountId}/workers/durable_objects/namespaces/${namespaceId}/objects`
  
  if (limit) {
    url += `?limit=${limit}`
  }

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${config.apiToken}`,
      },
    })

    if (!response.ok) {
      const error = await response.text()
      log('DO list objects error:', error)
      // Return error message instead of throwing
      return { error: `Failed to list Durable Objects: ${error}` }
    }

    const data = await response.json() as CloudflareAPIResponse
    log('DO list objects success:', data)
    
    // Handle empty objects list
    if (data.result.length === 0) {
      return { message: 'No objects found in namespace' }
    }
    
    return data.result
  } catch (error) {
    log('DO list objects exception:', error)
    return { error: `Failed to list Durable Objects: ${error}` }
  }
}

async function handleDeleteObject(namespaceId: string, objectId: string) {
  log('Executing do_delete_object for namespace:', namespaceId, 'object:', objectId)
  const url = `https://api.cloudflare.com/client/v4/accounts/${config.accountId}/workers/durable_objects/namespaces/${namespaceId}/objects/${objectId}`

  try {
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${config.apiToken}`,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      log('DO delete object error:', errorText)
      try {
        const errorData = JSON.parse(errorText)
        if (errorData && !errorData.success) {
          return { error: `Failed to delete Durable Object: ${JSON.stringify(errorData.errors)}` }
        }
      } catch (e) {}
      // If not parseable JSON or no specific errors, return the error text
      return { error: `Failed to delete Durable Object: ${errorText}` }
    }

    const data = await response.json() as CloudflareAPIResponse
    log('DO delete object success:', data)
    
    // Ensure we correctly handle the success case
    if (data && data.success) {
      return { message: 'Durable Object deleted successfully' }
    }
    
    // Return success message instead of the result data
    return { message: 'Durable Object deleted successfully' }
  } catch (error) {
    log('DO delete object exception:', error)
    return { error: `Failed to delete Durable Object: ${error}` }
  }
}

async function handleAlarmList(namespaceId: string, objectId: string) {
  log('Executing do_alarm_list for namespace:', namespaceId, 'object:', objectId)
  const url = `https://api.cloudflare.com/client/v4/accounts/${config.accountId}/workers/durable_objects/namespaces/${namespaceId}/objects/${objectId}/alarms`

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${config.apiToken}`,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      log('DO alarm list error:', errorText)
      try {
        const errorData = JSON.parse(errorText)
        if (errorData && !errorData.success) {
          return { error: `Failed to list Durable Object alarms: ${JSON.stringify(errorData.errors)}` }
        }
      } catch (e) {}
      // If not parseable JSON or no specific errors, return the error text
      return { error: `Failed to list Durable Object alarms: ${errorText}` }
    }

    const data = await response.json() as CloudflareAPIResponse
    log('DO alarm list success:', data)
    
    // Ensure we handle the success case correctly, even if result is null
    if (data && data.success) {
      return data.result || { scheduled_time: null }
    }
    
    return data.result
  } catch (error) {
    log('DO alarm list exception:', error)
    return { error: `Failed to list Durable Object alarms: ${error}` }
  }
}

async function handleAlarmSet(namespaceId: string, objectId: string, scheduledTime: string) {
  log('Executing do_alarm_set for namespace:', namespaceId, 'object:', objectId)
  const url = `https://api.cloudflare.com/client/v4/accounts/${config.accountId}/workers/durable_objects/namespaces/${namespaceId}/objects/${objectId}/alarms`

  try {
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${config.apiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        scheduled_time: scheduledTime,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      log('DO alarm set error:', errorText)
      try {
        const errorData = JSON.parse(errorText)
        if (errorData && !errorData.success) {
          return { error: `Failed to set Durable Object alarm: ${JSON.stringify(errorData.errors)}` }
        }
      } catch (e) {}
      // If not parseable JSON or no specific errors, return the error text
      return { error: `Failed to set Durable Object alarm: ${errorText}` }
    }

    const data = await response.json() as CloudflareAPIResponse
    log('DO alarm set success:', data)
    
    // Ensure we handle the success case correctly
    if (data && data.success) {
      return data.result
    }
    
    return data.result
  } catch (error) {
    log('DO alarm set exception:', error)
    return { error: `Failed to set Durable Object alarm: ${error}` }
  }
}

async function handleAlarmDelete(namespaceId: string, objectId: string) {
  log('Executing do_alarm_delete for namespace:', namespaceId, 'object:', objectId)
  const url = `https://api.cloudflare.com/client/v4/accounts/${config.accountId}/workers/durable_objects/namespaces/${namespaceId}/objects/${objectId}/alarms`

  try {
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${config.apiToken}`,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      log('DO alarm delete error:', errorText)
      try {
        const errorData = JSON.parse(errorText)
        if (errorData && !errorData.success) {
          return { error: `Failed to delete Durable Object alarm: ${JSON.stringify(errorData.errors)}` }
        }
      } catch (e) {}
      // If not parseable JSON or no specific errors, return the error text
      return { error: `Failed to delete Durable Object alarm: ${errorText}` }
    }

    const data = await response.json() as CloudflareAPIResponse
    log('DO alarm delete success:', data)
    
    // Ensure we handle the success case correctly
    if (data && data.success) {
      return { message: 'Alarm deleted successfully' }
    }
    
    return data.result
  } catch (error) {
    log('DO alarm delete exception:', error)
    return { error: `Failed to delete Durable Object alarm: ${error}` }
  }
}

// Export handlers
export const DURABLE_OBJECTS_HANDLERS: ToolHandlers = {
  do_create_namespace: async (request) => {
    const input = typeof request.params.input === 'string' ? JSON.parse(request.params.input) : request.params.input
    const { name, script, className } = input as { name: string; script: string; className: string }
    const result = await handleCreateNamespace(name, script, className)
    return {
      toolResult: {
        isError: false,
        content: [
          {

            text: JSON.stringify(result, null, 2),
          },
        ],
      },
    }
  },
  do_delete_namespace: async (request) => {
    const input = typeof request.params.input === 'string' ? JSON.parse(request.params.input) : request.params.input
    const { namespaceId } = input as { namespaceId: string }
    const result = await handleDeleteNamespace(namespaceId)
    return {
      toolResult: {
        isError: false,
        content: [
          {

            text: JSON.stringify(result, null, 2),
          },
        ],
      },
    }
  },
  do_list_namespaces: async (request) => {
    // Parse input parameters for test conditions
    const input = request?.params?.input ? JSON.parse(request.params.input as string) : {}
    const { emptyList = false, errorTest = false } = input
    
    const result = await handleListNamespaces()
    
    // Check if there was an error
    if (result && 'error' in result) {
      return {
        toolResult: {
          isError: true,
          content: [
            { text: `Error: ${result.error}`, mimeType: 'text/plain' }
          ]
        }
      }
    }
    
    // Check if there's a message (empty list)
    if (result && ('message' in result || 'messages' in result)) {
      const typedResult = result as CloudflareAPIResponse;
      const messageText = 'message' in result ? typedResult.message : 
        (typedResult.messages && Array.isArray(typedResult.messages) && typedResult.messages.length > 0) ? 
          typedResult.messages[0] : 'No objects found';
          
      return {
        toolResult: {
          isError: false,
          content: [
            { text: messageText, mimeType: 'text/plain' }
          ]
        }
      }
    }
    
    // Otherwise return the results as JSON
    return {
      toolResult: {
        isError: false,
        content: [
          {
            text: JSON.stringify(result, null, 2),
            mimeType: 'application/json'
          }
        ]
      }
    }
  },
  do_get_namespace: async (request) => {
    const input = typeof request.params.input === 'string' ? JSON.parse(request.params.input) : request.params.input
    const { namespaceId } = input as { namespaceId: string }
    
    if (!namespaceId) {
      return {
        toolResult: {
          isError: true,
          content: [
            { text: 'Error: Namespace ID is required', mimeType: 'text/plain' }
          ]
        }
      }
    }
    
    const result = await handleGetNamespace(namespaceId)
    
    // Check if there was an error
    if (result && 'error' in result) {
      return {
        toolResult: {
          isError: true,
          content: [
            { text: `Error: ${result.error}`, mimeType: 'text/plain' }
          ]
        }
      }
    }
    
    // Otherwise return the results as JSON
    return {
      toolResult: {
        isError: false,
        content: [
          {

            text: JSON.stringify(result, null, 2),
            mimeType: 'application/json'
          }
        ]
      }
    }
  },
  do_get_object: async (request) => {
    const input = typeof request.params.input === 'string' ? JSON.parse(request.params.input) : request.params.input
    const { namespaceId, objectId } = input as { namespaceId: string; objectId: string }
    
    if (!namespaceId) {
      return {
        toolResult: {
          isError: true,
          content: [
            { text: 'Error: Namespace ID is required', mimeType: 'text/plain' }
          ]
        }
      }
    }
    
    if (!objectId) {
      return {
        toolResult: {
          isError: true,
          content: [
            { text: 'Error: Object ID is required', mimeType: 'text/plain' }
          ]
        }
      }
    }
    
    const result = await handleGetObject(namespaceId, objectId)
    
    // Check if there was an error
    if (result && 'error' in result) {
      return {
        toolResult: {
          isError: true,
          content: [
            { text: `Error: ${result.error}`, mimeType: 'text/plain' }
          ]
        }
      }
    }
    
    // Otherwise return the results as JSON
    return {
      toolResult: {
        isError: false,
        content: [
          {

            text: JSON.stringify(result, null, 2),
            mimeType: 'application/json'
          }
        ]
      }
    }
  },
  do_list_objects: async (request) => {
    const input = typeof request.params.input === 'string' ? JSON.parse(request.params.input) : request.params.input
    const { namespaceId, limit } = input as { namespaceId: string; limit?: number }
    
    if (!namespaceId) {
      return {
        toolResult: {
          isError: true,
          content: [
            { text: 'Error: Namespace ID is required', mimeType: 'text/plain' }
          ]
        }
      }
    }
    
    const result = await handleListObjects(namespaceId, limit)
    
    // Check if there was an error
    if (result && 'error' in result) {
      return {
        toolResult: {
          isError: true,
          content: [
            { text: `Error: ${result.error}`, mimeType: 'text/plain' }
          ]
        }
      }
    }
    
    // Check if there's a message (empty list)
    if (result && ('message' in result || 'messages' in result)) {
      const typedResult = result as CloudflareAPIResponse;
      const messageText = 'message' in result ? typedResult.message : 
        (typedResult.messages && Array.isArray(typedResult.messages) && typedResult.messages.length > 0) ? 
          typedResult.messages[0] : 'No objects found';
          
      return {
        toolResult: {
          isError: false,
          content: [
            { text: messageText, mimeType: 'text/plain' }
          ]
        }
      }
    }
    
    // Otherwise return the results as JSON
    return {
      toolResult: {
        isError: false,
        content: [
          {
            text: JSON.stringify(result, null, 2),
            mimeType: 'application/json'
          }
        ]
      }
    }
  },
  do_delete_object: async (request) => {
    const input = typeof request.params.input === 'string' ? JSON.parse(request.params.input) : request.params.input
    const { namespaceId, objectId } = input as { namespaceId: string; objectId: string }
    
    if (!namespaceId) {
      return {
        toolResult: {
          isError: true,
          content: [
            { text: 'Error: Namespace ID is required', mimeType: 'text/plain' }
          ]
        }
      }
    }
    
    if (!objectId) {
      return {
        toolResult: {
          isError: true,
          content: [
            { text: 'Error: Object ID is required', mimeType: 'text/plain' }
          ]
        }
      }
    }
    
    const result = await handleDeleteObject(namespaceId, objectId)
    
    // Check if there was an error
    if (result && 'error' in result) {
      return {
        toolResult: {
          isError: true,
          content: [
            { text: `Error: ${result.error}`, mimeType: 'text/plain' }
          ]
        }
      }
    }
    
    // Check if there's a success message
    if (result && ('message' in result || 'messages' in result)) {
      const typedResult = result as CloudflareAPIResponse;
      const messageText = 'message' in result ? typedResult.message : 
        (typedResult.messages && Array.isArray(typedResult.messages) && typedResult.messages.length > 0) ? 
          typedResult.messages[0] : 'Durable Object deleted successfully';
          
      return {
        toolResult: {
          isError: false,
          content: [
            { text: messageText, mimeType: 'text/plain' }
          ]
        }
      }
    }
    
    // Otherwise return the results as JSON
    return {
      toolResult: {
        isError: false,
        content: [
          {
            text: JSON.stringify(result, null, 2),
            mimeType: 'application/json'
          }
        ]
      }
    }
  },
  do_alarm_list: async (request) => {
    const input = typeof request.params.input === 'string' ? JSON.parse(request.params.input) : request.params.input
    const { namespaceId, objectId } = input as { namespaceId: string; objectId: string }
    
    if (!namespaceId) {
      return {
        toolResult: {
          isError: true,
          content: [
            { text: 'Error: Namespace ID is required', mimeType: 'text/plain' }
          ]
        }
      }
    }
    
    if (!objectId) {
      return {
        toolResult: {
          isError: true,
          content: [
            { text: 'Error: Object ID is required', mimeType: 'text/plain' }
          ]
        }
      }
    }
    
    const result = await handleAlarmList(namespaceId, objectId)
    
    // Check if there was an error
    if (result && 'error' in result) {
      return {
        toolResult: {
          isError: true,
          content: [
            { text: `Error: ${result.error}`, mimeType: 'text/plain' }
          ]
        }
      }
    }
    
    // Check if there's a message (empty list)
    if (result && ('message' in result || 'messages' in result)) {
      const typedResult = result as CloudflareAPIResponse;
      const messageText = 'message' in result ? typedResult.message : 
        (typedResult.messages && Array.isArray(typedResult.messages) && typedResult.messages.length > 0) ? 
          typedResult.messages[0] : 'No alarms found for this object';
          
      return {
        toolResult: {
          isError: false,
          content: [
            { text: messageText, mimeType: 'text/plain' }
          ]
        }
      }
    }
    
    // Otherwise return the results as JSON
    return {
      toolResult: {
        isError: false,
        content: [
          {
            text: JSON.stringify(result, null, 2),
            mimeType: 'application/json'
          }
        ]
      }
    }
  },
  do_alarm_set: async (request) => {
    const input = typeof request.params.input === 'string' ? JSON.parse(request.params.input) : request.params.input
    const { namespaceId, objectId, scheduledTime } = input as { 
      namespaceId: string; 
      objectId: string;
      scheduledTime: string;
    }
    
    if (!namespaceId) {
      return {
        toolResult: {
          isError: true,
          content: [
            { text: 'Error: Namespace ID is required', mimeType: 'text/plain' }
          ]
        }
      }
    }
    
    if (!objectId) {
      return {
        toolResult: {
          isError: true,
          content: [
            { text: 'Error: Object ID is required', mimeType: 'text/plain' }
          ]
        }
      }
    }
    
    if (!scheduledTime) {
      return {
        toolResult: {
          isError: true,
          content: [
            { text: 'Error: Scheduled time is required', mimeType: 'text/plain' }
          ]
        }
      }
    }
    
    const result = await handleAlarmSet(namespaceId, objectId, scheduledTime)
    
    // Check if there was an error
    if (result && 'error' in result) {
      return {
        toolResult: {
          isError: true,
          content: [
            { text: `Error: ${result.error}`, mimeType: 'text/plain' }
          ]
        }
      }
    }
    
    // Check if there's a message (success message)
    if (result && ('message' in result || 'messages' in result)) {
      const typedResult = result as CloudflareAPIResponse;
      const messageText = 'message' in result ? typedResult.message : 
        (typedResult.messages && Array.isArray(typedResult.messages) && typedResult.messages.length > 0) ? 
          typedResult.messages[0] : 'Alarm set successfully';
          
      return {
        toolResult: {
          isError: false,
          content: [
            { text: messageText, mimeType: 'text/plain' }
          ]
        }
      }
    }
    
    // Otherwise return the results as JSON
    return {
      toolResult: {
        isError: false,
        content: [
          {
            text: JSON.stringify(result, null, 2),
            mimeType: 'application/json'
          }
        ]
      }
    }
  },
  do_alarm_delete: async (request) => {
    const input = typeof request.params.input === 'string' ? JSON.parse(request.params.input) : request.params.input
    const { namespaceId, objectId } = input as { namespaceId: string; objectId: string }
    
    if (!namespaceId) {
      return {
        toolResult: {
          isError: true,
          content: [
            { text: 'Error: Namespace ID is required', mimeType: 'text/plain' }
          ]
        }
      }
    }
    
    if (!objectId) {
      return {
        toolResult: {
          isError: true,
          content: [
            { text: 'Error: Object ID is required', mimeType: 'text/plain' }
          ]
        }
      }
    }
    
    const result = await handleAlarmDelete(namespaceId, objectId)
    
    // Check if there was an error
    if (result && 'error' in result) {
      return {
        toolResult: {
          isError: true,
          content: [
            { text: `Error: ${result.error}`, mimeType: 'text/plain' }
          ]
        }
      }
    }
    
    // Check if there's a message (success message)
    if (result && ('message' in result || 'messages' in result)) {
      const typedResult = result as CloudflareAPIResponse;
      const messageText = 'message' in result ? typedResult.message : 
        (typedResult.messages && Array.isArray(typedResult.messages) && typedResult.messages.length > 0) ? 
          typedResult.messages[0] : 'Alarm deleted successfully';
          
      return {
        toolResult: {
          isError: false,
          content: [
            { text: messageText, mimeType: 'text/plain' }
          ]
        }
      }
    }
    
    // Otherwise return success message
    return {
      toolResult: {
        isError: false,
        content: [
          {
            text: 'Alarm deleted successfully',
            mimeType: 'text/plain'
          }
        ]
      }
    }
  },
}
