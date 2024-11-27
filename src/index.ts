#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema, Tool } from "@modelcontextprotocol/sdk/types.js";
import fetch from "node-fetch";
import { init } from './init'

// Types for Cloudflare responses
// Types for Cloudflare responses
interface CloudflareListResponse {
  result: Array<{
      name: string;
      expiration?: number;
  }>;
  success: boolean;
  errors: any[];
  messages: any[];
}

interface CloudflareWorkerListResponse {
  result: Array<{
      id: string;
      name: string;
      script?: string;
      modified_on?: string;
  }>;
  success: boolean;
  errors: any[];
  messages: any[];
}

interface CloudflareWorkerResponse {
  result: {
      id: string;
      script: string;
      modified_on: string;
  };
  success: boolean;
  errors: any[];
  messages: any[];
}

// Existing KV Tool definition

// New Worker Tool definitions
const WORKER_LIST_TOOL: Tool = {
  name: "worker_list",
  description: "List all Workers in your account",
  inputSchema: {
      type: "object",
      properties: {}
  }
};

const WORKER_GET_TOOL: Tool = {
  name: "worker_get",
  description: "Get a Worker's script content",
  inputSchema: {
      type: "object",
      properties: {
          name: {
              type: "string",
              description: "Name of the Worker script"
          }
      },
      required: ["name"]
  }
};

const WORKER_PUT_TOOL: Tool = {
  name: "worker_put",
  description: "Create or update a Worker script",
  inputSchema: {
      type: "object",
      properties: {
          name: {
              type: "string",
              description: "Name of the Worker script"
          },
          script: {
              type: "string",
              description: "The Worker script content"
          }
      },
      required: ["name", "script"]
  }
};

const WORKER_DELETE_TOOL: Tool = {
  name: "worker_delete",
  description: "Delete a Worker script",
  inputSchema: {
      type: "object",
      properties: {
          name: {
              type: "string",
              description: "Name of the Worker script"
          }
      },
      required: ["name"]
  }
};


const WORKER_TOOLS = [WORKER_LIST_TOOL, WORKER_GET_TOOL, WORKER_PUT_TOOL, WORKER_DELETE_TOOL];

// Combine all tools


interface CloudflareListResponse {
    result: Array<{
        name: string;
        expiration?: number;
    }>;
    success: boolean;
    errors: any[];
    messages: any[];
}

const ANALYTICS_GET_TOOL: Tool = {
  name: "analytics_get",
  description: "Get analytics data from Cloudflare",
  inputSchema: {
      type: "object",
      properties: {
          zoneId: {
              type: "string",
              description: "The zone ID to get analytics for"
          },
          since: {
              type: "string",
              description: "Start time for analytics (ISO string)"
          },
          until: {
              type: "string",
              description: "End time for analytics (ISO string)"
          }
      },
      required: ["zoneId"]
  }
};

// Tool definitions
const KV_GET_TOOL: Tool = {
    name: "kv_get",
    description: "Get a value from Cloudflare KV store",
    inputSchema: {
        type: "object",
        properties: {
            key: {
                type: "string",
                description: "The key to retrieve"
            }
        },
        required: ["key"]
    }
};

const KV_PUT_TOOL: Tool = {
    name: "kv_put",
    description: "Put a value into Cloudflare KV store",
    inputSchema: {
        type: "object",
        properties: {
            key: {
                type: "string",
                description: "The key to store"
            },
            value: {
                type: "string",
                description: "The value to store"
            },
            expirationTtl: {
                type: "number",
                description: "Optional expiration time in seconds"
            }
        },
        required: ["key", "value"]
    }
};

const KV_DELETE_TOOL: Tool = {
    name: "kv_delete",
    description: "Delete a key from Cloudflare KV store",
    inputSchema: {
        type: "object",
        properties: {
            key: {
                type: "string",
                description: "The key to delete"
            }
        },
        required: ["key"]
    }
};

const KV_LIST_TOOL: Tool = {
    name: "kv_list",
    description: "List keys in Cloudflare KV store",
    inputSchema: {
        type: "object",
        properties: {
            prefix: {
                type: "string",
                description: "Optional prefix to filter keys"
            },
            limit: {
                type: "number",
                description: "Maximum number of keys to return"
            }
        }
    }
};

const ANALYTICS_TOOLS = [ANALYTICS_GET_TOOL];
const KV_TOOLS = [KV_GET_TOOL, KV_PUT_TOOL, KV_DELETE_TOOL, KV_LIST_TOOL];
const ALL_TOOLS = [...KV_TOOLS, ...WORKER_TOOLS, ...ANALYTICS_TOOLS];

// Debug logging
const debug = true;
function log(...args: any[]) {
    const msg = `[DEBUG ${new Date().toISOString()}] ${args.join(' ')}\n`;
    process.stderr.write(msg);
}

// Config
const config = {
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID,
    apiToken: process.env.CLOUDFLARE_API_TOKEN,
    namespaceId: process.env.CLOUDFLARE_KV_NAMESPACE_ID
};

// Create server
// Create server
const server = new Server(
  { name: "cloudflare", version: "1.0.0" },  // Changed from cloudflare-kv to cloudflare
  { capabilities: { tools: {} } }
);


async function handleWorkerList() {
  log('Executing worker_list');
  const url = `https://api.cloudflare.com/client/v4/accounts/${config.accountId}/workers/scripts`;

  const response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${config.apiToken}` }
  });

  log('Worker list response status:', response.status);

  if (!response.ok) {
      const error = await response.text();
      log('Worker list error:', error);
      throw new Error(`Failed to list workers: ${error}`);
  }

  const data = await response.json() as CloudflareWorkerListResponse;  // Add type assertion here
  log('Worker list success:', data);
  return data.result;
}

async function handleWorkerGet(name: string) {
  log('Executing worker_get for script:', name);
  const url = `https://api.cloudflare.com/client/v4/accounts/${config.accountId}/workers/scripts/${name}`;

  const response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${config.apiToken}` }
  });

  log('Worker get response status:', response.status);

  if (!response.ok) {
      const error = await response.text();
      log('Worker get error:', error);
      throw new Error(`Failed to get worker: ${error}`);
  }

  const data = await response.text();
  return data;
}

async function handleWorkerPut(name: string, script: string) {
  log('Executing worker_put for script:', name);
  const url = `https://api.cloudflare.com/client/v4/accounts/${config.accountId}/workers/scripts/${name}`;

  const metadata = {
      body_part: "script",
      'content-type': "application/javascript",
  };

  // Create form data with metadata and script
  const formData = new FormData();
  formData.append('metadata', JSON.stringify(metadata));
  formData.append('script', script);

  const response = await fetch(url, {
      method: 'PUT',
      headers: {
          'Authorization': `Bearer ${config.apiToken}`,
      },
      body: formData
  });

  log('Worker put response status:', response.status);

  if (!response.ok) {
      const error = await response.text();
      log('Worker put error:', error);
      throw new Error(`Failed to put worker: ${error}`);
  }

  return 'Success';
}

async function handleWorkerDelete(name: string) {
  log('Executing worker_delete for script:', name);
  const url = `https://api.cloudflare.com/client/v4/accounts/${config.accountId}/workers/scripts/${name}`;

  const response = await fetch(url, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${config.apiToken}` }
  });

  log('Worker delete response status:', response.status);

  if (!response.ok) {
      const error = await response.text();
      log('Worker delete error:', error);
      throw new Error(`Failed to delete worker: ${error}`);
  }

  return 'Success';
}

// Handle list tools request
server.setRequestHandler(ListToolsRequestSchema, async () => {
    log('Received list tools request');
    return { tools: ALL_TOOLS };
});

// Handlers for KV operations
async function handleGet(key: string) {
    log('Executing kv_get for key:', key);
    const url = `https://api.cloudflare.com/client/v4/accounts/${config.accountId}/storage/kv/namespaces/${config.namespaceId}/values/${key}`;

    const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${config.apiToken}` }
    });

    log('KV get response status:', response.status);

    if (!response.ok) {
        const error = await response.text();
        log('KV get error:', error);
        throw new Error(`Failed to get value: ${error}`);
    }

    const value = await response.text();
    log('KV get success:', value);
    return value;
}

async function handlePut(key: string, value: string, expirationTtl?: number) {
    log('Executing kv_put for key:', key);
    const url = `https://api.cloudflare.com/client/v4/accounts/${config.accountId}/storage/kv/namespaces/${config.namespaceId}/values/${key}`;

    const response = await fetch(url, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${config.apiToken}`,
            'Content-Type': 'text/plain',
        },
        body: value,
        ...(expirationTtl ? { query: { expiration_ttl: expirationTtl } } : {})
    });

    log('KV put response status:', response.status);

    if (!response.ok) {
        const error = await response.text();
        log('KV put error:', error);
        throw new Error(`Failed to put value: ${error}`);
    }

    return 'Success';
}

async function handleDelete(key: string) {
    log('Executing kv_delete for key:', key);
    const url = `https://api.cloudflare.com/client/v4/accounts/${config.accountId}/storage/kv/namespaces/${config.namespaceId}/values/${key}`;

    const response = await fetch(url, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${config.apiToken}` }
    });

    log('KV delete response status:', response.status);

    if (!response.ok) {
        const error = await response.text();
        log('KV delete error:', error);
        throw new Error(`Failed to delete key: ${error}`);
    }

    return 'Success';
}

async function handleList(prefix?: string, limit?: number) {
    log('Executing kv_list');
    const params = new URLSearchParams();
    if (prefix) params.append('prefix', prefix);
    if (limit) params.append('limit', limit.toString());

    const url = `https://api.cloudflare.com/client/v4/accounts/${config.accountId}/storage/kv/namespaces/${config.namespaceId}/keys?${params}`;

    const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${config.apiToken}` }
    });

    log('KV list response status:', response.status);

    if (!response.ok) {
        const error = await response.text();
        log('KV list error:', error);
        throw new Error(`Failed to list keys: ${error}`);
    }

    const data = await response.json() as CloudflareListResponse;
    log('KV list success:', data);
    return data.result;
}

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    log('Received tool call:', request.params.name);



    try {
        switch (request.params.name) {
            case "kv_get": {
                const { key } = request.params.arguments as { key: string };
                const value = await handleGet(key);
                return {
                    toolResult: {
                        content: [{
                            type: "text",
                            text: value
                        }]
                    }
                };
            }

            case "analytics_get": {
              const { zoneId, since, until } = request.params.arguments as {
                  zoneId: string;
                  since?: string;
                  until?: string;
              };
              const date = since ?
              new Date(since).toISOString().split('T')[0] :
              new Date().toISOString().split('T')[0];

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
              }`
          };


          const analyticsResponse = await fetch(
            'https://api.cloudflare.com/client/v4/graphql',
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${config.apiToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(graphqlQuery)
            }
        );

        if (!analyticsResponse.ok) {
            throw new Error(`Analytics API error: ${await analyticsResponse.text()}`);
        }

        const analyticsData = await analyticsResponse.json();
        return {
            toolResult: {
                content: [{
                    type: "text",
                    text: JSON.stringify(analyticsData, null, 2)
                }]
            }
        };
    }

            case "kv_put": {
                const { key, value, expirationTtl } = request.params.arguments as {
                    key: string;
                    value: string;
                    expirationTtl?: number;
                };
                await handlePut(key, value, expirationTtl);
                return {
                    toolResult: {
                        content: [{
                            type: "text",
                            text: `Successfully stored value for key: ${key}`
                        }]
                    }
                };
            }

            case "kv_delete": {
                const { key } = request.params.arguments as { key: string };
                await handleDelete(key);
                return {
                    toolResult: {
                        content: [{
                            type: "text",
                            text: `Successfully deleted key: ${key}`
                        }]
                    }
                };
            }

            case "kv_list": {
                const { prefix, limit } = request.params.arguments as {
                    prefix?: string;
                    limit?: number;
                };
                const results = await handleList(prefix, limit);
                return {
                    toolResult: {
                        content: [{
                            type: "text",
                            text: JSON.stringify(results, null, 2)
                        }]
                    }
                };
            }
            case "worker_list": {
              const results = await handleWorkerList();
              return {
                  toolResult: {
                      content: [{
                          type: "text",
                          text: JSON.stringify(results, null, 2)
                      }]
                  }
              };
          }

          case "worker_get": {
              const { name } = request.params.arguments as { name: string };
              const script = await handleWorkerGet(name);
              return {
                  toolResult: {
                      content: [{
                          type: "text",
                          text: script
                      }]
                  }
              };
          }

          case "worker_put": {
              const { name, script } = request.params.arguments as {
                  name: string;
                  script: string;
              };
              await handleWorkerPut(name, script);
              return {
                  toolResult: {
                      content: [{
                          type: "text",
                          text: `Successfully deployed worker: ${name}`
                      }]
                  }
              };
          }

          case "worker_delete": {
              const { name } = request.params.arguments as { name: string };
              await handleWorkerDelete(name);
              return {
                  toolResult: {
                      content: [{
                          type: "text",
                          text: `Successfully deleted worker: ${name}`
                      }]
                  }
              };
          }


            default:
                throw new Error(`Unknown tool: ${request.params.name}`);
        }
    } catch (error) {
        log('Error handling tool call:', error);
        return {
            toolResult: {
                content: [{
                    type: "text",
                    text: `Error: ${error instanceof Error ? error.message : String(error)}`
                }],
                isError: true
            }
        };
    }
});

// Start server
async function main() {
    log('Starting server...');
    try {
        const transport = new StdioServerTransport();
        log('Created transport');
        await server.connect(transport);
        log('Server connected and running');
    } catch (error) {
        log('Fatal error:', error);
        process.exit(1);
    }
}

// Handle process events
process.on('uncaughtException', (error) => {
    log('Uncaught exception:', error);
});

process.on('unhandledRejection', (error) => {
    log('Unhandled rejection:', error);
});

const [cmd, ...args] = process.argv.slice(2);
if (cmd === 'init') {
  init(args).then(() => console.log("done"))
} else {

  if (!config.accountId || !config.apiToken || !config.namespaceId) {
      log('Missing required environment variables');
      process.exit(1);
  }

  log('Config loaded:', {
      accountId: config.accountId ? '✓' : '✗',
      apiToken: config.apiToken ? '✓' : '✗',
      namespaceId: config.namespaceId ? '✓' : '✗'
  });

  // Start the server
  main();
}
