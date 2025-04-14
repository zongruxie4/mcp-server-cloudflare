import type { Cloudflare } from 'cloudflare';
import { Namespace } from 'cloudflare/resources/kv.mjs';

export async function handleKVNamespacesList({
	client,
  account_id
}: {
    client: Cloudflare,
    account_id: string
}): Promise<Namespace[]> {
	const response = await client.kv.namespaces.list({ account_id })
	return response.result
}
