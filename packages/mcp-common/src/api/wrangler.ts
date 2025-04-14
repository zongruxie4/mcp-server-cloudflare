import { z } from "zod";
import { fetchCloudflareApi } from "../cloudflare-api";
import { V4Schema } from "../v4-api";

// Schema definitions
type WranglerConfigSchema = z.infer<typeof WranglerConfigSchema>
const WranglerConfigSchema = z.object({
  content: z.string(),
  // Adding additional fields as they may be present in the API response
  last_updated: z.string().optional(),
  etag: z.string().optional(),
});

// Response schemas using V4Schema
const WranglerConfigResponseSchema = V4Schema(WranglerConfigSchema);

/**
 * Gets the wrangler.toml configuration for a Worker script
 * @param scriptName The name of the Worker script
 * @param accountId Cloudflare account ID
 * @param apiToken Cloudflare API token
 * @returns The wrangler.toml configuration
 */
export async function handleWranglerConfigGet({
  scriptName,
  accountId,
  apiToken,
}: {
  scriptName: string;
  accountId: string;
  apiToken: string;
}): Promise<WranglerConfigSchema | null> {
  const response = await fetchCloudflareApi({
    endpoint: `/workers/scripts/${scriptName}/config`,
    accountId,
    apiToken,
    responseSchema: WranglerConfigResponseSchema,
    options: {
      method: "GET",
    },
  });

  return response.result;
}

/**
 * Updates the wrangler.toml configuration for a Worker script
 * @param scriptName The name of the Worker script
 * @param configContent The new wrangler.toml configuration content
 * @param accountId Cloudflare account ID
 * @param apiToken Cloudflare API token
 * @returns The updated wrangler.toml configuration
 */
export async function handleWranglerConfigUpdate({
  scriptName,
  configContent,
  accountId,
  apiToken,
}: {
  scriptName: string;
  configContent: string;
  accountId: string;
  apiToken: string;
}): Promise<WranglerConfigSchema | null> {
  const response = await fetchCloudflareApi({
    endpoint: `/workers/scripts/${scriptName}/config`,
    accountId,
    apiToken,
    responseSchema: WranglerConfigResponseSchema,
    options: {
      method: "PUT",
      headers: {
        "Content-Type": "application/toml",
      },
      body: configContent,
    },
  });

  return response.result;
}