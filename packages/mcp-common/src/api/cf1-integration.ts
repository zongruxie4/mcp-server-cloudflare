import { fetchCloudflareApi } from '../cloudflare-api'
import {
	AssetCategoriesResponse,
	AssetDetail,
	AssetsResponse,
	IntegrationResponse,
	IntegrationsResponse,
	zReturnedAssetCategoriesResult,
	zReturnedAssetsResult,
	zReturnedIntegrationResult,
	zReturnedIntegrationsResult,
} from '../schemas/cf1-integrations'
import { V4Schema } from '../v4-api'

/**
 * Fetches integration by ID for a specified Cloudflare One Integration
 * @param intgerationIdParam ID of the CF1 Integration to get
 * @param accountId Cloudflare account ID
 * @param apiToken Cloudflare API token
 * @returns The integration result or null
 */
export async function handleIntegrationById({
	accountId,
	apiToken,
	integrationIdParam,
}: {
	accountId: string
	apiToken: string
	integrationIdParam: string
}): Promise<{ integration: zReturnedIntegrationResult | null }> {
	const data = await fetchCloudflareApi({
		endpoint: `/casb/integrations/${integrationIdParam}`,
		accountId,
		apiToken,
		responseSchema: V4Schema(IntegrationResponse),
		options: {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
			},
		},
	})

	return { integration: data.result }
}

/**
 * Fetches all integrations in a given CF1 Account.
 * @param accountId Cloudflare account ID
 * @param apiToken Cloudflare API token
 * @returns The logs analysis result with filtered relevant information
 */
export async function handleIntegrations({
	accountId,
	apiToken,
}: {
	accountId: string
	apiToken: string
}): Promise<{ integrations: zReturnedIntegrationsResult | null }> {
	const data = await fetchCloudflareApi({
		endpoint: `/casb/integrations`,
		accountId,
		apiToken,
		responseSchema: V4Schema(IntegrationsResponse),
		options: {
			method: 'GET',
			headers: { 'Content-Type': 'application/json' },
		},
	})

	return { integrations: data.result }
}

export async function handleAssetCategories({
	accountId,
	apiToken,

	type,
	vendor,
}: {
	accountId: string
	apiToken: string

	type?: string
	vendor?: string
}): Promise<{ categories: zReturnedAssetCategoriesResult | null }> {
	const params = new URLSearchParams()
	if (vendor) params.append('vendor', vendor)
	if (type) params.append('type', type)

	console.log('\n\n\n', params, '\n\n\n')

	const data = await fetchCloudflareApi({
		endpoint: `/casb/asset_categories?${params.toString()}`,
		accountId,
		apiToken,
		responseSchema: V4Schema(AssetCategoriesResponse),
		options: {
			method: 'GET',
			headers: { 'Content-Type': 'application/json' },
		},
	})

	return { categories: data.result }
}

// Base handler for asset-related operations
async function handleAssetRequest({
	accountId,
	apiToken,
	endpoint,
	params,
}: {
	accountId: string
	apiToken: string
	endpoint: string
	params?: URLSearchParams
}): Promise<{ assets: zReturnedAssetsResult }> {
	const fullEndpoint = `/casb${endpoint}?${params?.toString()}`
	console.log('ENDPOINT: ', fullEndpoint)
	const data = await fetchCloudflareApi({
		endpoint: fullEndpoint,
		accountId,
		apiToken,
		responseSchema: V4Schema(AssetsResponse),
		options: {
			method: 'GET',
			headers: { 'Content-Type': 'application/json' },
		},
	})

	console.log('ASSETS DATA: ', data)

	return { assets: data?.result || [] }
}

// Get all assets with optional pagination and filters
export async function handleAssets({
	accountId,
	apiToken,
	page,
	pageSize,
}: {
	accountId: string
	apiToken: string
	page?: number
	pageSize?: number
}) {
	const params = new URLSearchParams()
	if (page) params.append('page', String(page))
	if (pageSize) params.append('page_size', String(pageSize))

	const { assets } = await handleAssetRequest({
		accountId,
		apiToken,
		endpoint: '/assets',
		params,
	})

	return { assets }
}

// Get assets by integration ID
export async function handleAssetsByIntegrationId({
	accountId,
	apiToken,
	integrationId,
	page,
	pageSize,
}: {
	accountId: string
	apiToken: string
	integrationId: string
	page?: number
	pageSize?: number
}) {
	const params = new URLSearchParams({ integration_id: integrationId })
	if (page) params.append('page', String(page))
	if (pageSize) params.append('page_size', String(pageSize))

	const { assets } = await handleAssetRequest({
		accountId,
		apiToken,
		endpoint: '/assets',
		params,
	})

	return { assets }
}

// Get single asset by ID
export async function handleAssetById({
	accountId,
	apiToken,
	assetId,
}: {
	accountId: string
	apiToken: string
	assetId: string
}) {
	const data = await fetchCloudflareApi({
		endpoint: `/casb/assets/${assetId}`,
		accountId,
		apiToken,
		responseSchema: V4Schema(AssetDetail),
		options: {
			method: 'GET',
			headers: { 'Content-Type': 'application/json' },
		},
	})

	console.log('RAW DATA: ', data)

	return { asset: data.result }
}

// Get assets by category ID
export async function handleAssetsByAssetCategoryId({
	accountId,
	apiToken,
	categoryId,
	page,
	pageSize,
}: {
	accountId: string
	apiToken: string
	categoryId: string
	page?: number
	pageSize?: number
}) {
	const params = new URLSearchParams({ category_id: categoryId })
	if (page) params.append('page', String(page))
	if (pageSize) params.append('page_size', String(pageSize))

	const { assets } = await handleAssetRequest({
		accountId,
		apiToken,
		endpoint: '/assets',
		params,
	})

	return { assets }
}

// Search assets
export async function handleAssetsSearch({
	accountId,
	apiToken,
	searchTerm,
	page,
	pageSize,
}: {
	accountId: string
	apiToken: string
	searchTerm: string
	page?: number
	pageSize?: number
}) {
	const params = new URLSearchParams({ search: searchTerm })
	if (page) params.append('page', String(page))
	if (pageSize) params.append('page_size', String(pageSize))

	const { assets } = await handleAssetRequest({
		accountId,
		apiToken,
		endpoint: '/assets',
		params,
	})

	return { assets }
}
