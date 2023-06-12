type Detail = {
	desc: string
	image: URL
}

type Suggestions = {
	text: string
	detail?: Detail
}[]

const providerURLs = {
	bing: 'https://www.bing.com/AS/Suggestions?mkt=%l&qry=%q&cvid=9ECCF1FD07F64EA48B12A0CE5819B9BC',
	google: 'https://www.google.com/complete/search?q=%q&hl=%l&cp=2&client=gws-wiz&xssi=t',
	qwant: 'https://api.qwant.com/v3/suggest?q=%q&locale=%l',
	duckduckgo: 'https://duckduckgo.com/ac/?q=%q&kl=&l',
	yahoo: 'https://search.yahoo.com/sugg/gossip/gossip-us-fastbreak/?command=%q',
	startpage: 'https://www.startpage.com/suggestions?q=%q&lui=english&sc=i9RGhXphNiwC20',
}

function requestProviderAPI(url: string) {
	const r = fetch(url, {
		headers: {
			'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:109.0) Gecko/20100101 Firefox/114.0',
		},
	})

	return {
		json: async (): Promise<unknown | undefined> => {
			try {
				return await (await r).json()
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

	const url = providerURLs.qwant.replace('%q', q).replace('&locale=%l', '')
	const json = await requestProviderAPI(url).json()

	if (json && (json as QwantAPI).status === 'success') {
		return (json as QwantAPI).data.items.map((item) => ({ text: item.value }))
	}

	return []
}

async function duckduckgo(q: string): Promise<Suggestions> {
	type DuckduckgoAPI = { phrase: string }[]

	const url = providerURLs.duckduckgo.replace('%q', q)
	const json = await requestProviderAPI(url).json()

	if (json) {
		return Object.values(json as DuckduckgoAPI).map((item) => ({ text: item.phrase }))
	}

	return []
}

export default async (request: Request) => {
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

		default:
			result = []
			break
	}

	return Response.json(result)
}
