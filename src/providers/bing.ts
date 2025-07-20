import { fetchProviderJson } from '../index.ts'
import type { Suggestions } from '../index.ts'

type Bing = {
	s: {
		q: string
		u: string
		ext?: {
			des: string
			im: string
			t: string
		}
	}[]
}

export async function bing(q: string, lang: string): Promise<Suggestions> {
	lang = lang.includes('-') ? lang : lang + '-' + lang

	const base = 'https://www.bing.com/AS/Suggestions?qry=%q&mkt=%l&cp=5&csr=1&msbqf=false&cvid=7AE3B40123C74FFF87EF8A5ED4FAF455'
	const url = base.replace('%q', q).replace('%l', lang)
	const json = await fetchProviderJson<Bing>(url)
	const result: Suggestions = []

	if (!json) {
		return []
	}

	for (const item of Object.values(json.s)) {
		result.push({
			text: item.q.replace('\ue000', '').replace('\ue001', ''),
			desc: item.ext ? item.ext?.des : undefined,
			image: item.ext ? 'https://th.bing.com' + item.ext?.im : undefined,
		})
	}

	return result
}
