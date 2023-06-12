type Suggestions = {
	text: string
	desc?: string
	image?: string
}[]

export default async (request: Request): Promise<Response> => {
	const { pathname } = new URL(request.url)
	const provider = pathname.slice(1, pathname.slice(1).indexOf('/') + 1)
	const query = pathname.slice(provider.length + 2)

	let result: Suggestions = []

	switch (provider) {
		case 'duckduckgo':
			result = await duckduckgo(query)
			break

		case 'qwant':
			result = await qwant(query)
			break

		case 'yahoo':
			result = await yahoo(query)
			break

		default:
			result = []
			break
	}

	return Response.json(result)
}

const API_LIST = {
	bing: 'https://www.bing.com/AS/Suggestions?mkt=%l&qry=%q&cvid=9ECCF1FD07F64EA48B12A0CE5819B9BC',
	google: 'https://www.google.com/complete/search?q=%q&hl=%l&cp=2&client=gws-wiz&xssi=t',
	qwant: 'https://api.qwant.com/v3/suggest?q=%q&locale=%l',
	duckduckgo: 'https://duckduckgo.com/ac/?q=%q&kl=&l',
	yahoo: 'https://search.yahoo.com/sugg/gossip/gossip-us-fastbreak/?pq=&command=%q&output=sd1',
	startpage: 'https://www.startpage.com/suggestions?q=%q&lui=english&sc=i9RGhXphNiwC20',
}

function requestProviderAPI(url: string) {
	const r = fetch(url, {
		headers: {
			'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:109.0) Gecko/20100101 Firefox/114.0',
		},
	})

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
