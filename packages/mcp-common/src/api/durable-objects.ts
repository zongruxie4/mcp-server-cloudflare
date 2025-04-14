import { z } from "zod";
import { fetchCloudflareApi } from "../cloudflare-api";
import { V4Schema } from "../v4-api";

// Durable Objects namespace schema
type DONamespaceSchema = z.infer<typeof DONamespaceSchema>
const DONamespaceSchema = z.object({
  id: z.string(),
  name: z.string(),
  script_name: z.string(),
  class_name: z.string(),
  created_on: z.string().optional(),
  modified_on: z.string().optional(),
});

// Durable Objects object schema
type DOObjectSchema = z.infer<typeof DOObjectSchema>
const DOObjectSchema = z.object({
  id: z.string(),
  created_on: z.string().optional(),
  deleted_on: z.string().optional(),
  metadata: z.record(z.string()).optional(),
});

// Durable Objects alarm schema
const DOAlarmSchema = z.object({
  scheduled_time: z.string().nullable(),
});

// Response schemas using V4Schema
const DONamespacesResponseSchema = V4Schema(z.array(DONamespaceSchema));
const DONamespaceResponseSchema = V4Schema(DONamespaceSchema);
const DOObjectsResponseSchema = V4Schema(z.array(DOObjectSchema));
const DOObjectResponseSchema = V4Schema(DOObjectSchema);
const DOAlarmResponseSchema = V4Schema(DOAlarmSchema);

/**
 * List Durable Objects namespaces
 * @param accountId Cloudflare account ID
 * @param apiToken Cloudflare API token
 * @returns List of Durable Objects namespaces
 */
export async function handleListNamespaces({
  accountId,
  apiToken,
}: {
  accountId: string;
  apiToken: string;
}): Promise<DONamespaceSchema[]> {
  const response = await fetchCloudflareApi({
    endpoint: "/workers/durable_objects/namespaces",
    accountId,
    apiToken,
    responseSchema: DONamespacesResponseSchema,
    options: {
      method: "GET",
    },
  });

  return response.result ?? [];
}

/**
 * Create a new Durable Objects namespace
 * @param name Name for the new Durable Objects namespace
 * @param script The Worker script that implements this Durable Object
 * @param className The class name that implements this Durable Object
 * @param accountId Cloudflare account ID
 * @param apiToken Cloudflare API token
 * @returns Created namespace information
 */
export async function handleCreateNamespace({
  name,
  script,
  className,
  accountId,
  apiToken,
}: {
  name: string;
  script: string;
  className: string;
  accountId: string;
  apiToken: string;
}): Promise<z.infer<typeof DONamespaceSchema>> {
  const response = await fetchCloudflareApi({
    endpoint: "/workers/durable_objects/namespaces",
    accountId,
    apiToken,
    responseSchema: DONamespaceResponseSchema,
    options: {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        script_name: script,
        class_name: className,
      }),
    },
  });

  return response.result!;
}

/**
 * Delete a Durable Objects namespace
 * @param namespaceId ID of the Durable Objects namespace to delete
 * @param accountId Cloudflare account ID
 * @param apiToken Cloudflare API token
 * @returns Success message
 */
export async function handleDeleteNamespace({
  namespaceId,
  accountId,
  apiToken,
}: {
  namespaceId: string;
  accountId: string;
  apiToken: string;
}): Promise<string> {
  const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/workers/durable_objects/namespaces/${namespaceId}`;

  const response = await fetch(url, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${apiToken}`,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to delete Durable Objects namespace: ${error}`);
  }

  return "Successfully deleted Durable Objects namespace";
}

/**
 * Get a specific Durable Object instance
 * @param namespaceId ID of the Durable Objects namespace
 * @param objectId ID of the Durable Object instance
 * @param accountId Cloudflare account ID
 * @param apiToken Cloudflare API token
 * @returns Durable Object instance information
 */
export async function handleGetObject({
  namespaceId,
  objectId,
  accountId,
  apiToken,
}: {
  namespaceId: string;
  objectId: string;
  accountId: string;
  apiToken: string;
}): Promise<z.infer<typeof DOObjectSchema>> {
  const response = await fetchCloudflareApi({
    endpoint: `/workers/durable_objects/namespaces/${namespaceId}/objects/${objectId}`,
    accountId,
    apiToken,
    responseSchema: DOObjectResponseSchema,
    options: {
      method: "GET",
    },
  });

  return response.result!;
}

/**
 * List Durable Object instances in a namespace
 * @param namespaceId ID of the Durable Objects namespace
 * @param accountId Cloudflare account ID
 * @param apiToken Cloudflare API token
 * @param limit Maximum number of objects to return
 * @returns List of Durable Object instances
 */
export async function handleListObjects({
  namespaceId,
  accountId,
  apiToken,
  limit,
}: {
  namespaceId: string;
  accountId: string;
  apiToken: string;
  limit?: number;
}): Promise<DOObjectSchema[]> {
  let endpoint = `/workers/durable_objects/namespaces/${namespaceId}/objects`;
  
  if (limit) {
    endpoint += `?limit=${limit}`;
  }

  const response = await fetchCloudflareApi({
    endpoint,
    accountId,
    apiToken,
    responseSchema: DOObjectsResponseSchema,
    options: {
      method: "GET",
    },
  });

  return response.result ?? [];
}

/**
 * Delete a specific Durable Object instance
 * @param namespaceId ID of the Durable Objects namespace
 * @param objectId ID of the Durable Object instance to delete
 * @param accountId Cloudflare account ID
 * @param apiToken Cloudflare API token
 * @returns Success message
 */
export async function handleDeleteObject({
  namespaceId,
  objectId,
  accountId,
  apiToken,
}: {
  namespaceId: string;
  objectId: string;
  accountId: string;
  apiToken: string;
}): Promise<string> {
  const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/workers/durable_objects/namespaces/${namespaceId}/objects/${objectId}`;

  const response = await fetch(url, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${apiToken}`,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to delete Durable Object: ${error}`);
  }

  return "Successfully deleted Durable Object";
}

/**
 * List alarms for a Durable Object
 * @param namespaceId ID of the Durable Objects namespace
 * @param objectId ID of the Durable Object instance
 * @param accountId Cloudflare account ID
 * @param apiToken Cloudflare API token
 * @returns Alarm information
 */
export async function handleAlarmList({
  namespaceId,
  objectId,
  accountId,
  apiToken,
}: {
  namespaceId: string;
  objectId: string;
  accountId: string;
  apiToken: string;
}): Promise<z.infer<typeof DOAlarmSchema>> {
  const response = await fetchCloudflareApi({
    endpoint: `/workers/durable_objects/namespaces/${namespaceId}/objects/${objectId}/alarms`,
    accountId,
    apiToken,
    responseSchema: DOAlarmResponseSchema,
    options: {
      method: "GET",
    },
  });

  return response.result!;
}

/**
 * Set an alarm for a Durable Object
 * @param namespaceId ID of the Durable Objects namespace
 * @param objectId ID of the Durable Object instance
 * @param scheduledTime ISO timestamp for when the alarm should trigger
 * @param accountId Cloudflare account ID
 * @param apiToken Cloudflare API token
 * @returns Operation result
 */
export async function handleAlarmSet({
  namespaceId,
  objectId,
  scheduledTime,
  accountId,
  apiToken,
}: {
  namespaceId: string;
  objectId: string;
  scheduledTime: string;
  accountId: string;
  apiToken: string;
}): Promise<z.infer<typeof DOAlarmSchema>> {
  const response = await fetchCloudflareApi({
    endpoint: `/workers/durable_objects/namespaces/${namespaceId}/objects/${objectId}/alarms`,
    accountId,
    apiToken,
    responseSchema: DOAlarmResponseSchema,
    options: {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        scheduled_time: scheduledTime,
      }),
    },
  });

  return response.result!;
}

/**
 * Delete an alarm for a Durable Object
 * @param namespaceId ID of the Durable Objects namespace
 * @param objectId ID of the Durable Object instance
 * @param accountId Cloudflare account ID
 * @param apiToken Cloudflare API token
 * @returns Success message
 */
export async function handleAlarmDelete({
  namespaceId,
  objectId,
  accountId,
  apiToken,
}: {
  namespaceId: string;
  objectId: string;
  accountId: string;
  apiToken: string;
}): Promise<string> {
  const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/workers/durable_objects/namespaces/${namespaceId}/objects/${objectId}/alarms`;

  const response = await fetch(url, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${apiToken}`,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to delete Durable Object alarm: ${error}`);
  }

  return "Successfully deleted Durable Object alarm";
}