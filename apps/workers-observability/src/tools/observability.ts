import {
	handleWorkerLogsKeys,
	handleWorkerLogsValues,
	queryWorkersObservability,
} from '@repo/mcp-common/src/api/workers-observability'
import {
	zKeysRequest,
	zQueryRunRequest,
	zValuesRequest,
} from '@repo/mcp-common/src/types/workers-logs-schemas'

import type { ObservabilityMCP } from '../index'

/**
 * Registers the logs analysis tool with the MCP server
 * @param server The MCP server instance
 * @param accountId Cloudflare account ID
 * @param apiToken Cloudflare API token
 */
export function registerObservabilityTools(agent: ObservabilityMCP) {
	// Register the worker logs analysis tool by worker name
	agent.server.tool(
		'query_worker_observability',
		`Query the Workers Observability API to analyze logs and metrics from your Cloudflare Workers.

The resulting information should answer the users query. STOP HERE and show them the answer to there question.
If you can't answer the question ask for a follow up.

## Output handling

Once you have ran this query you must IMMEDIATELY present the user with this information.

- **Events**: Display as a table with key fields. For detailed inspection, show full JSON of individual events.
- **Calculations**: Use appropriate charts based on the data (bar charts for comparisons, line charts for time series)
- **Invocations**: Show full request/response details with syntax highlighting for important fields

## When to Use This tool

- Investigate errors or performance issues in your Cloudflare Workers
- Monitor Worker usage patterns and resource consumption
- Debug specific request failures or unexpected behaviors
- Verify recent deployments are working as expected
- Generate performance reports for specific Workers or endpoints
- Track down user-reported issues with request ID or user information
- Analyze trends in response times, error rates, or request volumes

## Core Capabilities
This tool provides three primary views of your Worker data:
1. **List Events** - Browse individual request logs and errors
2. **Calculate Metrics** - Compute statistics across requests (avg, p99, etc.)
3. **Find Specific Invocations** - Locate individual requests matching criteria

## Filtering Best Practices
- Before applying filters, use the observability_keys and observability_values tools to confirm available filter fields and the correct filter value to add unless you have the data in a response from a previous query.
- Common filter fields:  $metadata.service, $metadata.trigger, $metadata.message, $metadata.level, $metadata.requestId,

## Calculation Best Practices
- Before applying calculations, use the observability_keys tools to confirm key that should be used for the calculation

## Troubleshooting
- If no results are returned, suggest broadening the time range or relaxing filters
- For errors about invalid fields, recommend using observability_keys to see available options
`,

		{
			query: zQueryRunRequest,
		},
		async ({ query }) => {
			const accountId = await agent.getActiveAccountId()
			if (!accountId) {
				return {
					content: [
						{
							type: 'text',
							text: 'No currently active accountId. Try listing your accounts (accounts_list) and then setting an active account (set_active_account)',
						},
					],
				}
			}
			try {
				const response = await queryWorkersObservability(agent.props.accessToken, accountId, query)
				return {
					content: [
						{
							type: 'text',
							text: JSON.stringify(response),
						},
					],
				}
			} catch (error) {
				return {
					content: [
						{
							type: 'text',
							text: JSON.stringify({
								error: `Error analyzing worker logs: ${error instanceof Error && error.message}`,
							}),
						},
					],
				}
			}
		}
	)

	agent.server.tool(
		'observability_keys',
		`Find keys in the Workers Observability Data.

## When to Use This Tool
- Before creating new queries to discover available data fields
- When building complex filters to verify field names exist
- To explore the schema of your Workers data
- When troubleshooting "invalid field" errors in queries
- To discover metrics fields available for calculations

## Core Capabilities
This tool provides a comprehensive view of available data fields:
1. **Discover Schema** - Explore what fields exist in your Workers data
2. **Validate Fields** - Confirm field names before using them in filters
3. **Understand Data Types** - Learn the type of each field for proper filtering

## Best Practices
- Set a high limit (1000+) to ensure you see all available keys
- Add the $metadata.service filter to narrow results to a specific Worker
- Use this tool before a query with unfamiliar fields
- Pay attention to field data types when crafting filters

## Common Key Categories
- $metadata.* fields: Core Worker metadata including service name, level, etc.
- $workers.* fields: Worker-specific metadata like request ID, trigger type, etc.
- custom fields: Any fields added via console.log in your Worker code

## Troubleshooting
- If expected fields are missing, verify the Worker is actively logging
- For empty results, try broadening your time range
`,
		{ keysQuery: zKeysRequest },
		async ({ keysQuery }) => {
			const accountId = await agent.getActiveAccountId()
			if (!accountId) {
				return {
					content: [
						{
							type: 'text',
							text: 'No currently active accountId. Try listing your accounts (accounts_list) and then setting an active account (set_active_account)',
						},
					],
				}
			}
			try {
				const result = await handleWorkerLogsKeys(agent.props.accessToken, accountId, keysQuery)
				return {
					content: [
						{
							type: 'text',
							text: JSON.stringify(result),
						},
					],
				}
			} catch (error) {
				return {
					content: [
						{
							type: 'text',
							text: JSON.stringify({
								error: `Error retrieving worker telemetry keys: ${error instanceof Error && error.message}`,
							}),
						},
					],
				}
			}
		}
	)

	agent.server.tool(
		'observability_values',
		`Find values in the Workers Observability Data.

## When to Use This Tool
- When building complex queries requiring exact value matches

## Best Practices
- Always specify the correct data type (string, number, boolean)
- Use needle parameter with matchCase:false for case-insensitive searches
- Combine with filters to focus on specific Workers or time periods
- When dealing with high-cardinality fields, use more specific filters

## Troubleshooting
- For no results, verify the field exists using observability_keys first
- If expected values are missing, try broadening your time range`,
		{ valuesQuery: zValuesRequest },
		async ({ valuesQuery }) => {
			const accountId = await agent.getActiveAccountId()
			if (!accountId) {
				return {
					content: [
						{
							type: 'text',
							text: 'No currently active accountId. Try listing your accounts (accounts_list) and then setting an active account (set_active_account)',
						},
					],
				}
			}
			try {
				const result = await handleWorkerLogsValues(agent.props.accessToken, accountId, valuesQuery)
				return {
					content: [
						{
							type: 'text',
							text: JSON.stringify(result),
						},
					],
				}
			} catch (error) {
				return {
					content: [
						{
							type: 'text',
							text: JSON.stringify({
								error: `Error retrieving worker telemetry values: ${error instanceof Error && error.message}`,
							}),
						},
					],
				}
			}
		}
	)
}
