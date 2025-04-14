import { z } from "zod";
import { fetchCloudflareApi } from "../cloudflare-api";
import { V4Schema } from "../v4-api";

// AI Model schema
type AIModelSchema = z.infer<typeof AIModelSchema>
const AIModelSchema = z.object({
  id: z.string(),
  name: z.string(),
  version: z.string().optional(),
  description: z.string().optional(),
  task_type: z.string().optional(),
  input_schema: z.any().optional(),
  output_schema: z.any().optional(),
  status: z.string().optional(),
});

// Response schemas using V4Schema
const AIModelsResponseSchema = V4Schema(z.array(AIModelSchema));
const AIModelResponseSchema = V4Schema(AIModelSchema);

// For inference results, the schema will depend on the model type,
// so we'll use a generic schema for now
const AIInferenceResponseSchema = V4Schema(z.any());

/**
 * List available AI models
 * @param accountId Cloudflare account ID
 * @param apiToken Cloudflare API token
 * @returns List of available AI models
 */
export async function handleListModels({
  accountId,
  apiToken,
}: {
  accountId: string;
  apiToken: string;
}): Promise<AIModelSchema[]> {
  const response = await fetchCloudflareApi({
    endpoint: "/ai/models",
    accountId,
    apiToken,
    responseSchema: AIModelsResponseSchema,
    options: {
      method: "GET",
    },
  });

  return response.result ?? [];
}

/**
 * Get details about a specific AI model
 * @param model The model to get details for
 * @param accountId Cloudflare account ID
 * @param apiToken Cloudflare API token
 * @returns Model details
 */
export async function handleGetModel({
  model,
  accountId,
  apiToken,
}: {
  model: string;
  accountId: string;
  apiToken: string;
}): Promise<AIModelSchema> {
  const response = await fetchCloudflareApi({
    endpoint: `/ai/models/${model}`,
    accountId,
    apiToken,
    responseSchema: AIModelResponseSchema,
    options: {
      method: "GET",
    },
  });

  return response.result!;
}

/**
 * Run inference on a model with Workers AI
 * @param model The model to run inference with
 * @param input Input data for the model
 * @param accountId Cloudflare account ID
 * @param apiToken Cloudflare API token
 * @param options Optional settings for the inference request
 * @returns Inference results
 */
export async function handleAiInference({
  model,
  input,
  accountId,
  apiToken,
  options,
}: {
  model: string;
  input: any;
  accountId: string;
  apiToken: string;
  options?: any;
}): Promise<any> {
  const requestBody: Record<string, any> = { input };
  if (options) {
    requestBody.options = options;
  }

  // Check if the response is expected to be binary (like image generation)
  const expectBinary = model.includes("stable-diffusion") || model.includes("imagen");

  if (expectBinary) {
    const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${model}`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to run inference: ${error}`);
    }

    // Check content type to determine if we got JSON or binary
    const contentType = response.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      const data = await response.json();
      // @ts-ignore
      return data.result;
    } else {
      // Handle binary image data
      const buffer = await response.arrayBuffer();
      const base64 = Buffer.from(buffer).toString("base64");
      return { image: `data:${contentType};base64,${base64}` };
    }
  } else {
    const response = await fetchCloudflareApi({
      endpoint: `/ai/run/${model}`,
      accountId,
      apiToken,
      responseSchema: AIInferenceResponseSchema,
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
}

/**
 * Generate embeddings from text using Workers AI
 * @param model The embedding model to use
 * @param text The text to generate embeddings for
 * @param accountId Cloudflare account ID
 * @param apiToken Cloudflare API token
 * @returns Embeddings
 */
export async function handleEmbeddings({
  model,
  text,
  accountId,
  apiToken,
}: {
  model: string;
  text: string;
  accountId: string;
  apiToken: string;
}): Promise<any> {
  return handleAiInference({
    model,
    input: { text },
    accountId,
    apiToken,
  });
}

/**
 * Generate text using an AI model
 * @param model The model to use for text generation
 * @param prompt The prompt to generate text from
 * @param accountId Cloudflare account ID
 * @param apiToken Cloudflare API token
 * @param options Optional settings for the text generation
 * @returns Generated text
 */
export async function handleTextGeneration({
  model,
  prompt,
  accountId,
  apiToken,
  options,
}: {
  model: string;
  prompt: string;
  accountId: string;
  apiToken: string;
  options?: any;
}): Promise<any> {
  return handleAiInference({
    model,
    input: { prompt },
    accountId,
    apiToken,
    options,
  });
}

/**
 * Generate images using an AI model
 * @param model The model to use for image generation
 * @param prompt The prompt to generate an image from
 * @param accountId Cloudflare account ID
 * @param apiToken Cloudflare API token
 * @param options Optional settings for the image generation
 * @returns Generated image data
 */
export async function handleImageGeneration({
  model,
  prompt,
  accountId,
  apiToken,
  options,
}: {
  model: string;
  prompt: string;
  accountId: string;
  apiToken: string;
  options?: any;
}): Promise<any> {
  return handleAiInference({
    model,
    input: { prompt },
    accountId,
    apiToken,
    options,
  });
}