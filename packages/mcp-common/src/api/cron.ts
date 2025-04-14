import { z } from "zod";
import { fetchCloudflareApi } from "../cloudflare-api";
import { V4Schema } from "../v4-api";

// Cron trigger schema
type CronTriggerSchema = z.infer<typeof CronTriggerSchema>
const CronTriggerSchema = z.object({
  cron: z.string(),
  created_on: z.string().optional(),
  modified_on: z.string().optional(),
});

// Response schemas using V4Schema
const CronTriggersResponseSchema = V4Schema(z.array(CronTriggerSchema));

/**
 * Create a CRON trigger for a Worker
 * @param scriptName The name of the Worker script
 * @param cronExpression CRON expression (e.g., "*\/5 * * * *" for every 5 minutes)
 * @param accountId Cloudflare account ID
 * @param apiToken Cloudflare API token
 * @returns Created cron trigger information
 */
export async function handleCronCreate({
  scriptName,
  cronExpression,
  accountId,
  apiToken,
}: {
  scriptName: string;
  cronExpression: string;
  accountId: string;
  apiToken: string;
}): Promise<CronTriggerSchema[]> {
  const response = await fetchCloudflareApi({
    endpoint: `/workers/scripts/${scriptName}/schedules`,
    accountId,
    apiToken,
    responseSchema: CronTriggersResponseSchema,
    options: {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        cron: [cronExpression],
      }),
    },
  });

  return response.result ?? [];
}

/**
 * Delete CRON triggers for a Worker
 * @param scriptName The name of the Worker script
 * @param accountId Cloudflare account ID
 * @param apiToken Cloudflare API token
 * @returns Success message
 */
export async function handleCronDelete({
  scriptName,
  accountId,
  apiToken,
}: {
  scriptName: string;
  accountId: string;
  apiToken: string;
}): Promise<string> {
  const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/workers/scripts/${scriptName}/schedules`;

  const response = await fetch(url, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${apiToken}`,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to delete CRON trigger: ${error}`);
  }

  return "Successfully deleted CRON trigger";
}

/**
 * List CRON triggers for a Worker
 * @param scriptName The name of the Worker script
 * @param accountId Cloudflare account ID
 * @param apiToken Cloudflare API token
 * @returns List of cron triggers
 */
export async function handleCronList({
  scriptName,
  accountId,
  apiToken,
}: {
  scriptName: string;
  accountId: string;
  apiToken: string;
}): Promise<CronTriggerSchema[]> {
  const response = await fetchCloudflareApi({
    endpoint: `/workers/scripts/${scriptName}/schedules`,
    accountId,
    apiToken,
    responseSchema: CronTriggersResponseSchema,
    options: {
      method: "GET",
    },
  });

  return response.result ?? [];
}

/**
 * Update CRON triggers for a Worker
 * @param scriptName The name of the Worker script
 * @param cronExpression New CRON expression
 * @param accountId Cloudflare account ID
 * @param apiToken Cloudflare API token
 * @returns Updated cron trigger information
 */
export async function handleCronUpdate({
  scriptName,
  cronExpression,
  accountId,
  apiToken,
}: {
  scriptName: string;
  cronExpression: string;
  accountId: string;
  apiToken: string;
}): Promise<CronTriggerSchema[]> {
  // This is effectively the same as create, as the PUT endpoint replaces existing triggers
  return handleCronCreate({
    scriptName,
    cronExpression,
    accountId,
    apiToken,
  });
}