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
	startpage: 'https://www.startpage.com/suggestions?q=%q&sc=i9RGhXphNiwC20',
}

const headers = {
	'Accept-Language': 'en-US,en;q=1',
	'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:109.0) Gecko/20100101 Firefox/114.0',
}

export default {
	async fetch(request: Request): Promise<Response> {
		const { pathname } = new URL(request.url)
		let result: Suggestions = []
		let query = pathname.replace('/', '')
		let provider = 'duckduckgo'
		let lang = 'en'

		switch (provider) {
			case 'duckduckgo':
				result = await duckduckgo(query, lang)
				break

			default:
				result = []
				break
		}

		return new Response(JSON.stringify(result), {
			headers: {
				'Content-Type': 'application/json',
				'Access-Control-Allow-Origin': '*',
			},
		})
	},
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

async function duckduckgo(q: string, lang: string): Promise<Suggestions> {
	type DuckduckgoAPI = { phrase: string }[]

	const url = API_LIST.duckduckgo.replace('%q', q).replace('%l', lang)
	const json = await requestProviderAPI(url).json<DuckduckgoAPI>()

	if (json) {
		return Object.values(json).map((item) => ({ text: item.phrase }))
	}

	return []
}
