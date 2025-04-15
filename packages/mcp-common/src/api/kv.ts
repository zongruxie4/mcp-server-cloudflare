import {
	type Namespace,
	type NamespaceDeleteResponse,
	type NamespaceUpdateResponse,
} from 'cloudflare/resources/kv.mjs'

import type { Cloudflare } from 'cloudflare'

export async function handleKVNamespacesList({
	client,
	account_id,
	per_page = 100,
	page = 1,
}: {
	client: Cloudflare
	account_id: string
	per_page?: number
	page?: number
}): Promise<Namespace[]> {
	const response = await client.kv.namespaces.list({ account_id, per_page, page })
	return response.result
}

export async function handleKVNamespaceCreate({
	client,
	account_id,
	title,
}: {
	client: Cloudflare
	account_id: string
	title: string
}): Promise<Namespace> {
	const response = await client.kv.namespaces.create({ account_id, title })
	return response
}

export async function handleKVNamespaceDelete({
	client,
	account_id,
	namespace_id,
}: {
	client: Cloudflare
	account_id: string
	namespace_id: string
}): Promise<NamespaceDeleteResponse | null> {
	const response = await client.kv.namespaces.delete(namespace_id, { account_id })
	return response
}

export async function handleKVNamespaceGet({
	client,
	account_id,
	namespace_id,
}: {
	client: Cloudflare
	account_id: string
	namespace_id: string
}): Promise<Namespace> {
	const response = await client.kv.namespaces.get(namespace_id, { account_id })
	return response
}

export async function handleKVNamespaceUpdate({
	client,
	account_id,
	namespace_id,
	title,
}: {
	client: Cloudflare
	account_id: string
	namespace_id: string
	title: string
}): Promise<NamespaceUpdateResponse | null> {
	const response = await client.kv.namespaces.update(namespace_id, { account_id, title })
	return response
}
