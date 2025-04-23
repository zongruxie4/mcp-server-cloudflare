import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { McpAgent } from 'agents/mcp'

import { registerDocsTools } from './tools/docs'

// The docs MCP server isn't stateful, so we don't have state/props
export type Props = never

export type State = never

export class CloudflareDocumentationMCP extends McpAgent<Env, State, Props> {
	server = new McpServer({
		name: 'Remote MCP Server with Cloudflare Documentation',
		version: '1.0.0',
	})

	constructor(
		public ctx: DurableObjectState,
		public env: Env
	) {
		super(ctx, env)
	}

	async init() {
		registerDocsTools(this)
	}
}

export default CloudflareDocumentationMCP.mount('/sse')
