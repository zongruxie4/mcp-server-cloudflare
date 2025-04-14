import { z } from "zod";
import { fetchCloudflareApi } from "../cloudflare-api";
import { V4Schema } from "../v4-api";

// KV namespace schema
type KVNamespaceSchema = z.infer<typeof KVNamespaceSchema>
const KVNamespaceSchema = z.object({
  id: z.string(),
  title: z.string(),
  supports_url_encoding: z.boolean().optional(),
});

// KV keys schema
type KVKeySchema = z.infer<typeof KVKeySchema>
const KVKeySchema = z.object({
  name: z.string(),
  expiration: z.number().optional(),
});

// Response schemas using V4Schema
const KVNamespacesResponseSchema = V4Schema(z.array(KVNamespaceSchema));
const KVKeysResponseSchema = V4Schema(z.array(KVKeySchema));

/**
 * Lists all KV namespaces in a Cloudflare account
 * @param accountId Cloudflare account ID
 * @param apiToken Cloudflare API token
 * @returns List of KV namespaces
 */
export async function handleListKVNamespaces({
  accountId,
  apiToken,
}: {
  accountId: string;
  apiToken: string;
}): Promise<KVNamespaceSchema[]> {
  const response = await fetchCloudflareApi({
    endpoint: "/storage/kv/namespaces",
    accountId,
    apiToken,
    responseSchema: KVNamespacesResponseSchema,
    options: {
      method: "GET",
    },
  });

  return response.result ?? [];
}

/**
 * Gets a value from a KV namespace
 * @param namespaceId KV namespace ID
 * @param key Key to retrieve
 * @param accountId Cloudflare account ID
 * @param apiToken Cloudflare API token
 * @returns The value as a string
 */
export async function handleKVGet({
  namespaceId,
  key,
  accountId,
  apiToken,
}: {
  namespaceId: string;
  key: string;
  accountId: string;
  apiToken: string;
}): Promise<string> {
  const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/storage/kv/namespaces/${namespaceId}/values/${key}`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${apiToken}`,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to get KV value: ${error}`);
  }

  return await response.text();
}

/**
 * Puts a value in a KV namespace
 * @param namespaceId KV namespace ID
 * @param key Key to store
 * @param value Value to store
 * @param accountId Cloudflare account ID
 * @param apiToken Cloudflare API token
 * @param expirationTtl Optional expiration time in seconds
 * @returns Success message
 */
export async function handleKVPut({
  namespaceId,
  key,
  value,
  accountId,
  apiToken,
  expirationTtl,
}: {
  namespaceId: string;
  key: string;
  value: string;
  accountId: string;
  apiToken: string;
  expirationTtl?: number;
}): Promise<string> {
  let url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/storage/kv/namespaces/${namespaceId}/values/${key}`;
  
  // Add expiration_ttl to query parameters if provided
  if (expirationTtl) {
    url += `?expiration_ttl=${expirationTtl}`;
  }

  const response = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${apiToken}`,
      "Content-Type": "text/plain",
    },
    body: value,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to put KV value: ${error}`);
  }

  return "Successfully stored value";
}

/**
 * Deletes a key from a KV namespace
 * @param namespaceId KV namespace ID
 * @param key Key to delete
 * @param accountId Cloudflare account ID
 * @param apiToken Cloudflare API token
 * @returns Success message
 */
export async function handleKVDelete({
  namespaceId,
  key,
  accountId,
  apiToken,
}: {
  namespaceId: string;
  key: string;
  accountId: string;
  apiToken: string;
}): Promise<string> {
  const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/storage/kv/namespaces/${namespaceId}/values/${key}`;

  const response = await fetch(url, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${apiToken}`,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to delete KV key: ${error}`);
  }

  return "Successfully deleted key";
}

/**
 * Lists keys in a KV namespace
 * @param namespaceId KV namespace ID
 * @param accountId Cloudflare account ID
 * @param apiToken Cloudflare API token
 * @param prefix Optional prefix to filter keys
 * @param limit Optional maximum number of keys to return
 * @returns List of keys
 */
export async function handleKVListKeys({
  namespaceId,
  accountId,
  apiToken,
  prefix,
  limit,
}: {
  namespaceId: string;
  accountId: string;
  apiToken: string;
  prefix?: string;
  limit?: number;
}): Promise<KVKeySchema[]> {
  const params = new URLSearchParams();
  if (prefix) params.append("prefix", prefix);
  if (limit) params.append("limit", limit.toString());

  const response = await fetchCloudflareApi({
    endpoint: `/storage/kv/namespaces/${namespaceId}/keys?${params}`,
    accountId,
    apiToken,
    responseSchema: KVKeysResponseSchema,
    options: {
      method: "GET",
    },
  });

  return response.result ?? [];
}