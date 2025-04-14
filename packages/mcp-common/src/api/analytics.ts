import { z } from "zod";

// GraphQL error schema
const GraphQLErrorSchema = z.object({
  message: z.string(),
  locations: z
    .array(
      z.object({
        line: z.number(),
        column: z.number(),
      })
    )
    .optional(),
  path: z.array(z.string()).optional(),
  extensions: z.record(z.any()).optional(),
});

// GraphQL response schema
const GraphQLResponseSchema = z.object({
  data: z.any().optional(),
  errors: z.array(GraphQLErrorSchema).optional(),
});

/**
 * Get zone analytics data from Cloudflare GraphQL API
 * @param zoneId The zone ID to get analytics for
 * @param apiToken Cloudflare API token
 * @param since Optional start time for analytics (ISO string)
 * @returns Analytics data for the specified zone
 */
export async function handleGetZoneAnalytics({
  zoneId,
  apiToken,
  since,
}: {
  zoneId: string;
  apiToken: string;
  since?: string;
}): Promise<any> {
  const date = since ? new Date(since).toISOString().split("T")[0] : new Date().toISOString().split("T")[0];

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
  };

  const analyticsResponse = await fetch("https://api.cloudflare.com/client/v4/graphql", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(graphqlQuery),
  });

  if (!analyticsResponse.ok) {
    throw new Error(`Analytics API error: ${await analyticsResponse.text()}`);
  }

  const analyticsData = GraphQLResponseSchema.parse(await analyticsResponse.json());

  // Check for GraphQL errors
  if (analyticsData.errors) {
    throw new Error(`GraphQL error: ${JSON.stringify(analyticsData.errors)}`);
  }

  return analyticsData.data;
}

/**
 * Search Workers analytics data for a specific time period
 * @param accountId Cloudflare account ID
 * @param apiToken Cloudflare API token
 * @param scriptName Optional name of the Worker script to search for
 * @param startTime Optional start time for analytics search (ISO string)
 * @param endTime Optional end time for analytics search (ISO string)
 * @param limit Optional maximum number of results to return (default: 100)
 * @param status Optional filter by status (e.g., "success", "error")
 * @returns Workers analytics data for the specified criteria
 */
export async function handleWorkersAnalyticsSearch({
  accountId,
  apiToken,
  scriptName,
  startTime,
  endTime,
  limit,
  status,
}: {
  accountId: string;
  apiToken: string;
  scriptName?: string;
  startTime?: string;
  endTime?: string;
  limit?: number;
  status?: string;
}): Promise<any> {
  // Set default time range if not provided (last 24 hours)
  const now = new Date();
  const defaultEndTime = now.toISOString();
  const defaultStartTime = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();

  const datetimeStart = startTime || defaultStartTime;
  const datetimeEnd = endTime || defaultEndTime;
  const resultLimit = limit || 100;

  // Build filter object for the GraphQL query
  const filter: Record<string, any> = {
    datetime_geq: datetimeStart,
    datetime_leq: datetimeEnd,
  };

  // Add optional filters if provided
  if (scriptName) {
    filter.scriptName = scriptName;
  }

  if (status) {
    filter.status = status;
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
      filter: filter,
    },
  };

  const analyticsResponse = await fetch("https://api.cloudflare.com/client/v4/graphql", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(graphqlQuery),
  });

  if (!analyticsResponse.ok) {
    throw new Error(`Workers Analytics API error: ${await analyticsResponse.text()}`);
  }

  const analyticsData = GraphQLResponseSchema.parse(await analyticsResponse.json());

  // Check for GraphQL errors
  if (analyticsData.errors) {
    throw new Error(`GraphQL error: ${JSON.stringify(analyticsData.errors)}`);
  }

  return analyticsData.data;
}