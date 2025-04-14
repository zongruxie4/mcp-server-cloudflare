import { z } from "zod";
import { fetchCloudflareApi } from "../cloudflare-api";
import { V4Schema } from "../v4-api";

// Template schema
type TemplateSchema = z.infer<typeof TemplateSchema>
const TemplateSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  type: z.string(),
  tags: z.array(z.string()),
  created_on: z.string().optional(),
  modified_on: z.string().optional(),
});

// Template details schema (extends basic template info with content)
type TemplateDetailsSchema = z.infer<typeof TemplateDetailsSchema>
const TemplateDetailsSchema = TemplateSchema.extend({
  content: z.record(z.string()),
});

// Worker creation result schema
type WorkerCreationResultSchema = z.infer<typeof WorkerCreationResultSchema>
const WorkerCreationResultSchema = z.object({
  name: z.string(),
  created_from: z.string(),
  created_on: z.string().optional(),
});

// Response schemas using V4Schema
const TemplatesResponseSchema = V4Schema(z.array(TemplateSchema));
const TemplateDetailsResponseSchema = V4Schema(TemplateDetailsSchema);
const WorkerCreationResponseSchema = V4Schema(WorkerCreationResultSchema);

/**
 * List available Worker templates
 * @param accountId Cloudflare account ID
 * @param apiToken Cloudflare API token
 * @returns List of templates
 */
export async function handleListTemplates({
  accountId,
  apiToken,
}: {
  accountId: string;
  apiToken: string;
}): Promise<TemplateSchema[]> {
  const response = await fetchCloudflareApi({
    endpoint: "/workers/templates",
    accountId,
    apiToken,
    responseSchema: TemplatesResponseSchema,
    options: {
      method: "GET",
    },
  });

  return response.result ?? [];
}

/**
 * Get details for a specific template
 * @param templateId ID of the template to get details for
 * @param accountId Cloudflare account ID
 * @param apiToken Cloudflare API token
 * @returns Template details including content
 */
export async function handleGetTemplate({
  templateId,
  accountId,
  apiToken,
}: {
  templateId: string;
  accountId: string;
  apiToken: string;
}): Promise<TemplateDetailsSchema> {
  const response = await fetchCloudflareApi({
    endpoint: `/workers/templates/${templateId}`,
    accountId,
    apiToken,
    responseSchema: TemplateDetailsResponseSchema,
    options: {
      method: "GET",
    },
  });

  return response.result!;
}

/**
 * Create a Worker from a template
 * @param templateId ID of the template to use
 * @param name Name for the new Worker
 * @param accountId Cloudflare account ID
 * @param apiToken Cloudflare API token
 * @param config Optional configuration values for the template
 * @returns Worker creation result
 */
export async function handleCreateWorkerFromTemplate({
  templateId,
  name,
  accountId,
  apiToken,
  config,
}: {
  templateId: string;
  name: string;
  accountId: string;
  apiToken: string;
  config?: Record<string, any>;
}): Promise<WorkerCreationResultSchema> {
  const requestBody: Record<string, any> = {
    template_id: templateId,
    name,
  };

  if (config) {
    requestBody.config = config;
  }

  const response = await fetchCloudflareApi({
    endpoint: "/workers/services/from-template",
    accountId,
    apiToken,
    responseSchema: WorkerCreationResponseSchema,
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