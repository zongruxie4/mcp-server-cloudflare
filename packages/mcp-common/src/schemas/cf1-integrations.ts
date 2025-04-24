import { z } from 'zod'

const Vendor = z.object({
	id: z.string(),
	name: z.string(),
	display_name: z.string(),
	description: z.string().nullable(),
	logo: z.string().nullable(),
	static_logo: z.string().nullable(),
})

const Policy = z.object({
	id: z.string(),
	name: z.string(),
	permissions: z.array(z.string()),
	link: z.string().nullable(),
	dlp_enabled: z.boolean(),
})

// Base Integration schema
export const Integration = z.object({
	id: z.string(),
	name: z.string(),
	status: z.enum(['Healthy', 'Unhealthy', 'Initializing', 'Paused']),
	upgradable: z.boolean(),
	permissions: z.array(z.string()),

	vendor: Vendor,
	policy: Policy,

	created: z.string(),
	updated: z.string(),
	credentials_expiry: z.string().nullable(),
	last_hydrated: z.string().nullable(),
})

// Schema for output: a single integration
export const IntegrationResponse = Integration
export type zReturnedIntegrationResult = z.infer<typeof IntegrationResponse>

// Schema for output: multiple integrations
export const IntegrationsResponse = z.array(Integration)
export type zReturnedIntegrationsResult = z.infer<typeof IntegrationsResponse>

export const AssetCategory = z.object({
	id: z.string().uuid(),
	type: z.string(),
	vendor: z.string(),
	service: z.string().nullable(),
})

export const AssetDetail = z.object({
	id: z.string().uuid(),
	external_id: z.string(),
	name: z.string(),
	link: z.string().nullable(),
	fields: z.array(
		z.object({
			link: z.string().nullable(),
			name: z.string(),
			value: z.any(),
		})
	),
	category: AssetCategory,
	integration: Integration,
})

export type zReturnedAssetResult = z.infer<typeof AssetDetail>

export const AssetsResponse = z.array(AssetDetail)
export type zReturnedAssetsResult = z.infer<typeof AssetsResponse>

export const AssetCategoriesResponse = z.array(AssetCategory)
export type zReturnedAssetCategoriesResult = z.infer<typeof AssetCategoriesResponse>
