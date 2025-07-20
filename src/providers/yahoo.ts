import { fetchProviderJson } from '../index.ts'
import type { Suggestions } from '../index.ts'

type Yahoo = {
	r: {
		k: string
		fd?: {
			imageUrl: string
		}
	}[]
}

export async function yahoo(q: string): Promise<Suggestions> {
	const base = 'https://search.yahoo.com/sugg/gossip/gossip-us-fastbreak/?command=%q&output=sd1'
	const url = base.replace('%q', q)
	const json = await fetchProviderJson<Yahoo>(url)

	if (json) {
		return json.r.map((item) => ({
			text: item.k,
			image: item.fd?.imageUrl,
		}))
	}

	return []
}
