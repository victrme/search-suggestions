import { fetchProviderJson } from '../index.ts'
import type { Suggestions } from '../index.ts'

type DuckduckgoAPI = {
	phrase: string
}[]

export async function duckduckgo(q: string, lang: string): Promise<Suggestions> {
	const base = 'https://duckduckgo.com/ac/?q=%q&kl=%l'
	const url = base.replace('%q', q).replace('%l', lang)
	const json = await fetchProviderJson<DuckduckgoAPI>(url)

	if (json) {
		return Object.values(json).map((item) => ({ text: item.phrase }))
	}

	return []
}
