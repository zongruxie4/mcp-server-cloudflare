import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js'

export const MISSING_ACCOUNT_ID_RESPONSE = {
	content: [
		{
			type: 'text',
			text: 'No currently active accountId. Try listing your accounts (accounts_list) and then setting an active account (set_active_account)',
		},
	],
} satisfies CallToolResult
