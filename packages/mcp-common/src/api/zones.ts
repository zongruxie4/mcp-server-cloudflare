import { z } from "zod";
import { fetchCloudflareApi } from "../cloudflare-api";
import { V4Schema } from "../v4-api";

// Zone schema
type ZoneSchema = z.infer<typeof ZoneSchema>
const ZoneSchema = z.object({
  id: z.string(),
  name: z.string(),
  status: z.string(),
  paused: z.boolean(),
  type: z.string(),
  development_mode: z.number(),
  created_on: z.string().optional(),
  modified_on: z.string().optional(),
});

// Custom domain schema
type CustomDomainSchema = z.infer<typeof CustomDomainSchema>
const CustomDomainSchema = z.object({
  id: z.string(),
  zone_id: z.string().optional(),
  zone_name: z.string().optional(),
  hostname: z.string(),
  service: z.string(),
  environment: z.string().optional(),
  created_on: z.string().optional(),
});

// Response schemas using V4Schema
const ZonesResponseSchema = V4Schema(z.array(ZoneSchema));
const ZoneResponseSchema = V4Schema(ZoneSchema);
const CustomDomainsResponseSchema = V4Schema(z.array(CustomDomainSchema));

/**
 * List all zones in a Cloudflare account
 * @param accountId Cloudflare account ID
 * @param apiToken Cloudflare API token
 * @returns List of zones
 */
export async function handleZonesList({
  apiToken,
}: {
  apiToken: string;
}): Promise<ZoneSchema[]> {
  const url = "https://api.cloudflare.com/client/v4/zones";

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${apiToken}`,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to list zones: ${error}`);
  }

  const data = ZonesResponseSchema.parse(await response.json());
  return data.result ?? [];
}

/**
 * Get details about a specific zone
 * @param zoneId ID of the zone to get details for
 * @param apiToken Cloudflare API token
 * @returns Zone details
 */
export async function handleZoneGet({
  zoneId,
  apiToken,
}: {
  zoneId: string;
  apiToken: string;
}): Promise<ZoneSchema> {
  const url = `https://api.cloudflare.com/client/v4/zones/${zoneId}`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${apiToken}`,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to get zone details: ${error}`);
  }

  const data = ZoneResponseSchema.parse(await response.json());
  return data.result!;
}

/**
 * List custom domains attached to Workers
 * @param accountId Cloudflare account ID
 * @param apiToken Cloudflare API token
 * @returns List of custom domains
 */
export async function handleDomainsList({
  accountId,
  apiToken,
}: {
  accountId: string;
  apiToken: string;
}): Promise<CustomDomainSchema[]> {
  const response = await fetchCloudflareApi({
    endpoint: "/workers/domains",
    accountId,
    apiToken,
    responseSchema: CustomDomainsResponseSchema,
    options: {
      method: "GET",
    },
  });

  return response.result ?? [];
}