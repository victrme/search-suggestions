type Suggestions = {
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
	bing: 'https://www.bing.com/AS/Suggestions?qry=%q&mkt=%l&cvid=9ECCF1FD07F64EA48B12A0CE5819B9BC',
	google: 'https://www.google.com/complete/search?q=%q&hl=%l&client=gws-wiz',
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

	headers['Accept-Language'] = args.lang + ';q=0.9'

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
	type GoogleDefinition = { l: { il: { t: { t: string }[] } }[] }
	type GoogleAPI = [[[string, number, number[], { zi: string; zs: string; ansa: GoogleDefinition }]]]

	const url = API_LIST.google.replace('%q', q).replace('%l', lang)
	let text = (await requestProviderAPI(url).text()) ?? ''
	let json: GoogleAPI

	try {
		text = text.replace('window.google.ac.h(', '')
		text = text.slice(0, text.length - 1)
		json = JSON.parse(text) as GoogleAPI

		if (json) {
			return json[0].map((item) => {
				const wordDefinition = item[3]?.ansa?.l[1]?.il?.t[0]?.t // bruh

				const text = item[0].replaceAll('<b>', '').replaceAll('</b>', '').replaceAll('&#39;', "'")
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
	lang = lang.includes('-') ? lang : lang + '-' + lang

	if (q.length === 0) {
		return []
	}

	let decode = (s: string): string => s

	try {
		const he = await import('he')
		decode = he.decode
	} catch (_) {
		console.warn('he failed to load')
	}

	const url = API_LIST.bing.replace('%q', q).replace('%l', lang)
	const text = (await requestProviderAPI(url).text()) ?? ''
	const result: Suggestions = []

	const elements = text.split('<li class="')
	elements.shift()

	for (const el of elements) {
		const isPresentation = el.indexOf('src="') > 0
		let text = ''
		let desc
		let image

		if (isPresentation) {
			const imgstart = el.indexOf('src="') + 5
			const imgend = el.indexOf('" role=', imgstart)
			const descstart = el.indexOf('data-appLinkHookId="demoteText">')

			if (descstart > 0) {
				const descend = el.indexOf('</span>', descstart + 32)
				desc = decode(el.slice(descstart + 32, descend))
			}

			const startstr = descstart > 0 ? 'pp_title">' : 'pp_title pp_titleOnly">'
			const txtstart = el.indexOf(startstr) + startstr.length
			const txtend = el.indexOf('</div>', txtstart)

			text = el.slice(txtstart, txtend)
			image = el.slice(imgstart, imgend)

			// cloudflare removes domains when fetching html
			if (image.startsWith('https://th.bing.com') === false) {
				image = 'https://th.bing.com' + image
			}
		} else {
			const start = el.indexOf('sa_tm_text">') + 12
			const end = el.indexOf('</span>', start)
			text = el.slice(start, end)
		}

		text = decode(text)
		text = text.replaceAll('<strong>', '')
		text = text.replaceAll('</strong>', '')

		result.push({ text, desc, image })
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
