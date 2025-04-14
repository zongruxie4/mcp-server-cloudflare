import { z } from "zod";
import { fetchCloudflareApi } from "../cloudflare-api";
import { V4Schema } from "../v4-api";

// Version schema
type VersionSchema = z.infer<typeof VersionSchema>
const VersionSchema = z.object({
  id: z.string(),
  tag: z.string().optional(),
  created_on: z.string(),
  modified_on: z.string().optional(),
  message: z.string().optional(),
});

// Version details schema (extends basic version info with content)
type VersionDetailsSchema = z.infer<typeof VersionDetailsSchema>
const VersionDetailsSchema = VersionSchema.extend({
  script: z.string().optional(),
  handlers: z.array(z.string()).optional(),
  bindings: z.record(z.any()).optional(),
});

// Rollback result schema
type RollbackResultSchema = z.infer<typeof RollbackResultSchema>
const RollbackResultSchema = z.object({
  id: z.string(),
  success: z.boolean(),
  old_version: z.string().optional(),
  new_version: z.string(),
});

// Response schemas using V4Schema
const VersionsResponseSchema = V4Schema(z.array(VersionSchema));
const VersionDetailsResponseSchema = V4Schema(VersionDetailsSchema);
const RollbackResponseSchema = V4Schema(RollbackResultSchema);

/**
 * List versions of a Worker
 * @param scriptName The name of the Worker script
 * @param accountId Cloudflare account ID
 * @param apiToken Cloudflare API token
 * @returns List of versions
 */
export async function handleVersionList({
  scriptName,
  accountId,
  apiToken,
}: {
  scriptName: string;
  accountId: string;
  apiToken: string;
}): Promise<VersionSchema[]> {
  const response = await fetchCloudflareApi({
    endpoint: `/workers/scripts/${scriptName}/versions`,
    accountId,
    apiToken,
    responseSchema: VersionsResponseSchema,
    options: {
      method: "GET",
    },
  });

  return response.result ?? [];
}

/**
 * Get a specific version of a Worker
 * @param scriptName The name of the Worker script
 * @param versionId ID of the version to get
 * @param accountId Cloudflare account ID
 * @param apiToken Cloudflare API token
 * @returns Version details
 */
export async function handleVersionGet({
  scriptName,
  versionId,
  accountId,
  apiToken,
}: {
  scriptName: string;
  versionId: string;
  accountId: string;
  apiToken: string;
}): Promise<VersionDetailsSchema> {
  const response = await fetchCloudflareApi({
    endpoint: `/workers/scripts/${scriptName}/versions/${versionId}`,
    accountId,
    apiToken,
    responseSchema: VersionDetailsResponseSchema,
    options: {
      method: "GET",
    },
  });

  return response.result!;
}

/**
 * Rollback to a previous version
 * @param scriptName The name of the Worker script
 * @param versionId ID of the version to rollback to
 * @param accountId Cloudflare account ID
 * @param apiToken Cloudflare API token
 * @returns Rollback result
 */
export async function handleVersionRollback({
  scriptName,
  versionId,
  accountId,
  apiToken,
}: {
  scriptName: string;
  versionId: string;
  accountId: string;
  apiToken: string;
}): Promise<RollbackResultSchema> {
  const response = await fetchCloudflareApi({
    endpoint: `/workers/scripts/${scriptName}/rollback`,
    accountId,
    apiToken,
    responseSchema: RollbackResponseSchema,
    options: {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        version_id: versionId,
      }),
    },
  });

  return response.result!;
}