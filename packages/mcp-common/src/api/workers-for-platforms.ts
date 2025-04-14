import { z } from "zod";
import { fetchCloudflareApi } from "../cloudflare-api";
import { V4Schema } from "../v4-api";

// Dispatch namespace schema
type DispatchNamespaceSchema = z.infer<typeof DispatchNamespaceSchema>
const DispatchNamespaceSchema = z.object({
  id: z.string(),
  name: z.string(),
  created_on: z.string().optional(),
  modified_on: z.string().optional(),
});

// Custom domain schema
type CustomDomainSchema = z.infer<typeof CustomDomainSchema>
const CustomDomainSchema = z.object({
  id: z.string(),
  hostname: z.string(),
  zone_id: z.string().optional(),
  zone_name: z.string().optional(),
  status: z.string().optional(),
  created_on: z.string().optional(),
  modified_on: z.string().optional(),
});

// Script schema
type ScriptSchema = z.infer<typeof ScriptSchema>
const ScriptSchema = z.object({
  id: z.string(),
  name: z.string(),
  created_on: z.string().optional(),
  modified_on: z.string().optional(),
});

// Response schemas using V4Schema
const DispatchNamespacesResponseSchema = V4Schema(z.array(DispatchNamespaceSchema));
const DispatchNamespaceResponseSchema = V4Schema(DispatchNamespaceSchema);
const CustomDomainsResponseSchema = V4Schema(z.array(CustomDomainSchema));
const CustomDomainResponseSchema = V4Schema(CustomDomainSchema);
const ScriptsResponseSchema = V4Schema(z.array(ScriptSchema));
const ScriptResponseSchema = V4Schema(ScriptSchema);

/**
 * List all dispatch namespaces
 * @param accountId Cloudflare account ID
 * @param apiToken Cloudflare API token
 * @returns List of dispatch namespaces
 */
export async function handleListDispatchNamespaces({
  accountId,
  apiToken,
}: {
  accountId: string;
  apiToken: string;
}): Promise<DispatchNamespaceSchema[]> {
  const response = await fetchCloudflareApi({
    endpoint: "/workers/dispatch/namespaces",
    accountId,
    apiToken,
    responseSchema: DispatchNamespacesResponseSchema,
    options: {
      method: "GET",
    },
  });

  return response.result ?? [];
}

/**
 * Create a namespace for dispatching custom domains
 * @param name Name for the new dispatch namespace
 * @param accountId Cloudflare account ID
 * @param apiToken Cloudflare API token
 * @returns Created namespace information
 */
export async function handleCreateDispatchNamespace({
  name,
  accountId,
  apiToken,
}: {
  name: string;
  accountId: string;
  apiToken: string;
}): Promise<z.infer<typeof DispatchNamespaceSchema>> {
  const response = await fetchCloudflareApi({
    endpoint: "/workers/dispatch/namespaces",
    accountId,
    apiToken,
    responseSchema: DispatchNamespaceResponseSchema,
    options: {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
      }),
    },
  });

  return response.result!;
}

/**
 * Delete a dispatch namespace
 * @param namespaceId ID of the dispatch namespace to delete
 * @param accountId Cloudflare account ID
 * @param apiToken Cloudflare API token
 * @returns Success message
 */
export async function handleDeleteDispatchNamespace({
  namespaceId,
  accountId,
  apiToken,
}: {
  namespaceId: string;
  accountId: string;
  apiToken: string;
}): Promise<string> {
  const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/workers/dispatch/namespaces/${namespaceId}`;

  const response = await fetch(url, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${apiToken}`,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to delete dispatch namespace: ${error}`);
  }

  return "Successfully deleted dispatch namespace";
}

/**
 * List all custom domains in a dispatch namespace
 * @param namespaceId ID of the dispatch namespace
 * @param accountId Cloudflare account ID
 * @param apiToken Cloudflare API token
 * @returns List of custom domains
 */
export async function handleListCustomDomains({
  namespaceId,
  accountId,
  apiToken,
}: {
  namespaceId: string;
  accountId: string;
  apiToken: string;
}): Promise<CustomDomainSchema[]> {
  const response = await fetchCloudflareApi({
    endpoint: `/workers/dispatch/namespaces/${namespaceId}/domains`,
    accountId,
    apiToken,
    responseSchema: CustomDomainsResponseSchema,
    options: {
      method: "GET",
    },
  });

  return response.result ?? [];
}

/**
 * Add a custom domain to a dispatch namespace
 * @param namespaceId ID of the dispatch namespace
 * @param hostname The custom domain hostname to add
 * @param accountId Cloudflare account ID
 * @param apiToken Cloudflare API token
 * @param zoneId Optional Cloudflare zone ID for the domain
 * @returns Domain addition result
 */
export async function handleAddCustomDomain({
  namespaceId,
  hostname,
  accountId,
  apiToken,
  zoneId,
}: {
  namespaceId: string;
  hostname: string;
  accountId: string;
  apiToken: string;
  zoneId?: string;
}): Promise<z.infer<typeof CustomDomainSchema>> {
  const requestBody: Record<string, any> = {
    hostname,
  };

  if (zoneId) {
    requestBody.zone_id = zoneId;
  }

  const response = await fetchCloudflareApi({
    endpoint: `/workers/dispatch/namespaces/${namespaceId}/domains`,
    accountId,
    apiToken,
    responseSchema: CustomDomainResponseSchema,
    options: {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    },
  });

  return response.result!;
}

/**
 * Remove a custom domain from a dispatch namespace
 * @param namespaceId ID of the dispatch namespace
 * @param hostname The custom domain hostname to remove
 * @param accountId Cloudflare account ID
 * @param apiToken Cloudflare API token
 * @returns Success message
 */
export async function handleRemoveCustomDomain({
  namespaceId,
  hostname,
  accountId,
  apiToken,
}: {
  namespaceId: string;
  hostname: string;
  accountId: string;
  apiToken: string;
}): Promise<string> {
  const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/workers/dispatch/namespaces/${namespaceId}/domains/${hostname}`;

  const response = await fetch(url, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${apiToken}`,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to remove custom domain: ${error}`);
  }

  return "Successfully removed custom domain";
}

/**
 * List scripts in a dispatch namespace
 * @param namespace Name of the dispatch namespace
 * @param accountId Cloudflare account ID
 * @param apiToken Cloudflare API token
 * @returns List of scripts
 */
export async function handleListScripts({
  namespace,
  accountId,
  apiToken,
}: {
  namespace: string;
  accountId: string;
  apiToken: string;
}): Promise<ScriptSchema[]> {
  const response = await fetchCloudflareApi({
    endpoint: `/workers/dispatch/namespaces/${namespace}/scripts`,
    accountId,
    apiToken,
    responseSchema: ScriptsResponseSchema,
    options: {
      method: "GET",
    },
  });

  return response.result ?? [];
}

/**
 * Update a script in a dispatch namespace
 * @param namespace Name of the dispatch namespace
 * @param scriptName Name of the script to update
 * @param script The script content
 * @param accountId Cloudflare account ID
 * @param apiToken Cloudflare API token
 * @returns Update operation result
 */
export async function handleUpdateScript({
  namespace,
  scriptName,
  script,
  accountId,
  apiToken,
}: {
  namespace: string;
  scriptName: string;
  script: string;
  accountId: string;
  apiToken: string;
}): Promise<ScriptSchema> {
  const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/workers/dispatch/namespaces/${namespace}/scripts/${scriptName}`;

  const response = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${apiToken}`,
      "Content-Type": "application/javascript",
    },
    body: script,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to update script: ${error}`);
  }

  const data = await response.json();
  return ScriptResponseSchema.parse(data).result!;
}

/**
 * Delete a script from a dispatch namespace
 * @param namespace Name of the dispatch namespace
 * @param scriptName Name of the script to delete
 * @param accountId Cloudflare account ID
 * @param apiToken Cloudflare API token
 * @returns Success message
 */
export async function handleDeleteScript({
  namespace,
  scriptName,
  accountId,
  apiToken,
}: {
  namespace: string;
  scriptName: string;
  accountId: string;
  apiToken: string;
}): Promise<string> {
  const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/workers/dispatch/namespaces/${namespace}/scripts/${scriptName}`;

  const response = await fetch(url, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${apiToken}`,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to delete script: ${error}`);
  }

  return "Successfully deleted script";
}