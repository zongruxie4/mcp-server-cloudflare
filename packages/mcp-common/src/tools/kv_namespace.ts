import { type CallToolResult } from '@modelcontextprotocol/sdk/types.js'
import { z } from 'zod'

import {
	handleKVNamespaceCreate,
	handleKVNamespaceDelete,
	handleKVNamespaceGet,
	handleKVNamespacesList,
	handleKVNamespaceUpdate,
} from '../api/kv'
import { getCloudflareClient } from '../cloudflare-api'
import { type CloudflareMcpAgent } from '../types/cloudflare-mcp-agent'

const kvNamespaceTitle = z.string().describe('The title of the kv namespace')
const kvNamespaceId = z.string().describe('The id of the kv namespace')
const MISSING_ACCOUNT_ID_RESPONSE = {
	content: [
		{
			type: 'text',
			text: 'No currently active accountId. Try listing your accounts (accounts_list) and then setting an active account (set_active_account)',
		},
	],
} satisfies CallToolResult

export function registerKVTools(agent: CloudflareMcpAgent) {
	agent.server.tool(
		'kv_namespaces_list',
		'List all of the kv namespaces in your Cloudflare account',
		{},
		async () => {
			const account_id = agent.getActiveAccountId()
			if (!account_id) {
				return MISSING_ACCOUNT_ID_RESPONSE
			}
			try {
				const namespaces = await handleKVNamespacesList({
					client: getCloudflareClient(agent.props.accessToken),
					account_id,
				})

				return {
					content: [
						{
							type: 'text',
							text: JSON.stringify({
								namespaces,
								count: namespaces.length,
							}),
						},
					],
				}
			} catch (error) {
				return {
					content: [
						{
							type: 'text',
							text: `Error listing KV namespaces: ${error instanceof Error && error.message}`,
						},
					],
				}
			}
		}
	)

	agent.server.tool(
		'kv_namespace_create',
		'Create a new kv namespace in your Cloudflare account',
		{ title: kvNamespaceTitle },
		async ({ title }) => {
			const account_id = agent.getActiveAccountId()
			if (!account_id) {
				return MISSING_ACCOUNT_ID_RESPONSE
			}
			try {
				const namespace = await handleKVNamespaceCreate({
					client: getCloudflareClient(agent.props.accessToken),
					account_id,
					title: title,
				})
				return {
					content: [
						{
							type: 'text',
							text: JSON.stringify(namespace),
						},
					],
				}
			} catch (error) {
				return {
					content: [
						{
							type: 'text',
							text: `Error creating KV namespace: ${error instanceof Error && error.message}`,
						},
					],
				}
			}
		}
	)

	agent.server.tool(
		'kv_namespace_delete',
		'Delete a kv namespace in your Cloudflare account',
		{ namespace_id: kvNamespaceId },
		async ({ namespace_id }) => {
			const account_id = agent.getActiveAccountId()
			if (!account_id) {
				return MISSING_ACCOUNT_ID_RESPONSE
			}
			try {
				const namespace = await handleKVNamespaceDelete({
					client: getCloudflareClient(agent.props.accessToken),
					account_id,
					namespace_id,
				})
				return {
					content: [
						{
							type: 'text',
							text: JSON.stringify(namespace),
						},
					],
				}
			} catch (error) {
				return {
					content: [
						{
							type: 'text',
							text: `Error deleting KV namespace: ${error instanceof Error && error.message}`,
						},
					],
				}
			}
		}
	)

	agent.server.tool(
		'kv_namespace_get',
		'Get a kv namespace in your Cloudflare account',
		{ namespace_id: kvNamespaceId },
		async ({ namespace_id }) => {
			const account_id = agent.getActiveAccountId()
			if (!account_id) {
				return MISSING_ACCOUNT_ID_RESPONSE
			}
			try {
				const namespace = await handleKVNamespaceGet({
					client: getCloudflareClient(agent.props.accessToken),
					account_id,
					namespace_id,
				})
				return {
					content: [
						{
							type: 'text',
							text: JSON.stringify(namespace),
						},
					],
				}
			} catch (error) {
				return {
					content: [
						{
							type: 'text',
							text: `Error getting KV namespace: ${error instanceof Error && error.message}`,
						},
					],
				}
			}
		}
	)

	agent.server.tool(
		'kv_namespace_update',
		'Update a kv namespace in your Cloudflare account',
		{
			namespace_id: kvNamespaceId,
			title: kvNamespaceTitle,
		},
		async ({ namespace_id, title }) => {
			const account_id = agent.getActiveAccountId()
			if (!account_id) {
				return MISSING_ACCOUNT_ID_RESPONSE
			}
			try {
				const namespaceUpdateResponse = await handleKVNamespaceUpdate({
					client: getCloudflareClient(agent.props.accessToken),
					account_id,
					namespace_id,
					title,
				})
				return {
					content: [
						{
							type: 'text',
							text: JSON.stringify(namespaceUpdateResponse),
						},
					],
				}
			} catch (error) {
				return {
					content: [
						{
							type: 'text',
							text: `Error updating KV namespace: ${error instanceof Error && error.message}`,
						},
					],
				}
			}
		}
	)
}
