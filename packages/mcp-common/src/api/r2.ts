import { z } from "zod";
import { fetchCloudflareApi } from "../cloudflare-api";
import { V4Schema } from "../v4-api";

// R2 bucket schema
type R2BucketSchema = z.infer<typeof R2BucketSchema>
const R2BucketSchema = z.object({
  name: z.string(),
  creation_date: z.string(),
});

// R2 object schema
const R2ObjectSchema = z.object({
  key: z.string(),
  size: z.number(),
  uploaded: z.string(),
  etag: z.string(),
  httpEtag: z.string(),
  version: z.string(),
});

// R2 objects response schema
type R2ObjectsResponseSchema = z.infer<typeof R2ObjectsResponseSchema>
const R2ObjectsResponseSchema = z.object({
  objects: z.array(R2ObjectSchema),
  delimitedPrefixes: z.array(z.string()),
  truncated: z.boolean(),
});

// Response schemas using V4Schema
const R2BucketsResponseSchema = V4Schema(z.array(R2BucketSchema));

/**
 * Lists all R2 buckets in a Cloudflare account
 * @param accountId Cloudflare account ID
 * @param apiToken Cloudflare API token
 * @returns List of R2 buckets
 */
export async function handleR2ListBuckets({
  accountId,
  apiToken,
}: {
  accountId: string;
  apiToken: string;
}): Promise<R2BucketSchema[]> {
  const response = await fetchCloudflareApi({
    endpoint: "/r2/buckets",
    accountId,
    apiToken,
    responseSchema: R2BucketsResponseSchema,
    options: {
      method: "GET",
    },
  });

  return response.result ?? [];
}

/**
 * Creates a new R2 bucket
 * @param name Name of the bucket to create
 * @param accountId Cloudflare account ID
 * @param apiToken Cloudflare API token
 * @returns Success message
 */
export async function handleR2CreateBucket({
  name,
  accountId,
  apiToken,
}: {
  name: string;
  accountId: string;
  apiToken: string;
}): Promise<string> {
  const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/r2/buckets`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create R2 bucket: ${error}`);
  }

  return "Successfully created bucket";
}

/**
 * Deletes an R2 bucket
 * @param name Name of the bucket to delete
 * @param accountId Cloudflare account ID
 * @param apiToken Cloudflare API token
 * @returns Success message
 */
export async function handleR2DeleteBucket({
  name,
  accountId,
  apiToken,
}: {
  name: string;
  accountId: string;
  apiToken: string;
}): Promise<string> {
  const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/r2/buckets/${name}`;

  const response = await fetch(url, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${apiToken}`,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to delete R2 bucket: ${error}`);
  }

  return "Successfully deleted bucket";
}

/**
 * Lists objects in an R2 bucket
 * @param bucket Name of the bucket
 * @param accountId Cloudflare account ID
 * @param apiToken Cloudflare API token
 * @param prefix Optional prefix to filter objects
 * @param delimiter Optional delimiter for hierarchical listing
 * @param limit Optional maximum number of objects to return
 * @returns List of objects and prefixes
 */
export async function handleR2ListObjects({
  bucket,
  accountId,
  apiToken,
  prefix,
  delimiter,
  limit,
}: {
  bucket: string;
  accountId: string;
  apiToken: string;
  prefix?: string;
  delimiter?: string;
  limit?: number;
}): Promise<R2ObjectsResponseSchema> {
  const params = new URLSearchParams();
  if (prefix) params.append("prefix", prefix);
  if (delimiter) params.append("delimiter", delimiter);
  if (limit) params.append("limit", limit.toString());

  const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/r2/buckets/${bucket}/objects?${params}`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${apiToken}`,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to list R2 objects: ${error}`);
  }

  return R2ObjectsResponseSchema.parse(await response.json());
}

/**
 * Gets an object from an R2 bucket
 * @param bucket Name of the bucket
 * @param key Key of the object to get
 * @param accountId Cloudflare account ID
 * @param apiToken Cloudflare API token
 * @returns Object content as a string
 */
export async function handleR2GetObject({
  bucket,
  key,
  accountId,
  apiToken,
}: {
  bucket: string;
  key: string;
  accountId: string;
  apiToken: string;
}): Promise<string> {
  const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/r2/buckets/${bucket}/objects/${key}`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${apiToken}`,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to get R2 object: ${error}`);
  }

  return await response.text();
}

/**
 * Puts an object into an R2 bucket
 * @param bucket Name of the bucket
 * @param key Key of the object to put
 * @param content Content to store in the object
 * @param accountId Cloudflare account ID
 * @param apiToken Cloudflare API token
 * @param contentType Optional MIME type of the content
 * @returns Success message
 */
export async function handleR2PutObject({
  bucket,
  key,
  content,
  accountId,
  apiToken,
  contentType,
}: {
  bucket: string;
  key: string;
  content: string;
  accountId: string;
  apiToken: string;
  contentType?: string;
}): Promise<string> {
  const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/r2/buckets/${bucket}/objects/${key}`;

  const headers: Record<string, string> = {
    Authorization: `Bearer ${apiToken}`,
  };
  
  if (contentType) {
    headers["Content-Type"] = contentType;
  }

  const response = await fetch(url, {
    method: "PUT",
    headers,
    body: content,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to put R2 object: ${error}`);
  }

  return "Successfully uploaded object";
}

/**
 * Deletes an object from an R2 bucket
 * @param bucket Name of the bucket
 * @param key Key of the object to delete
 * @param accountId Cloudflare account ID
 * @param apiToken Cloudflare API token
 * @returns Success message
 */
export async function handleR2DeleteObject({
  bucket,
  key,
  accountId,
  apiToken,
}: {
  bucket: string;
  key: string;
  accountId: string;
  apiToken: string;
}): Promise<string> {
  const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/r2/buckets/${bucket}/objects/${key}`;

  const response = await fetch(url, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${apiToken}`,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to delete R2 object: ${error}`);
  }

  return "Successfully deleted object";
}