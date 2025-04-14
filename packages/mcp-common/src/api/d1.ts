import { z } from "zod";
import { fetchCloudflareApi } from "../cloudflare-api";
import { V4Schema } from "../v4-api";

// D1 database schema
type D1DatabaseSchema = z.infer<typeof D1DatabaseSchema>
const D1DatabaseSchema = z.object({
  uuid: z.string(),
  name: z.string(),
  version: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});

// D1 query meta schema
const D1QueryMetaSchema = z.object({
  changed_db: z.boolean(),
  changes: z.number().optional(),
  duration: z.number(),
  last_row_id: z.number().optional(),
  rows_read: z.number().optional(),
  rows_written: z.number().optional(),
});

// Response schemas using V4Schema
const D1DatabasesResponseSchema = V4Schema(z.array(D1DatabaseSchema));

// For query responses, we need a custom schema since result can be any array
const D1QueryResponseSchema = z.object({
  result: z.array(z.any()),
  success: z.boolean(),
  errors: z.array(z.any()).optional(),
  messages: z.array(z.any()).optional(),
  meta: D1QueryMetaSchema.optional(),
});

/**
 * Lists all D1 databases in a Cloudflare account
 * @param accountId Cloudflare account ID
 * @param apiToken Cloudflare API token
 * @returns List of D1 databases
 */
export async function handleD1ListDatabases({
  accountId,
  apiToken,
}: {
  accountId: string;
  apiToken: string;
}): Promise<D1DatabaseSchema[]> {
  const response = await fetchCloudflareApi({
    endpoint: "/d1/database",
    accountId,
    apiToken,
    responseSchema: D1DatabasesResponseSchema,
    options: {
      method: "GET",
    },
  });

  return response.result ?? [];
}

/**
 * Creates a new D1 database
 * @param name Name of the database to create
 * @param accountId Cloudflare account ID
 * @param apiToken Cloudflare API token
 * @returns Created database information
 */
export async function handleD1CreateDatabase({
  name,
  accountId,
  apiToken,
}: {
  name: string;
  accountId: string;
  apiToken: string;
}): Promise<D1DatabaseSchema[]> {
  const response = await fetchCloudflareApi({
    endpoint: "/d1/database",
    accountId,
    apiToken,
    responseSchema: D1DatabasesResponseSchema,
    options: {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name }),
    },
  });

  return response.result ?? [];
}

/**
 * Deletes a D1 database
 * @param databaseId ID of the database to delete
 * @param accountId Cloudflare account ID
 * @param apiToken Cloudflare API token
 * @returns Success message
 */
export async function handleD1DeleteDatabase({
  databaseId,
  accountId,
  apiToken,
}: {
  databaseId: string;
  accountId: string;
  apiToken: string;
}): Promise<string> {
  const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database/${databaseId}`;

  const response = await fetch(url, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${apiToken}`,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to delete D1 database: ${error}`);
  }

  return "Successfully deleted database";
}

/**
 * Executes a SQL query against a D1 database
 * @param databaseId ID of the database to query
 * @param query SQL query to execute
 * @param accountId Cloudflare account ID
 * @param apiToken Cloudflare API token
 * @param params Optional array of parameters for prepared statements
 * @returns Query results and metadata
 */
export async function handleD1Query({
  databaseId,
  query,
  accountId,
  apiToken,
  params,
}: {
  databaseId: string;
  query: string;
  accountId: string;
  apiToken: string;
  params?: string[];
}): Promise<{
  result: any[];
  meta?: z.infer<typeof D1QueryMetaSchema>;
}> {
  const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database/${databaseId}/query`;

  const body = {
    sql: query,
    params: params || [],
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to execute D1 query: ${error}`);
  }

  const data = D1QueryResponseSchema.parse(await response.json());
  
  return {
    result: data.result,
    meta: data.meta,
  };
}