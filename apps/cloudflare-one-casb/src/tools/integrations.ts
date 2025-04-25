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
} from '@repo/mcp-common/src/api/cf1-integration'
import {
	assetCategoryTypeParam,
	assetCategoryVendorParam,
} from '@repo/mcp-common/src/schemas/cf1-integrations'

import type { CASBMCP } from '../index'

const PAGE_SIZE = 3

// CF1INT Integration Params
const integrationIdParam = z.string().describe('The UUID of the integration to analyze')

// CF1INT Asset Params
const assetSearchTerm = z.string().describe('The search keyword for assets')
const assetIdParam = z.string().describe('The UUID of the asset to analyze')
const assetCategoryIdParam = z.string().describe('The UUID of the asset category to analyze')

// Define types for our tool handlers
type ToolHandler<T extends Record<string, any>> = (
	params: T & { accountId: string; apiToken: string }
) => Promise<any>

interface ToolDefinition<T extends Record<string, any>> {
	name: string
	description: string
	params: Record<string, z.ZodType>
	handler: ToolHandler<T>
}

// Helper function to handle common error cases and account ID checks
const withAccountCheck = <T extends Record<string, any>>(
	agent: CASBMCP,
	handler: ToolHandler<T>
) => {
	return async (params: T) => {
		const accountId = agent.getActiveAccountId()
		if (!accountId) {
			return {
				content: [
					{
						type: 'text' as const,
						text: 'No currently active accountId. Try listing your accounts (accounts_list) and then setting an active account (set_active_account)',
					},
				],
			}
		}

		try {
			const result = await handler({
				...params,
				accountId,
				apiToken: agent.props.accessToken,
			})
			return {
				content: [{ type: 'text' as const, text: JSON.stringify(result) }],
			}
		} catch (error) {
			return {
				content: [
					{
						type: 'text' as const,
						text: JSON.stringify({
							error: `Error processing request: ${error instanceof Error ? error.message : 'Unknown error'}`,
						}),
					},
				],
			}
		}
	}
}

// Tool definitions with their handlers
const toolDefinitions: Array<ToolDefinition<any>> = [
	{
		name: 'integration_by_id',
		description: 'Analyze Cloudflare One Integration by ID',
		params: { integrationIdParam },
		handler: async ({
			integrationIdParam,
			accountId,
			apiToken,
		}: {
			integrationIdParam: string
			accountId: string
			apiToken: string
		}) => {
			const { integration } = await handleIntegrationById({
				integrationIdParam,
				accountId,
				apiToken,
			})
			return { integration }
		},
	},
	{
		name: 'integrations_list',
		description: 'List all Cloudflare One Integrations in a given account',
		params: {},
		handler: async ({ accountId, apiToken }: { accountId: string; apiToken: string }) => {
			console.log('integrations_list', accountId, apiToken)
			const { integrations } = await handleIntegrations({ accountId, apiToken })
			return { integrations }
		},
	},
	{
		name: 'assets_search',
		description: 'Search Assets by keyword',
		params: { assetSearchTerm },
		handler: async ({
			assetSearchTerm,
			accountId,
			apiToken,
		}: {
			assetSearchTerm: string
			accountId: string
			apiToken: string
		}) => {
			const { assets } = await handleAssetsSearch({
				accountId,
				apiToken,
				searchTerm: assetSearchTerm,
				pageSize: PAGE_SIZE,
			})
			return { assets }
		},
	},
	{
		name: 'asset_by_id',
		description: 'Search Assets by ID',
		params: { assetIdParam },
		handler: async ({
			assetIdParam,
			accountId,
			apiToken,
		}: {
			assetIdParam: string
			accountId: string
			apiToken: string
		}) => {
			const { asset } = await handleAssetById({
				accountId,
				apiToken,
				assetId: assetIdParam,
			})
			return { asset }
		},
	},
	{
		name: 'assets_by_integration_id',
		description: 'Search Assets by Integration ID',
		params: { integrationIdParam },
		handler: async ({
			integrationIdParam,
			accountId,
			apiToken,
		}: {
			integrationIdParam: string
			accountId: string
			apiToken: string
		}) => {
			const { assets } = await handleAssetsByIntegrationId({
				accountId,
				apiToken,
				integrationId: integrationIdParam,
				pageSize: PAGE_SIZE,
			})
			return { assets }
		},
	},
	{
		name: 'assets_by_category_id',
		description: 'Search Assets by Asset Category ID',
		params: { assetCategoryIdParam },
		handler: async ({
			assetCategoryIdParam,
			accountId,
			apiToken,
		}: {
			assetCategoryIdParam: string
			accountId: string
			apiToken: string
		}) => {
			const { assets } = await handleAssetsByAssetCategoryId({
				accountId,
				apiToken,
				categoryId: assetCategoryIdParam,
				pageSize: PAGE_SIZE,
			})
			return { assets }
		},
	},
	{
		name: 'assets_list',
		description: 'Paginated list of Assets',
		params: {},
		handler: async ({ accountId, apiToken }: { accountId: string; apiToken: string }) => {
			const { assets } = await handleAssets({
				accountId,
				apiToken,
				pageSize: PAGE_SIZE,
			})
			return { assets }
		},
	},
	{
		name: 'asset_categories_list',
		description: 'List Asset Categories',
		params: {},
		handler: async ({ accountId, apiToken }: { accountId: string; apiToken: string }) => {
			const { categories } = await handleAssetCategories({
				accountId,
				apiToken,
			})
			return { categories }
		},
	},
	{
		name: 'asset_categories_by_vendor',
		description: 'List asset categories by vendor',
		params: { assetCategoryVendorParam },
		handler: async ({
			assetCategoryVendorParam,
			accountId,
			apiToken,
		}: {
			assetCategoryVendorParam: string
			accountId: string
			apiToken: string
		}) => {
			const { categories } = await handleAssetCategories({
				accountId,
				apiToken,
				vendor: assetCategoryVendorParam,
			})
			return { categories }
		},
	},
	{
		name: 'asset_categories_by_type',
		description: 'Search Asset Categories by type',
		params: { assetCategoryTypeParam },
		handler: async ({
			assetCategoryTypeParam,
			accountId,
			apiToken,
		}: {
			assetCategoryTypeParam?: string
			accountId: string
			apiToken: string
		}) => {
			const { categories } = await handleAssetCategories({
				accountId,
				apiToken,
				type: assetCategoryTypeParam,
			})
			return { categories }
		},
	},
	{
		name: 'asset_categories_by_vendor_and_type',
		description: 'Search Asset Categories by vendor and type',
		params: { assetCategoryTypeParam, assetCategoryVendorParam },
		handler: async ({
			assetCategoryTypeParam,
			assetCategoryVendorParam,
			accountId,
			apiToken,
		}: {
			assetCategoryTypeParam?: string
			assetCategoryVendorParam: string
			accountId: string
			apiToken: string
		}) => {
			const { categories } = await handleAssetCategories({
				accountId,
				apiToken,
				type: assetCategoryTypeParam,
				vendor: assetCategoryVendorParam,
			})
			return { categories }
		},
	},
]

/**
 * Registers the logs analysis tool with the MCP server
 * @param agent The MCP server instance
 */
export function registerIntegrationsTools(agent: CASBMCP) {
	toolDefinitions.forEach(({ name, description, params, handler }) => {
		agent.server.tool(name, description, params, withAccountCheck(agent, handler))
	})
}
