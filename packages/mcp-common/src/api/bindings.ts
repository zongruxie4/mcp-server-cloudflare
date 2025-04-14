import { z } from "zod";
import { fetchCloudflareApi } from "../cloudflare-api";
import { V4Schema } from "../v4-api";

// Service binding schema
type ServiceBindingSchema = z.infer<typeof ServiceBindingSchema>
const ServiceBindingSchema = z.object({
  name: z.string(),
  service: z.string(),
  environment: z.string().optional(),
  created_on: z.string().optional(),
  modified_on: z.string().optional(),
});

// Environment variable schema
type EnvVarSchema = z.infer<typeof EnvVarSchema>
const EnvVarSchema = z.object({
  name: z.string(),
  value: z.string().optional(),
  created_on: z.string().optional(),
  modified_on: z.string().optional(),
});

// Worker binding schema (for list bindings)
type WorkerBindingSchema = z.infer<typeof WorkerBindingSchema>
const WorkerBindingSchema = z.object({
  name: z.string(),
  type: z.string(),
  // Additional fields based on binding type
  kv_namespace_id: z.string().optional(),
  bucket_name: z.string().optional(),
  namespace_id: z.string().optional(),
  service: z.string().optional(),
  environment: z.string().optional(),
});

// Response schemas using V4Schema
const ServiceBindingsResponseSchema = V4Schema(z.array(ServiceBindingSchema));
const EnvVarsResponseSchema = V4Schema(z.array(EnvVarSchema));
const WorkerBindingsResponseSchema = V4Schema(z.array(WorkerBindingSchema));

/**
 * List all service bindings for a Worker
 * @param scriptName The name of the Worker script to list bindings for
 * @param accountId Cloudflare account ID
 * @param apiToken Cloudflare API token
 * @returns List of service bindings
 */
export async function handleServiceBindingList({
  scriptName,
  accountId,
  apiToken,
}: {
  scriptName: string;
  accountId: string;
  apiToken: string;
}): Promise<ServiceBindingSchema[]> {
  const response = await fetchCloudflareApi({
    endpoint: `/workers/scripts/${scriptName}/bindings/service`,
    accountId,
    apiToken,
    responseSchema: ServiceBindingsResponseSchema,
    options: {
      method: "GET",
    },
  });

  return response.result ?? [];
}

/**
 * Create a service binding between Workers
 * @param scriptName The name of the Worker script to add the binding to
 * @param bindingName Name for the service binding
 * @param service Name of the target Worker service
 * @param accountId Cloudflare account ID
 * @param apiToken Cloudflare API token
 * @param environment Optional environment of the target Worker
 * @returns Created service binding information
 */
export async function handleServiceBindingCreate({
  scriptName,
  bindingName,
  service,
  accountId,
  apiToken,
  environment,
}: {
  scriptName: string;
  bindingName: string;
  service: string;
  accountId: string;
  apiToken: string;
  environment?: string;
}): Promise<z.infer<typeof ServiceBindingSchema>> {
  const requestBody: Record<string, string> = {
    name: bindingName,
    service,
  };

  if (environment) {
    requestBody.environment = environment;
  }

  const response = await fetchCloudflareApi({
    endpoint: `/workers/scripts/${scriptName}/bindings/service`,
    accountId,
    apiToken,
    responseSchema: V4Schema(ServiceBindingSchema),
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

/**
 * Update a service binding
 * @param scriptName The name of the Worker script containing the binding
 * @param bindingName Name of the service binding to update
 * @param service New name of the target Worker service
 * @param accountId Cloudflare account ID
 * @param apiToken Cloudflare API token
 * @param environment Optional new environment of the target Worker
 * @returns Updated service binding information
 */
export async function handleServiceBindingUpdate({
  scriptName,
  bindingName,
  service,
  accountId,
  apiToken,
  environment,
}: {
  scriptName: string;
  bindingName: string;
  service: string;
  accountId: string;
  apiToken: string;
  environment?: string;
}): Promise<z.infer<typeof ServiceBindingSchema>> {
  const requestBody: Record<string, string> = {
    service,
  };

  if (environment) {
    requestBody.environment = environment;
  }

  const response = await fetchCloudflareApi({
    endpoint: `/workers/scripts/${scriptName}/bindings/service/${bindingName}`,
    accountId,
    apiToken,
    responseSchema: V4Schema(ServiceBindingSchema),
    options: {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    },
  });

  return response.result!;
}

/**
 * Delete a service binding
 * @param scriptName The name of the Worker script containing the binding
 * @param bindingName Name of the service binding to delete
 * @param accountId Cloudflare account ID
 * @param apiToken Cloudflare API token
 * @returns Success message
 */
export async function handleServiceBindingDelete({
  scriptName,
  bindingName,
  accountId,
  apiToken,
}: {
  scriptName: string;
  bindingName: string;
  accountId: string;
  apiToken: string;
}): Promise<string> {
  const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/workers/scripts/${scriptName}/bindings/service/${bindingName}`;

  const response = await fetch(url, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${apiToken}`,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to delete service binding: ${error}`);
  }

  return "Successfully deleted service binding";
}

/**
 * List environment variables for a Worker
 * @param scriptName The name of the Worker script
 * @param accountId Cloudflare account ID
 * @param apiToken Cloudflare API token
 * @returns List of environment variables
 */
export async function handleEnvVarList({
  scriptName,
  accountId,
  apiToken,
}: {
  scriptName: string;
  accountId: string;
  apiToken: string;
}): Promise<EnvVarSchema[]> {
  const response = await fetchCloudflareApi({
    endpoint: `/workers/scripts/${scriptName}/vars`,
    accountId,
    apiToken,
    responseSchema: EnvVarsResponseSchema,
    options: {
      method: "GET",
    },
  });

  return response.result ?? [];
}

/**
 * Delete an environment variable
 * @param scriptName The name of the Worker script
 * @param key Name of the environment variable to delete
 * @param accountId Cloudflare account ID
 * @param apiToken Cloudflare API token
 * @returns Success message
 */
export async function handleEnvVarDelete({
  scriptName,
  key,
  accountId,
  apiToken,
}: {
  scriptName: string;
  key: string;
  accountId: string;
  apiToken: string;
}): Promise<string> {
  const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/workers/scripts/${scriptName}/vars/${key}`;

  const response = await fetch(url, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${apiToken}`,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to delete environment variable: ${error}`);
  }

  return "Successfully deleted environment variable";
}

/**
 * List all bindings for a Worker service and environment
 * @param serviceName Name of the Worker service
 * @param envName Name of the environment
 * @param accountId Cloudflare account ID
 * @param apiToken Cloudflare API token
 * @returns List of bindings
 */
export async function handleBindingsList({
  serviceName,
  envName,
  accountId,
  apiToken,
}: {
  serviceName: string;
  envName: string;
  accountId: string;
  apiToken: string;
}): Promise<WorkerBindingSchema[]> {
  const response = await fetchCloudflareApi({
    endpoint: `/workers/services/${serviceName}/environments/${envName}/bindings`,
    accountId,
    apiToken,
    responseSchema: WorkerBindingsResponseSchema,
    options: {
      method: "GET",
    },
  });

  return response.result ?? [];
}

/**
 * Update bindings for a Worker service and environment
 * @param serviceName Name of the Worker service
 * @param envName Name of the environment
 * @param bindings Array of bindings to set
 * @param accountId Cloudflare account ID
 * @param apiToken Cloudflare API token
 * @returns Success message
 */
export async function handleBindingsUpdate({
  serviceName,
  envName,
  bindings,
  accountId,
  apiToken,
}: {
  serviceName: string;
  envName: string;
  bindings: any[];
  accountId: string;
  apiToken: string;
}): Promise<string> {
  const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/workers/services/${serviceName}/environments/${envName}/bindings`;

  const response = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${apiToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      bindings,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to update bindings: ${error}`);
  }

  return "Successfully updated bindings";
}