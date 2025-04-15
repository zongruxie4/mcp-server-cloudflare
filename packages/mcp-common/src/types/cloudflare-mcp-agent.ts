import { type McpAgent } from 'agents/mcp'

import { type AccountSchema, type UserSchema } from '../cloudflare-oauth-handler'

export type CloudflareMCPAgentState = { activeAccountId: string | null }

export type CloudflareMCPAgentProps = {
	accessToken: string
	user: UserSchema['result']
	accounts: AccountSchema['result']
}

export type CloudflareMcpAgent<EnvType = unknown> = McpAgent<
	EnvType,
	CloudflareMCPAgentState,
	CloudflareMCPAgentProps
> & {
	setActiveAccountId(accountId: string): void
	getActiveAccountId(): string | null
}
