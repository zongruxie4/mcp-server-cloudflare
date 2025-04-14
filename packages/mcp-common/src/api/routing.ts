import { z } from "zod";
import { V4Schema } from "../v4-api";

// Route schema
type RouteSchema = z.infer<typeof RouteSchema>
const RouteSchema = z.object({
  id: z.string(),
  pattern: z.string(),
  script: z.string(),
  created_on: z.string().optional(),
  modified_on: z.string().optional(),
});

// Response schemas using V4Schema
const RoutesResponseSchema = V4Schema(z.array(RouteSchema));
const RouteResponseSchema = V4Schema(RouteSchema);

/**
 * List all routes for a zone
 * @param zoneId ID of the zone to list routes for
 * @param apiToken Cloudflare API token
 * @returns List of routes
 */
export async function handleRouteList({
  zoneId,
  apiToken,
}: {
  zoneId: string;
  apiToken: string;
}): Promise<RouteSchema[]> {
  const url = `https://api.cloudflare.com/client/v4/zones/${zoneId}/workers/routes`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${apiToken}`,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to list routes: ${error}`);
  }

  const data = RoutesResponseSchema.parse(await response.json());
  return data.result ?? [];
}

/**
 * Create a route that maps to a Worker
 * @param zoneId ID of the zone to create a route in
 * @param pattern The URL pattern for the route (e.g., "example.com/*")
 * @param scriptName Name of the Worker script to route to
 * @param apiToken Cloudflare API token
 * @returns Created route information
 */
export async function handleRouteCreate({
  zoneId,
  pattern,
  scriptName,
  apiToken,
}: {
  zoneId: string;
  pattern: string;
  scriptName: string;
  apiToken: string;
}): Promise<RouteSchema> {
  const url = `https://api.cloudflare.com/client/v4/zones/${zoneId}/workers/routes`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      pattern,
      script: scriptName,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create route: ${error}`);
  }

  const data = RouteResponseSchema.parse(await response.json());
  return data.result!;
}

/**
 * Update a route
 * @param zoneId ID of the zone containing the route
 * @param routeId ID of the route to update
 * @param pattern The new URL pattern for the route
 * @param scriptName Name of the Worker script to route to
 * @param apiToken Cloudflare API token
 * @returns Updated route information
 */
export async function handleRouteUpdate({
  zoneId,
  routeId,
  pattern,
  scriptName,
  apiToken,
}: {
  zoneId: string;
  routeId: string;
  pattern: string;
  scriptName: string;
  apiToken: string;
}): Promise<RouteSchema> {
  const url = `https://api.cloudflare.com/client/v4/zones/${zoneId}/workers/routes/${routeId}`;

  const response = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${apiToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      pattern,
      script: scriptName,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to update route: ${error}`);
  }

  const data = RouteResponseSchema.parse(await response.json());
  return data.result!;
}

/**
 * Delete a route
 * @param zoneId ID of the zone containing the route
 * @param routeId ID of the route to delete
 * @param apiToken Cloudflare API token
 * @returns Success message
 */
export async function handleRouteDelete({
  zoneId,
  routeId,
  apiToken,
}: {
  zoneId: string;
  routeId: string;
  apiToken: string;
}): Promise<string> {
  const url = `https://api.cloudflare.com/client/v4/zones/${zoneId}/workers/routes/${routeId}`;

  const response = await fetch(url, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${apiToken}`,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to delete route: ${error}`);
  }

  return "Successfully deleted route";
}