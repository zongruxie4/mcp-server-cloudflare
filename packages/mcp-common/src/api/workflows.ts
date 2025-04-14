import { z } from "zod";
import { fetchCloudflareApi } from "../cloudflare-api";
import { V4Schema } from "../v4-api";

// Workflow schema definitions
const WorkflowStepSchema = z.object({
  name: z.string(),
  type: z.string(),
  script: z.string().optional(),
  timeout: z.number().optional(),
  // Add other properties as needed based on step types
});

type WorkflowSchema = z.infer<typeof WorkflowSchema>
const WorkflowSchema = z.object({
  id: z.string(),
  name: z.string(),
  steps: z.array(WorkflowStepSchema).optional(),
  created_on: z.string().optional(),
});

type WorkflowExecutionSchema = z.infer<typeof WorkflowExecutionSchema>
const WorkflowExecutionSchema = z.object({
  id: z.string(),
  workflow_id: z.string(),
  status: z.string(),
  created_on: z.string().optional(),
});

type WorkflowDeleteResultSchema = z.infer<typeof WorkflowDeleteResultSchema>
const WorkflowDeleteResultSchema = z.object({
  id: z.string(),
  deleted: z.boolean(),
  message: z.string().optional(),
});

// Response schemas using V4Schema
const WorkflowResponseSchema = V4Schema(WorkflowSchema);
const WorkflowsListResponseSchema = V4Schema(z.array(WorkflowSchema));
const WorkflowExecutionResponseSchema = V4Schema(WorkflowExecutionSchema);
const WorkflowDeleteResponseSchema = V4Schema(WorkflowDeleteResultSchema);

/**
 * Gets details about a specific workflow
 * @param workflowId ID of the workflow to get details for
 * @param accountId Cloudflare account ID
 * @param apiToken Cloudflare API token
 * @returns Workflow details
 */
export async function handleGetWorkflow({
  workflowId,
  accountId,
  apiToken,
}: {
  workflowId: string;
  accountId: string;
  apiToken: string;
}): Promise<WorkflowSchema | null> {
  const response = await fetchCloudflareApi({
    endpoint: `/workers/workflows/${workflowId}`,
    accountId,
    apiToken,
    responseSchema: WorkflowResponseSchema,
    options: {
      method: "GET",
    },
  });

  return response.result;
}

/**
 * Creates a new workflow
 * @param name Name for the new workflow
 * @param content Workflow definition content
 * @param accountId Cloudflare account ID
 * @param apiToken Cloudflare API token
 * @returns Created workflow details
 */
export async function handleCreateWorkflow({
  name,
  content,
  accountId,
  apiToken,
}: {
  name: string;
  content: any;
  accountId: string;
  apiToken: string;
}): Promise<WorkflowSchema | null> {
  const response = await fetchCloudflareApi({
    endpoint: `/workers/workflows`,
    accountId,
    apiToken,
    responseSchema: WorkflowResponseSchema,
    options: {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        content,
      }),
    },
  });

  return response.result;
}

/**
 * Deletes a workflow
 * @param workflowId ID of the workflow to delete
 * @param accountId Cloudflare account ID
 * @param apiToken Cloudflare API token
 * @returns Delete operation result
 */
export async function handleDeleteWorkflow({
  workflowId,
  accountId,
  apiToken,
}: {
  workflowId: string;
  accountId: string;
  apiToken: string;
}): Promise<WorkflowDeleteResultSchema | null> {
  const response = await fetchCloudflareApi({
    endpoint: `/workers/workflows/${workflowId}`,
    accountId,
    apiToken,
    responseSchema: WorkflowDeleteResponseSchema,
    options: {
      method: "DELETE",
    },
  });

  return response.result;
}

/**
 * Lists all workflows in an account
 * @param accountId Cloudflare account ID
 * @param apiToken Cloudflare API token
 * @returns List of workflows
 */
export async function handleListWorkflows({
  accountId,
  apiToken,
}: {
  accountId: string;
  apiToken: string;
}): Promise<WorkflowSchema[]> {
  const response = await fetchCloudflareApi({
    endpoint: `/workers/workflows`,
    accountId,
    apiToken,
    responseSchema: WorkflowsListResponseSchema,
    options: {
      method: "GET",
    },
  });

  return response.result ?? [];
}

/**
 * Updates a workflow
 * @param workflowId ID of the workflow to update
 * @param content Updated workflow definition content
 * @param accountId Cloudflare account ID
 * @param apiToken Cloudflare API token
 * @returns Updated workflow details
 */
export async function handleUpdateWorkflow({
  workflowId,
  content,
  accountId,
  apiToken,
}: {
  workflowId: string;
  content: any;
  accountId: string;
  apiToken: string;
}): Promise<WorkflowSchema | null> {
  const response = await fetchCloudflareApi({
    endpoint: `/workers/workflows/${workflowId}`,
    accountId,
    apiToken,
    responseSchema: WorkflowResponseSchema,
    options: {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content,
      }),
    },
  });

  return response.result;
}

/**
 * Executes a workflow
 * @param workflowId ID of the workflow to execute
 * @param input Optional input data for the workflow execution
 * @param accountId Cloudflare account ID
 * @param apiToken Cloudflare API token
 * @returns Execution details
 */
export async function handleExecuteWorkflow({
  workflowId,
  input,
  accountId,
  apiToken,
}: {
  workflowId: string;
  input?: any;
  accountId: string;
  apiToken: string;
}): Promise<WorkflowExecutionSchema | null> {
  const requestBody: Record<string, any> = {};
  if (input !== undefined) {
    requestBody.input = input;
  }

  const response = await fetchCloudflareApi({
    endpoint: `/workers/workflows/${workflowId}/executions`,
    accountId,
    apiToken,
    responseSchema: WorkflowExecutionResponseSchema,
    options: {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    },
  });

  return response.result;
}