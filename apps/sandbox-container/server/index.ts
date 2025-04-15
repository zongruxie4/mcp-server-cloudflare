import OAuthProvider from '@cloudflare/workers-oauth-provider'

import {
	AccountSchema,
	CloudflareAuthHandler,
	handleTokenExchangeCallback,
	UserSchema,
} from '@repo/mcp-common/src/cloudflare-oauth-handler'

import { ContainerManager } from './containerManager'
import { ContainerMcpAgent } from './containerMcp'

export { ContainerManager, ContainerMcpAgent }

export type Env = {
	CONTAINER_MCP_AGENT: DurableObjectNamespace<ContainerMcpAgent>
	CONTAINER_MANAGER: DurableObjectNamespace<ContainerManager>
	ENVIRONMENT: 'dev' | 'prod'
}

// Context from the auth process, encrypted & stored in the auth token
// and provided to the DurableMCP as this.props
export type Props = {
	accessToken: string
	user: UserSchema['result']
	accounts: AccountSchema['result']
}

export default new OAuthProvider({
	apiRoute: '/workers/sandbox/sse',
	// @ts-ignore
	apiHandler: ContainerMcpAgent.mount('/workers/sandbox/sse', { binding: 'CONTAINER_MCP_AGENT' }),
	// @ts-ignore
	defaultHandler: CloudflareAuthHandler,
	authorizeEndpoint: '/oauth/authorize',
	tokenEndpoint: '/token',
	tokenExchangeCallback: handleTokenExchangeCallback,
	// Cloudflare access token TTL
	accessTokenTTL: 3600,
	clientRegistrationEndpoint: '/register',
})
