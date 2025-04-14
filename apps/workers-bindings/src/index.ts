import app from "./app";
import { McpAgent } from "agents/mcp";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import OAuthProvider from "@cloudflare/workers-oauth-provider";
import { handleKVNamespacesList } from "@repo/mcp-common/src/api/kv";
import { getCloudflareClient } from "@repo/mcp-common/src/cloudflare-api";
import {
	CloudflareAuthHandler,
	handleTokenExchangeCallback,
	type AccountSchema,
	type UserSchema,
} from "@repo/mcp-common/src/cloudflare-oauth-handler";

export type WorkersBindingsMCPState = { activeAccountId: string | null };

// Context from the auth process, encrypted & stored in the auth token
// and provided to the DurableMCP as this.props
export type Props = {
	accessToken: string;
	user: UserSchema["result"];
	accounts: AccountSchema["result"];
};

export class WorkersBindingsMCP extends McpAgent<Env, WorkersBindingsMCPState, Props> {
	server = new McpServer({
		name: "Demo",
		version: "1.0.0",
	});

	initialState: WorkersBindingsMCPState = {
		activeAccountId: null,
	};

	async init() {
		this.server.tool("add", { a: z.number(), b: z.number() }, async ({ a, b }) => ({
			content: [{ type: "text", text: String(a + b) }],
		}));
		this.server.tool('kv_namespaces_list', "List all of the kv namespaces in your Cloudflare account", {}, async () => {
			const account_id = this.getActiveAccountId();
			if (!account_id) {
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
				const namespaces = await handleKVNamespacesList({
					client: getCloudflareClient(this.props.accessToken),
					account_id
				});

				return {
					content: [
						{
							type: "text",
							text: JSON.stringify({
								namespaces,
								count: namespaces.length
							})
						}
					]
				}
			} catch(error) {
				return {
					content: [
						{
							type: "text",
							text: `Error listing KV namespaces: ${error instanceof Error && error.message}`,
						},
					],
				};
			}
		})
	}
	getActiveAccountId() {
		// TODO: Figure out why this fail sometimes, and why we need to wrap this in a try catch
		try {
			return this.state.activeAccountId ?? null;
		} catch (e) {
			return null;
		}
	}
}

// Export the OAuth handler as the default
export default new OAuthProvider({
	apiRoute: "/workers/bindings/sse",
	// TODO: fix these types
	// @ts-ignore
	apiHandler: WorkersBindingsMCP.mount("/workers/bindings/sse"),
	// @ts-ignore
	defaultHandler: CloudflareAuthHandler,
	authorizeEndpoint: "/oauth/authorize",
	tokenEndpoint: "/token",
	tokenExchangeCallback: handleTokenExchangeCallback,
	accessTokenTTL: 3600,
	clientRegistrationEndpoint: "/register",
});
