export type Suggestions = {
	text: string
	desc?: string
	image?: string
}[]

const ARGS = {
	q: '',
	with: ' ',
	lang: '',
}

const API_LIST = {
	bing: 'https://www.bing.com/AS/Suggestions?qry=%q&mkt=%l&cp=5&csr=1&msbqf=false&cvid=7AE3B40123C74FFF87EF8A5ED4FAF455',
	google: 'https://www.google.com/complete/search?q=%q&hl=%l&client=gws-wiz',
	brave: 'https://search.brave.com/api/suggest?q=%q&rich=true',
	qwant: 'https://api.qwant.com/v3/suggest?q=%q&locale=%l',
	duckduckgo: 'https://duckduckgo.com/ac/?q=%q&kl=%l',
	yahoo: 'https://search.yahoo.com/sugg/gossip/gossip-us-fastbreak/?command=%q&output=sd1',
}

const headers = {
	'Accept-Language': 'en-US,en;q=1',
	'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:109.0) Gecko/20100101 Firefox/114.0',
}

export default async function handler(args = ARGS): Promise<Suggestions> {
	const { q, lang } = args
	let result: Suggestions = []

	headers['Accept-Language'] = (args?.lang ?? 'en-US') + ';q=0.9'

	if (!q || q.length === 0) {
		return []
	}

	switch (args.with) {
		case 'google':
			result = await google(q, lang)
			break

		case 'bing':
			result = await bing(q, lang)
			break

		case 'ddg':
		case 'duckduckgo':
			result = await duckduckgo(q, lang)
			break

		case 'brave':
			result = await brave(q)
			break

		case 'qwant':
			result = await qwant(q, lang)
			break

		case 'yahoo':
			result = await yahoo(q)
			break

		default:
			result = []
			break
	}

	return result
}

async function requestProviderAPI<API>(url: string): Promise<API | undefined> {
	const r = fetch(url, { headers })

	try {
		return (await (await r).json()) as API
	} catch (_) {
		console.warn("Can't parse JSON")
	}
}

async function requestProviderAPIAsText(url: string): Promise<string | undefined> {
	const r = fetch(url, { headers })

	try {
		return await (await r).text()
	} catch (_) {
		console.warn("Can't parse to text")
	}
}

// Providers

async function google(q: string, lang: string): Promise<Suggestions> {
	type GoogleDefinition = { l: { il: { t: { t: string }[] } }[] }
	type GoogleAPI = [
		[[string, number, number[], { zi: string; zs: string; ansa: GoogleDefinition }]],
	]

	const url = API_LIST.google.replace('%q', q).replace('%l', lang)
	let text = (await requestProviderAPIAsText(url)) ?? ''
	let json: GoogleAPI

	try {
		text = text.replace('window.google.ac.h(', '')
		text = text.slice(0, text.length - 1)
		json = JSON.parse(text) as GoogleAPI

		if (json) {
			return json[0].map((item) => {
				const wordDefinition = item[3]?.ansa?.l[1]?.il?.t[0]?.t // bruh

				const text = item[0]
					.replaceAll('<b>', '')
					.replaceAll('</b>', '')
					.replaceAll('&#39;', "'")
				const desc = (wordDefinition ?? item[3]?.zi ?? '').replaceAll('&#39;', "'")
				const image = item[3]?.zs

				return { text, image, desc }
			})
		}
	} catch (_) {
		console.warn('Failed while parsing Google response')
	}

	return []
}

async function bing(q: string, lang: string): Promise<Suggestions> {
	type BingSuggestions = {
		q: string
		u: string
		ext?: {
			des: string
			im: string
			t: string
		}
	}

	type Bing = { s: BingSuggestions[] }

	lang = lang.includes('-') ? lang : lang + '-' + lang

	const url = API_LIST.bing.replace('%q', q).replace('%l', lang)
	const json = await requestProviderAPI<Bing>(url)
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

async function qwant(q: string, lang: string): Promise<Suggestions> {
	type QwantAPI = {
		status: string
		data: {
			items: { value: string }[]
			special: []
		}
	}

	lang = lang === 'fr' ? 'fr' : 'en_US'

	const url = API_LIST.qwant.replace('%q', q).replace('%l', lang)
	const json = await requestProviderAPI<QwantAPI>(url)

	if (json && json.status === 'success') {
		return json.data.items.map((item) => ({ text: item.value }))
	}

	return []
}

async function duckduckgo(q: string, lang: string): Promise<Suggestions> {
	type DuckduckgoAPI = {
		phrase: string
	}[]

	const url = API_LIST.duckduckgo.replace('%q', q).replace('%l', lang)
	const json = await requestProviderAPI<DuckduckgoAPI>(url)

	if (json) {
		return Object.values(json).map((item) => ({ text: item.phrase }))
	}

	return []
}

async function yahoo(q: string): Promise<Suggestions> {
	type YahooAPI = {
		r: {
			k: string
			fd?: {
				imageUrl: string
			}
		}[]
	}

	const json = await requestProviderAPI<YahooAPI>(API_LIST.yahoo.replace('%q', q))

	if (json) {
		return json.r.map((item) => ({
			text: item.k,
			image: item.fd?.imageUrl,
		}))
	}

	return []
}

async function brave(q: string): Promise<Suggestions> {
	type BraveSearchAPI = [
		string,
		{
			q: string
			name?: string
			desc?: string
			img?: string
		}[],
	]

	const json = await requestProviderAPI<BraveSearchAPI>(API_LIST.brave.replace('%q', q))

	if (json) {
		return json[1]?.map((item) => ({
			text: item.q,
			desc: item.desc,
			image: item.img,
		}))
	}

	return []
}
