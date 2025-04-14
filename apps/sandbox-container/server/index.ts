import { Hono } from 'hono'
import { Octokit } from 'octokit'
import OAuthProvider, {
	AuthRequest,
	OAuthHelpers,
} from 'workers-mcp/vendor/workers-oauth-provider/oauth-provider.js'

import { ContainerManager } from './containerManager'
import { ContainerMcpAgent } from './containerMcp'

export { ContainerManager, ContainerMcpAgent }

export type Env = {
	CONTAINER_MCP_AGENT: DurableObjectNamespace<ContainerMcpAgent>
	CONTAINER_MANAGER: DurableObjectNamespace<ContainerManager>
	ENVIRONMENT: 'dev' | 'prod'
}

// TODO: add user specific props
export type Props = {}

const app = new Hono<{ Bindings: Env }>()

export default ContainerMcpAgent.mount('/sse', { binding: 'CONTAINER_MCP_AGENT' })
