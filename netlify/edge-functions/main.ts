import { DOMParser, Element } from 'https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts'

type Suggestions = {
	text: string
	desc?: string
	image?: string
}[]

const API_LIST = {
	bing: 'https://www.bing.com/AS/Suggestions?qry=%q&cvid=9ECCF1FD07F64EA48B12A0CE5819B9BC',
	google: 'https://www.google.com/complete/search?q=%q&hl=%l&client=gws-wiz',
	qwant: 'https://api.qwant.com/v3/suggest?q=%q&locale=%l',
	duckduckgo: 'https://duckduckgo.com/ac/?q=%q&kl=&l',
	yahoo: 'https://search.yahoo.com/sugg/gossip/gossip-us-fastbreak/?pq=&command=%q&output=sd1',
	startpage: 'https://www.startpage.com/suggestions?q=%q&lui=%l&sc=i9RGhXphNiwC20',
}

const headers = {
	'Accept-Language': 'en;q=0.5',
	'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:109.0) Gecko/20100101 Firefox/114.0',
}

export default async (request: Request): Promise<Response> => {
	const { pathname } = new URL(request.url)
	const cat = pathname.split('/')
	const provider = cat[1] //pathname.slice(1, pathname.slice(1).indexOf('/') + 1)
	const lang = cat[2]
	const query = pathname.slice(lang.length + provider.length + 3) //pathname.slice(provider.length + 2)

	headers['Accept-Language'] = lang + ';q=1;fr-FR,fr;q=0.9;'

	console.log(provider, lang, query)

	let result: Suggestions = []

	switch (provider) {
		case 'google':
			result = await google(query, lang)
			break

		case 'bing':
			result = await bing(query)
			break

		case 'duckduckgo':
			result = await duckduckgo(query)
			break

		case 'qwant':
			result = await qwant(query)
			break

		case 'yahoo':
			result = await yahoo(query)
			break

		case 'startpage':
			result = await startpage(query)
			break

		default:
			result = []
			break
	}

	return Response.json(result)
}

function requestProviderAPI(url: string) {
	const r = fetch(url, { headers })

	return {
		json: async <API>(): Promise<API | undefined> => {
			try {
				return (await (await r).json()) as API
			} catch (_) {
				console.warn("Can't parse JSON")
			}
		},
		text: async (): Promise<string | undefined> => {
			try {
				return await (await r).text()
			} catch (_) {
				console.warn("Can't parse to text")
			}
		},
	}
}

async function google(q: string, lang: string): Promise<Suggestions> {
	type GoogleAPI = [[[string, number, number[], { zi: string; zs: string }]]]

	const url = API_LIST.google.replace('%q', q).replace('%l', lang)
	let text = (await requestProviderAPI(url).text()) ?? ''
	let json: GoogleAPI

	try {
		text = text.replace('window.google.ac.h(', '')
		text = text.slice(0, text.length - 1)
		json = JSON.parse(text) as GoogleAPI

		if (json) {
			return json[0].map((item) => ({
				text: item[0].replace('<b>', '').replace('</b>', ''),
				desc: item[3]?.zi,
				image: item[3]?.zs,
			}))
		}
	} catch (_) {
		console.warn('Failed while parsing Google response')
	}

	return []
}

async function bing(q: string): Promise<Suggestions> {
	const url = API_LIST.bing.replace('%q', q).replace('mkt=%l&', '')
	const text = (await requestProviderAPI(url).text()) ?? ''
	const result: Suggestions = []

	try {
		const document = new DOMParser().parseFromString(text, 'text/html')
		const items = Object.values(document?.querySelectorAll('ul li') ?? [])

		items.forEach((item) => {
			const imgdom = (item as Element).querySelector('img')
			const descdom = (item as Element).querySelector('.b_vPanel span')

			const desc = descdom?.textContent ?? ''

			result.push({
				text: item.textContent.replace(desc, ''),
				desc: descdom ? descdom?.textContent ?? '' : undefined,
				image: imgdom ? imgdom.getAttribute('src') ?? '' : undefined,
			})
		})

		return result
	} catch (_) {
		console.log("Can't parse bing HTML")
	}

	return []
}

async function startpage(q: string): Promise<Suggestions> {
	type StartpageAPI = { suggestions: { text: string }[] }

	const json = await requestProviderAPI(API_LIST.startpage.replace('%q', q)).json<StartpageAPI>()

	if (json) {
		return json.suggestions.map((item) => item)
	}

	return []
}

async function qwant(q: string): Promise<Suggestions> {
	type QwantAPI = {
		status: string
		data: {
			items: { value: string }[]
			special: []
		}
	}

	const url = API_LIST.qwant.replace('%q', q).replace('&locale=%l', '')
	const json = await requestProviderAPI(url).json<QwantAPI>()

	if (json && json.status === 'success') {
		return json.data.items.map((item) => ({ text: item.value }))
	}

	return []
}

async function duckduckgo(q: string): Promise<Suggestions> {
	type DuckduckgoAPI = { phrase: string }[]

	const url = API_LIST.duckduckgo.replace('%q', q)
	const json = await requestProviderAPI(url).json<DuckduckgoAPI>()

	if (json) {
		return Object.values(json).map((item) => ({ text: item.phrase }))
	}

	return []
}

async function yahoo(q: string): Promise<Suggestions> {
	type YahooAPI = {
		r: { k: string; fd?: { imageUrl: string } }[]
	}

	const json = await requestProviderAPI(API_LIST.yahoo.replace('%q', q)).json<YahooAPI>()

	if (json) {
		return json.r.map((item) => ({
			text: item.k,
			image: item.fd?.imageUrl,
		}))
	}

	return []
}
