import { z } from "zod";
import { V4Schema } from "../v4-api";

type AccountSchema = z.infer<typeof AccountSchema>
const AccountSchema = z.object({
	id: z.string(),
	name: z.string(),
	created_on: z.string(),
});
const AccountsListResponseSchema = V4Schema(z.array(AccountSchema));

export async function handleAccountsList({
	apiToken,
}: {
	apiToken: string;
}): Promise<AccountSchema[]> {
	// Currently limited to 50 accounts
	const response = await fetch("https://api.cloudflare.com/client/v4/accounts?per_page=50", {
		method: "GET",
		headers: {
			Authorization: `Bearer ${apiToken}`,
			Accept: "application/javascript",
		},
	});

	if (!response.ok) {
		const error = await response.text();
		throw new Error(`Cloudflare API request failed: ${error}`);
	}

	return AccountsListResponseSchema.parse(await response.json()).result ?? [];
}
