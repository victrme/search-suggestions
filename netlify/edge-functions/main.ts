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
		case 'google':
			result = await google(query)
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

const API_LIST = {
	bing: 'https://www.bing.com/AS/Suggestions?mkt=%l&qry=%q&cvid=9ECCF1FD07F64EA48B12A0CE5819B9BC',
	google: 'https://www.google.com/complete/search?q=%q&hl=%l&client=mobile-gws-wiz-hp',
	qwant: 'https://api.qwant.com/v3/suggest?q=%q&locale=%l',
	duckduckgo: 'https://duckduckgo.com/ac/?q=%q&kl=&l',
	yahoo: 'https://search.yahoo.com/sugg/gossip/gossip-us-fastbreak/?pq=&command=%q&output=sd1',
	startpage: 'https://www.startpage.com/suggestions?q=%q&sc=i9RGhXphNiwC20',
}

function requestProviderAPI(url: string) {
	const r = fetch(url, {
		headers: {
			Cookie: 'preferences=date_timeEEEworldN1Ndisable_family_filterEEE0N1Ndisable_open_in_new_windowEEE0N1Nenable_post_methodEEE0N1Nenable_proxy_safety_suggestEEE1N1Nenable_stay_controlEEE1N1Ninstant_answersEEE1N1Nlang_homepageEEEs%2Fdevice%2FenN1NlanguageEEEfrancaisN1Nlanguage_uiEEEenglishN1Nnum_of_resultsEEE10N1Nsearch_results_regionEEEallN1NsuggestionsEEE1N1Nwt_unitEEEcelsius',
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

async function google(q: string): Promise<Suggestions> {
	type GoogleAPI = [[[string, number, number[], { zh: string; zs: string }]]]

	const url = API_LIST.google.replace('%q', q).replace('&hl=%l', '')
	let text = (await requestProviderAPI(url).text()) ?? ''
	let json: GoogleAPI

	try {
		text = text.replace('window.google.ac.h(', '')
		text = text.slice(0, text.length - 1)
		json = JSON.parse(text) as GoogleAPI

		if (json) {
			return json[0].map((item) => ({
				text: item[0].replace('<b>', '').replace('</b>', ''),
				desc: item[3]?.zh,
				image: item[3]?.zs,
			}))
		}
	} catch (_) {
		console.warn('Failed while parsing Google response')
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
