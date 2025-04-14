import { z } from "zod";
import { fetchCloudflareApi } from "../cloudflare-api";
import { V4Schema } from "../v4-api";

// Secret schema
type SecretSchema = z.infer<typeof SecretSchema>
const SecretSchema = z.object({
  name: z.string(),
  type: z.string(),
  created_on: z.string().optional(),
  modified_on: z.string().optional(),
});

// Response schemas using V4Schema
const SecretsResponseSchema = V4Schema(z.array(SecretSchema));
const SecretOperationResponseSchema = V4Schema(z.any());

/**
 * List all secrets for a Worker
 * @param scriptName The name of the Worker script
 * @param accountId Cloudflare account ID
 * @param apiToken Cloudflare API token
 * @returns List of secrets
 */
export async function handleSecretList({
  scriptName,
  accountId,
  apiToken,
}: {
  scriptName: string;
  accountId: string;
  apiToken: string;
}): Promise<SecretSchema[]> {
  const response = await fetchCloudflareApi({
    endpoint: `/workers/scripts/${scriptName}/secrets`,
    accountId,
    apiToken,
    responseSchema: SecretsResponseSchema,
    options: {
      method: "GET",
    },
  });

  return response.result ?? [];
}

/**
 * Add a secret to a Worker
 * @param scriptName The name of the Worker script
 * @param secretName Name of the secret
 * @param secretValue Value of the secret
 * @param accountId Cloudflare account ID
 * @param apiToken Cloudflare API token
 * @returns Operation result
 */
export async function handleSecretPut({
  scriptName,
  secretName,
  secretValue,
  accountId,
  apiToken,
}: {
  scriptName: string;
  secretName: string;
  secretValue: string;
  accountId: string;
  apiToken: string;
}): Promise<any> {
  const response = await fetchCloudflareApi({
    endpoint: `/workers/scripts/${scriptName}/secrets`,
    accountId,
    apiToken,
    responseSchema: SecretOperationResponseSchema,
    options: {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: secretName,
        text: secretValue,
        type: "secret_text",
      }),
    },
  });

  return response.result;
}

/**
 * Delete a secret from a Worker
 * @param scriptName The name of the Worker script
 * @param secretName Name of the secret to delete
 * @param accountId Cloudflare account ID
 * @param apiToken Cloudflare API token
 * @returns Success message
 */
export async function handleSecretDelete({
  scriptName,
  secretName,
  accountId,
  apiToken,
}: {
  scriptName: string;
  secretName: string;
  accountId: string;
  apiToken: string;
}): Promise<string> {
  const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/workers/scripts/${scriptName}/secrets/${secretName}`;

  const response = await fetch(url, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${apiToken}`,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to delete secret: ${error}`);
  }

  return "Successfully deleted secret";
}