import { z } from "zod";
import { fetchCloudflareApi } from "../cloudflare-api";
import { V4Schema } from "../v4-api";

// Queue schema
type QueueSchema = z.infer<typeof QueueSchema>
const QueueSchema = z.object({
  queue_id: z.string(),
  name: z.string(),
  created_on: z.string().optional(),
  modified_on: z.string().optional(),
  producers: z.array(
    z.object({
      name: z.string(),
      script: z.string(),
    })
  ).optional(),
  consumers: z.array(
    z.object({
      name: z.string(),
      script: z.string(),
      settings: z.object({
        batch_size: z.number().optional(),
        max_retries: z.number().optional(),
        max_wait_time_ms: z.number().optional(),
      }).optional(),
    })
  ).optional(),
});

// Queue message schema
type QueueMessageSchema = z.infer<typeof QueueMessageSchema>
const QueueMessageSchema = z.object({
  message_id: z.string(),
  body: z.string(),
  receipt_handle: z.string(),
  created_at: z.string().optional(),
  lease_expires_at: z.string().optional(),
});

// Response schemas using V4Schema
const QueuesResponseSchema = V4Schema(z.array(QueueSchema));
const QueueResponseSchema = V4Schema(QueueSchema);
const QueueOperationResponseSchema = V4Schema(z.any());

/**
 * Lists all queues in a Cloudflare account
 * @param accountId Cloudflare account ID
 * @param apiToken Cloudflare API token
 * @returns List of queues
 */
export async function handleListQueues({
  accountId,
  apiToken,
}: {
  accountId: string;
  apiToken: string;
}): Promise<QueueSchema[]> {
  const response = await fetchCloudflareApi({
    endpoint: "/queues",
    accountId,
    apiToken,
    responseSchema: QueuesResponseSchema,
    options: {
      method: "GET",
    },
  });

  return response.result ?? [];
}

/**
 * Creates a new queue
 * @param name Name of the queue to create
 * @param accountId Cloudflare account ID
 * @param apiToken Cloudflare API token
 * @returns Created queue information
 */
export async function handleCreateQueue({
  name,
  accountId,
  apiToken,
}: {
  name: string;
  accountId: string;
  apiToken: string;
}): Promise<QueueSchema> {
  const response = await fetchCloudflareApi({
    endpoint: "/queues",
    accountId,
    apiToken,
    responseSchema: QueueResponseSchema,
    options: {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name }),
    },
  });

  return response.result!;
}

/**
 * Gets details about a specific queue
 * @param queueId ID of the queue to get details for
 * @param accountId Cloudflare account ID
 * @param apiToken Cloudflare API token
 * @returns Queue details
 */
export async function handleGetQueue({
  queueId,
  accountId,
  apiToken,
}: {
  queueId: string;
  accountId: string;
  apiToken: string;
}): Promise<QueueSchema> {
  const response = await fetchCloudflareApi({
    endpoint: `/queues/${queueId}`,
    accountId,
    apiToken,
    responseSchema: QueueResponseSchema,
    options: {
      method: "GET",
    },
  });

  return response.result!;
}

/**
 * Deletes a queue
 * @param queueId ID of the queue to delete
 * @param accountId Cloudflare account ID
 * @param apiToken Cloudflare API token
 * @returns Success message
 */
export async function handleDeleteQueue({
  queueId,
  accountId,
  apiToken,
}: {
  queueId: string;
  accountId: string;
  apiToken: string;
}): Promise<string> {
  const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/queues/${queueId}`;

  const response = await fetch(url, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${apiToken}`,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to delete queue: ${error}`);
  }

  return "Successfully deleted queue";
}

/**
 * Sends a message to a queue
 * @param queueId ID of the queue to send a message to
 * @param message Message to send
 * @param accountId Cloudflare account ID
 * @param apiToken Cloudflare API token
 * @returns Operation result
 */
export async function handleSendMessage({
  queueId,
  message,
  accountId,
  apiToken,
}: {
  queueId: string;
  message: string;
  accountId: string;
  apiToken: string;
}): Promise<any> {
  const response = await fetchCloudflareApi({
    endpoint: `/queues/${queueId}/messages`,
    accountId,
    apiToken,
    responseSchema: QueueOperationResponseSchema,
    options: {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        body: message,
      }),
    },
  });

  return response.result;
}

/**
 * Sends multiple messages to a queue
 * @param queueId ID of the queue to send messages to
 * @param messages Array of messages to send
 * @param accountId Cloudflare account ID
 * @param apiToken Cloudflare API token
 * @returns Operation result
 */
export async function handleSendBatch({
  queueId,
  messages,
  accountId,
  apiToken,
}: {
  queueId: string;
  messages: string[];
  accountId: string;
  apiToken: string;
}): Promise<any> {
  const response = await fetchCloudflareApi({
    endpoint: `/queues/${queueId}/messages/batch`,
    accountId,
    apiToken,
    responseSchema: QueueOperationResponseSchema,
    options: {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: messages.map((message) => ({ body: message })),
      }),
    },
  });

  return response.result;
}

/**
 * Gets a message from a queue
 * @param queueId ID of the queue to get a message from
 * @param accountId Cloudflare account ID
 * @param apiToken Cloudflare API token
 * @param visibilityTimeout Optional visibility timeout in seconds
 * @returns Message or null if queue is empty
 */
export async function handleGetMessage({
  queueId,
  accountId,
  apiToken,
  visibilityTimeout,
}: {
  queueId: string;
  accountId: string;
  apiToken: string;
  visibilityTimeout?: number;
}): Promise<QueueMessageSchema | null> {
  let endpoint = `/queues/${queueId}/messages`;
  
  if (visibilityTimeout) {
    endpoint += `?visibility_timeout=${visibilityTimeout}`;
  }

  const response = await fetchCloudflareApi({
    endpoint,
    accountId,
    apiToken,
    responseSchema: QueueOperationResponseSchema,
    options: {
      method: "GET",
    },
  });

  return response.result;
}

/**
 * Deletes a message from a queue
 * @param queueId ID of the queue the message belongs to
 * @param messageId ID of the message to delete
 * @param receiptHandle Receipt handle for the message
 * @param accountId Cloudflare account ID
 * @param apiToken Cloudflare API token
 * @returns Operation result
 */
export async function handleDeleteMessage({
  queueId,
  messageId,
  receiptHandle,
  accountId,
  apiToken,
}: {
  queueId: string;
  messageId: string;
  receiptHandle: string;
  accountId: string;
  apiToken: string;
}): Promise<any> {
  const response = await fetchCloudflareApi({
    endpoint: `/queues/${queueId}/messages/${messageId}`,
    accountId,
    apiToken,
    responseSchema: QueueOperationResponseSchema,
    options: {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        receipt_handle: receiptHandle,
      }),
    },
  });

  return response.result;
}

/**
 * Updates the visibility timeout for a message
 * @param queueId ID of the queue the message belongs to
 * @param messageId ID of the message to update
 * @param receiptHandle Receipt handle for the message
 * @param visibilityTimeout New visibility timeout in seconds
 * @param accountId Cloudflare account ID
 * @param apiToken Cloudflare API token
 * @returns Operation result
 */
export async function handleUpdateVisibility({
  queueId,
  messageId,
  receiptHandle,
  visibilityTimeout,
  accountId,
  apiToken,
}: {
  queueId: string;
  messageId: string;
  receiptHandle: string;
  visibilityTimeout: number;
  accountId: string;
  apiToken: string;
}): Promise<any> {
  const response = await fetchCloudflareApi({
    endpoint: `/queues/${queueId}/messages/${messageId}/visibility`,
    accountId,
    apiToken,
    responseSchema: QueueOperationResponseSchema,
    options: {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        receipt_handle: receiptHandle,
        visibility_timeout: visibilityTimeout,
      }),
    },
  });

  return response.result;
}