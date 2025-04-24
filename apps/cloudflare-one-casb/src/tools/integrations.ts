import { z } from 'zod'

import {
	handleAssetById,
	handleAssetCategories,
	handleAssets,
	handleAssetsByAssetCategoryId,
	handleAssetsByIntegrationId,
	handleAssetsSearch,
	handleIntegrationById,
	handleIntegrations,
} from '@repo/mcp-common/src/api/cf1_integration'

import type { MyMCP } from '../index'

const PAGE_SIZE = 3

// CF1INT Integration Params
const integrationIdParam = z.string().describe('The UUID of the integration to analyze')

// CF1INT Asset Params
const assetSearchTerm = z.string().describe('The search keyword for assets')
const assetIdParam = z.string().describe('The UUID of the asset to analyze')
const assetCategoryIdParam = z.string().describe('The UUID of the asset category to analyze')

const assetCategoryTypeParam = z
	.enum([
		'Account',
		'Alert',
		'App',
		'Authentication Method',
		'Bucket',
		'Bucket Iam Permission',
		'Bucket Permission',
		'Calendar',
		'Certificate',
		'Channel',
		'Commit',
		'Content',
		'Credential',
		'Domain',
		'Drive',
		'Environment',
		'Factor',
		'File',
		'File Permission',
		'Folder',
		'Group',
		'Incident',
		'Instance',
		'Issue',
		'Label',
		'Meeting',
		'Message',
		'Message Rule',
		'Namespace',
		'Organization',
		'Package',
		'Pipeline',
		'Project',
		'Report',
		'Repository',
		'Risky User',
		'Role',
		'Server',
		'Site',
		'Space',
		'Submodule',
		'Third Party User',
		'User',
		'User No Mfa',
		'Variable',
		'Webhook',
		'Workspace',
	])
	.optional()
	.describe('Type of cloud resource or service category')

const assetCategoryVendorParam = z
	.enum([
		'AWS',
		'Bitbucket',
		'Box',
		'Confluence',
		'Dropbox',
		'GitHub',
		'Google Cloud Platform',
		'Google Workspace',
		'Jira',
		'Microsoft',
		'Microsoft Azure',
		'Okta',
		'Salesforce',
		'ServiceNow',
		'Slack',
		'Workday',
		'Zoom',
	])
	.describe('Vendor of the cloud service or resource')

/**
 * Registers the logs analysis tool with the MCP server
 * @param server The MCP server instance
 * @param accountId Cloudflare account ID
 * @param apiToken Cloudflare API token
 */
export function registerIntegrationsTools(agent: MyMCP, globalApiKey: string) {
	// Register the integration
	agent.server.tool(
		'integration_by_id',
		'Analyze Cloudflare One Integration by ID',
		{ integrationIdParam },
		async (params) => {
			const accountId = agent.getActiveAccountId()
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
				const { integrationIdParam } = params
				const { integration } = await handleIntegrationById({
					integrationIdParam,
					accountId,
					apiToken: globalApiKey,
				})
				return {
					content: [
						{
							type: 'text',
							text: JSON.stringify({
								integration,
							}),
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
		'integrations_list',
		'List all Cloudflare One Integrations in a given account',
		{},
		async () => {
			console.log('ACCESS TOKEN: ', agent.props.accessToken)
			const accountId = agent.getActiveAccountId()
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
				const { integrations } = await handleIntegrations({ accountId, apiToken: globalApiKey })
				return {
					content: [{ type: 'text', text: JSON.stringify({ integrations }) }],
				}
			} catch (error) {
				return {
					content: [
						{
							type: 'text',
							text: JSON.stringify({
								error: `Error analyzing integrations: ${error instanceof Error && error.message}`,
							}),
						},
					],
				}
			}
		}
	)

	agent.server.tool(
		'assets_search',
		'Search Assets by keyword',
		{ assetSearchTerm },
		async (params) => {
			const accountId = agent.getActiveAccountId()
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
				const { assets } = await handleAssetsSearch({
					accountId,
					apiToken: globalApiKey,
					searchTerm: params.assetSearchTerm,
					pageSize: PAGE_SIZE,
				})
				return {
					content: [{ type: 'text', text: JSON.stringify({ assets }) }],
				}
			} catch (error) {
				return {
					content: [
						{
							type: 'text',
							text: JSON.stringify({
								error: `Error analyzing assets: ${error instanceof Error && error.message}`,
							}),
						},
					],
				}
			}
		}
	)

	agent.server.tool('asset_by_id', 'Search Assets by ID', { assetIdParam }, async (params) => {
		const accountId = agent.getActiveAccountId()
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
			const { asset } = await handleAssetById({
				accountId,
				apiToken: globalApiKey,
				assetId: params.assetIdParam,
			})
			return {
				content: [{ type: 'text', text: JSON.stringify({ asset }) }],
			}
		} catch (error) {
			return {
				content: [
					{
						type: 'text',
						text: JSON.stringify({
							error: `Error analyzing assets: ${error instanceof Error && error.message}`,
						}),
					},
				],
			}
		}
	})

	agent.server.tool(
		'assets_by_integration_id',
		'Search Assets by Integration ID',
		{ integrationIdParam },
		async (params) => {
			const accountId = agent.getActiveAccountId()
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
				const { assets } = await handleAssetsByIntegrationId({
					accountId,
					apiToken: globalApiKey,
					integrationId: params.integrationIdParam,
					pageSize: PAGE_SIZE,
				})
				return {
					content: [{ type: 'text', text: JSON.stringify({ assets }) }],
				}
			} catch (error) {
				return {
					content: [
						{
							type: 'text',
							text: JSON.stringify({
								error: `Error analyzing assets: ${error instanceof Error && error.message}`,
							}),
						},
					],
				}
			}
		}
	)

	agent.server.tool(
		'assets_by_category_id',
		'Search Assets by Asset Category ID',
		{ assetCategoryIdParam },
		async (params) => {
			const accountId = agent.getActiveAccountId()
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
				const { assets } = await handleAssetsByAssetCategoryId({
					accountId,
					apiToken: globalApiKey,
					categoryId: params.assetCategoryIdParam,
					pageSize: PAGE_SIZE,
				})
				return {
					content: [{ type: 'text', text: JSON.stringify({ assets }) }],
				}
			} catch (error) {
				return {
					content: [
						{
							type: 'text',
							text: JSON.stringify({
								error: `Error analyzing assets: ${error instanceof Error && error.message}`,
							}),
						},
					],
				}
			}
		}
	)

	agent.server.tool('assets_list', 'Paginated list of Assets', {}, async (params) => {
		const accountId = agent.getActiveAccountId()
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
			const { assets } = await handleAssets({
				accountId,
				apiToken: globalApiKey,
				pageSize: PAGE_SIZE,
			})
			return {
				content: [{ type: 'text', text: JSON.stringify({ assets }) }],
			}
		} catch (error) {
			return {
				content: [
					{
						type: 'text',
						text: JSON.stringify({
							error: `Error analyzing assets: ${error instanceof Error && error.message}`,
						}),
					},
				],
			}
		}
	})

	agent.server.tool('asset_categories_list', 'List Asset Categories', {}, async () => {
		const accountId = agent.getActiveAccountId()
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
			const { categories } = await handleAssetCategories({
				accountId,
				apiToken: globalApiKey,
			})
			return {
				content: [{ type: 'text', text: JSON.stringify({ categories }) }],
			}
		} catch (error) {
			return {
				content: [
					{
						type: 'text',
						text: JSON.stringify({
							error: `Error analyzing assets: ${error instanceof Error && error.message}`,
						}),
					},
				],
			}
		}
	})

	agent.server.tool(
		'asset_categories_by_vendor',
		'List asset categories by vendor',
		{ assetCategoryVendorParam },
		async (params) => {
			const accountId = agent.getActiveAccountId()
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
				const { categories } = await handleAssetCategories({
					accountId,
					apiToken: globalApiKey,
					vendor: params.assetCategoryVendorParam,
				})
				return {
					content: [{ type: 'text', text: JSON.stringify({ categories }) }],
				}
			} catch (error) {
				return {
					content: [
						{
							type: 'text',
							text: JSON.stringify({
								error: `Error analyzing assets: ${error instanceof Error && error.message}`,
							}),
						},
					],
				}
			}
		}
	)

	agent.server.tool(
		'asset_categories_by_type',
		'Search Asset Categories by type',
		{ assetCategoryTypeParam },
		async (params) => {
			const accountId = agent.getActiveAccountId()
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
				const { categories } = await handleAssetCategories({
					accountId,
					apiToken: globalApiKey,
					type: params.assetCategoryTypeParam,
				})
				return {
					content: [{ type: 'text', text: JSON.stringify({ categories }) }],
				}
			} catch (error) {
				return {
					content: [
						{
							type: 'text',
							text: JSON.stringify({
								error: `Error analyzing assets: ${error instanceof Error && error.message}`,
							}),
						},
					],
				}
			}
		}
	)

	agent.server.tool(
		'asset_categories_by_vendor_and_type',
		'Search Asset Categories by vendor and type',
		{ assetCategoryTypeParam, assetCategoryVendorParam },
		async (params) => {
			const accountId = agent.getActiveAccountId()
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
				const { categories } = await handleAssetCategories({
					accountId,
					apiToken: globalApiKey,
					type: params.assetCategoryTypeParam,
					vendor: params.assetCategoryVendorParam,
				})
				return {
					content: [{ type: 'text', text: JSON.stringify({ categories }) }],
				}
			} catch (error) {
				return {
					content: [
						{
							type: 'text',
							text: JSON.stringify({
								error: `Error analyzing assets: ${error instanceof Error && error.message}`,
							}),
						},
					],
				}
			}
		}
	)
}
