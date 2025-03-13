import { Tool } from '@modelcontextprotocol/sdk/types.js'
import { fetch } from 'undici'
import { config } from '../utils/helpers'
import { ToolHandlers } from '../utils/types'

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

const WORKERS_ANALYTICS_SEARCH_TOOL: Tool = {
  name: 'workers_analytics_search',
  description: 'Search Workers analytics data for a specific time period',
  inputSchema: {
    type: 'object',
    properties: {
      accountId: {
        type: 'string',
        description: 'The Cloudflare account ID',
      },
      scriptName: {
        type: 'string',
        description: 'The name of the Worker script to search for (optional)',
      },
      startTime: {
        type: 'string',
        description: 'Start time for analytics search (ISO string)',
      },
      endTime: {
        type: 'string',
        description: 'End time for analytics search (ISO string)',
      },
      limit: {
        type: 'number',
        description: 'Maximum number of results to return (default: 100)',
      },
      status: {
        type: 'string',
        description: 'Filter by status (e.g., "success", "error")',
      }
    },
    required: ['accountId'],
  },
}

export const ANALYTICS_TOOLS = [ANALYTICS_GET_TOOL, WORKERS_ANALYTICS_SEARCH_TOOL]

interface GraphQLResponse {
  data?: any;
  errors?: Array<{
    message: string;
    locations?: Array<{
      line: number;
      column: number;
    }>;
    path?: string[];
    extensions?: Record<string, any>;
  }>;
}

export const ANALYTICS_HANDLERS: ToolHandlers = {
  analytics_get: async (request) => {
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

    const analyticsData = await analyticsResponse.json() as GraphQLResponse
    
    // Check for GraphQL errors
    if (analyticsData.errors) {
      throw new Error(`GraphQL error: ${JSON.stringify(analyticsData.errors)}`)
    }
    
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
  },
  
  workers_analytics_search: async (request) => {
    const { accountId, scriptName, startTime, endTime, limit, status } = request.params.arguments as {
      accountId: string
      scriptName?: string
      startTime?: string
      endTime?: string
      limit?: number
      status?: string
    }
    
    // Set default time range if not provided (last 24 hours)
    const now = new Date()
    const defaultEndTime = now.toISOString()
    const defaultStartTime = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString()
    
    const datetimeStart = startTime || defaultStartTime
    const datetimeEnd = endTime || defaultEndTime
    const resultLimit = limit || 100
    
    // Build filter object for the GraphQL query
    const filter: Record<string, any> = {
      datetime_geq: datetimeStart,
      datetime_leq: datetimeEnd
    }
    
    // Add optional filters if provided
    if (scriptName) {
      filter.scriptName = scriptName
    }
    
    if (status) {
      filter.status = status
    }
    
    // Construct the GraphQL query
    const graphqlQuery = {
      query: `
        query GetWorkersAnalytics($accountTag: String!, $limit: Int!, $filter: WorkersInvocationsAdaptiveFilter_InputObject!) {
          viewer {
            accounts(filter: {accountTag: $accountTag}) {
              workersInvocationsAdaptive(limit: $limit, filter: $filter) {
                sum {
                  subrequests
                  requests
                  errors
                }
                quantiles {
                  cpuTimeP50
                  cpuTimeP99
                }
                dimensions {
                  datetime
                  scriptName
                  status
                }
              }
            }
          }
        }
      `,
      variables: {
        accountTag: accountId,
        limit: resultLimit,
        filter: filter
      }
    }

    try {
      const analyticsResponse = await fetch('https://api.cloudflare.com/client/v4/graphql', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${config.apiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(graphqlQuery),
      })

      if (!analyticsResponse.ok) {
        throw new Error(`Workers Analytics API error: ${await analyticsResponse.text()}`)
      }

      const analyticsData = await analyticsResponse.json() as GraphQLResponse
      
      // Check for GraphQL errors
      if (analyticsData.errors) {
        throw new Error(`GraphQL error: ${JSON.stringify(analyticsData.errors)}`)
      }
      
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
    } catch (error) {
      return {
        toolResult: {
          content: [
            {
              type: 'text',
              text: `Error fetching Workers analytics: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
          isError: true,
        },
      }
    }
  },
}
