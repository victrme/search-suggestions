type Suggestions = {
	text: string
	desc?: string
	image?: string
}[]

const API_LIST = {
	bing: 'https://www.bing.com/AS/Suggestions?qry=%q&mkt=%l&cvid=9ECCF1FD07F64EA48B12A0CE5819B9BC',
	google: 'https://www.google.com/complete/search?q=%q&hl=%l&client=gws-wiz',
	qwant: 'https://api.qwant.com/v3/suggest?q=%q&locale=%l',
	duckduckgo: 'https://duckduckgo.com/ac/?q=%q&kl=%l',
	yahoo: 'https://search.yahoo.com/sugg/gossip/gossip-us-fastbreak/?command=%q&output=sd1',
	startpage: 'https://www.startpage.com/suggestions?q=%q&sc=',
}

const headers = {
	'Accept-Language': 'en-US,en;q=1',
	'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:109.0) Gecko/20100101 Firefox/114.0',
}

export default async function handler(requestURL: string): Promise<Suggestions> {
	const { searchParams } = new URL(requestURL)
	const provider = searchParams.get('with') ?? 'duckduckgo'
	const lang = searchParams.get('l') ?? 'en'
	const query = searchParams.get('q') ?? ''
	let result: Suggestions = []

	headers['Accept-Language'] = lang + ';q=0.9'

	switch (provider) {
		case 'google':
			result = await google(query, lang)
			break

		case 'bing':
			result = await bing(query, lang)
			break

		case 'duckduckgo':
			result = await duckduckgo(query, lang)
			break

		case 'qwant':
			result = await qwant(query, lang)
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

	return result
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
				text: item[0].replaceAll('<b>', '').replaceAll('</b>', ''),
				desc: item[3]?.zi,
				image: item[3]?.zs,
			}))
		}
	} catch (_) {
		console.warn('Failed while parsing Google response')
	}

	return []
}

async function bing(q: string, lang: string): Promise<Suggestions> {
	lang = lang.includes('-') ? lang : lang + '-' + lang

	const url = API_LIST.bing.replace('%q', q).replace('%l', lang)
	const text = (await requestProviderAPI(url).text()) ?? ''
	const result: Suggestions = []

	const elements = text.split('<li class="')
	elements.shift()

	for (const el of elements) {
		let text = ''
		let desc = ''
		let image = ''

		if (el.startsWith('pp_tile')) {
			const imgstart = el.indexOf('<img height="32" width="32" src="') + 33
			const imgend = el.indexOf('" role="presentation"/></div>')
			const txtstart = el.indexOf('<div class="pp_title">') + 22
			const txtend = el.indexOf('</div><span class="b_demoteText')
			const descstart = el.indexOf('data-appLinkHookId="demoteText">') + 32
			const descend = el.indexOf('</span></div>')

			image = el.slice(imgstart, imgend)
			text = el.slice(txtstart, txtend)
			desc = el.slice(descstart, descend)
		}

		if (el.startsWith('sa_sg')) {
			const start = el.indexOf('sa_tm_text">') + 12
			const end = el.indexOf('</span>')
			text = el.slice(start, end)
		}

		text = text.replace('<strong>', '')
		text = text.replace('</strong>', '')

		result.push({ text, desc, image })
	}

	return result
}

async function startpage(q: string): Promise<Suggestions> {
	type StartpageAPI = { suggestions: { text: string }[] }

	// ...find way to get search token
	// like this one: QFGfv5rfo2Ln20

	const json = await requestProviderAPI(API_LIST.startpage.replace('%q', q)).json<StartpageAPI>()

	if (json) {
		return json.suggestions.map((item) => item)
	}

	return []
}

async function qwant(q: string, lang: string): Promise<Suggestions> {
	type QwantAPI = {
		status: string
		data: {
			items: { value: string }[]
			special: []
		}
	}

	lang = lang.includes('-') ? lang.replace('-', '_') : lang + '_' + lang
	lang = lang === 'en_en' ? 'en_US' : lang

	const url = API_LIST.qwant.replace('%q', q).replace('%l', lang)
	const json = await requestProviderAPI(url).json<QwantAPI>()

	if (json && json.status === 'success') {
		return json.data.items.map((item) => ({ text: item.value }))
	}

	return []
}

async function duckduckgo(q: string, lang: string): Promise<Suggestions> {
	type DuckduckgoAPI = { phrase: string }[]

	const url = API_LIST.duckduckgo.replace('%q', q).replace('%l', lang)
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
