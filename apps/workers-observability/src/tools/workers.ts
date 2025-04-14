import { z } from "zod";
import type { MyMCP } from "../index";
import { handleWorkersList, handleWorkerScriptDownload } from "@repo/mcp-common/src/api/workers"

/**
 * Registers the workers tools with the MCP server
 * @param server The MCP server instance
 * @param accountId Cloudflare account ID
 * @param apiToken Cloudflare API token
 */
// Define the scriptName parameter schema
const workerNameParam = z.string().describe("The name of the worker script to retrieve");

export function registerWorkersTools(agent: MyMCP) {
	// Tool to list all workers
	agent.server.tool(
		"workers_list",
		"List all Workers in your Cloudflare account",
		{},
		async () => {
			const accountId = agent.getActiveAccountId();
			if (!accountId) {
				return {
					content: [
						{
							type: "text",
							text: "No currently active accountId. Try listing your accounts (accounts_list) and then setting an active account (set_active_account)",
						},
					],
				};
			}
			try {
				const results = await handleWorkersList({
					accountId,
					apiToken: agent.props.accessToken,
				});
				// Extract worker details and sort by created_on date (newest first)
				const workers = results
					.map((worker) => ({
						name: worker.id,
						modified_on: worker.modified_on || null,
						created_on: worker.created_on || null,
					}))
					// order by created_on desc ( newest first )
					.sort((a, b) => {
						if (!a.created_on) return 1;
						if (!b.created_on) return -1;
						return new Date(b.created_on).getTime() - new Date(a.created_on).getTime();
					});

				return {
					content: [
						{
							type: "text",
							text: JSON.stringify({
								workers,
								count: workers.length,
							}),
						},
					],
				};
			} catch (error) {
				return {
					content: [
						{
							type: "text",
							text: `Error listing workers: ${error instanceof Error && error.message}`,
						},
					],
				};
			}
		},
	);

	// Tool to get a specific worker's script content
	agent.server.tool(
		"worker_get_worker",
		"Get the source code of a Cloudflare Worker",
		{ scriptName: workerNameParam },
		async (params) => {
			const accountId = agent.getActiveAccountId();
			if (!accountId) {
				return {
					content: [
						{
							type: "text",
							text: "No currently active accountId. Try listing your accounts (accounts_list) and then setting an active account (set_active_account)",
						},
					],
				};
			}
			try {
				const { scriptName } = params;
				const scriptContent = await handleWorkerScriptDownload({
					scriptName,
					accountId,
					apiToken: agent.props.accessToken,
				});
				return {
					content: [
						{
							type: "text",
							text: scriptContent,
						},
					],
				};
			} catch (error) {
				return {
					content: [
						{
							type: "text",
							text: `Error retrieving worker script: ${error instanceof Error && error.message}`,
						},
					],
				};
			}
		},
	);
}
