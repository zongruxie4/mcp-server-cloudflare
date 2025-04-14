import { z } from "zod";
import { fetchCloudflareApi } from "../cloudflare-api";
import { V4Schema } from "../v4-api";

const WorkerSchema = z.object({
	// id is usually the worker name
	id: z.string(),
	created_on: z.string().optional(),
	modified_on: z.string().optional(),
});

const CloudflareWorkerListResponseSchema = V4Schema(z.array(WorkerSchema));

/**
 * Fetches list of workers from Cloudflare API
 * @param accountId Cloudflare account ID
 * @param apiToken Cloudflare API token
 * @returns List of workers
 */
export async function handleWorkersList({
	accountId,
	apiToken,
}: {
	accountId: string;
	apiToken: string;
}) {
	const response = await fetchCloudflareApi({
		endpoint: "/workers/scripts",
		accountId,
		apiToken,
		responseSchema: CloudflareWorkerListResponseSchema,
		options: {
			method: "GET",
		},
	});

	return response.result ?? [];
}

/**
 * Downloads a specific worker script from Cloudflare API
 * @param scriptName Name of the worker script to download
 * @param accountId Cloudflare account ID
 * @param apiToken Cloudflare API token
 * @returns The worker script content
 */
export async function handleWorkerScriptDownload({
	scriptName,
	accountId,
	apiToken,
}: {
	scriptName: string;
	accountId: string;
	apiToken: string;
}): Promise<string> {
	const response = await fetch(
		`https://api.cloudflare.com/client/v4/accounts/${accountId}/workers/scripts/${scriptName}`,
		{
			method: "GET",
			headers: {
				Authorization: `Bearer ${apiToken}`,
				Accept: "application/javascript",
			},
		},
	);

	if (!response.ok) {
		const error = await response.text();
		throw new Error(`Failed to download worker script: ${error}`);
	}

	return await response.text();
}
