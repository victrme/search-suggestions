import { fetchProviderJson } from '../index.ts'
import type { Suggestions } from '../index.ts'

type QwantAPI = {
	status: string
	data: {
		items: { value: string }[]
		special: []
	}
}

export async function qwant(q: string, lang: string): Promise<Suggestions> {
	lang = lang === 'fr' ? 'fr' : 'en_US'

	const base = 'https://api.qwant.com/v3/suggest?q=%q&locale=%l'
	const url = base.replace('%q', q).replace('%l', lang)
	const json = await fetchProviderJson<QwantAPI>(url)

	if (json && json.status === 'success') {
		return json.data.items.map((item) => ({
			text: item.value,
		}))
	}

	return []
}
