type Detail = {
	desc: string
	image: URL
}

type Suggestions = {
	text: string
	detail?: Detail
}[]

const headers = {
	'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:109.0) Gecko/20100101 Firefox/114.0',
}

const providerURLs = {
	bing: 'https://www.bing.com/AS/Suggestions?mkt=%l&qry=%q&cvid=9ECCF1FD07F64EA48B12A0CE5819B9BC',
	google: 'https://www.google.com/complete/search?q=%q&hl=%l&cp=2&client=gws-wiz&xssi=t',
	qwant: 'https://api.qwant.com/v3/suggest?q=%q&locale=%l',
	duckduckgo: 'https://duckduckgo.com/ac/?q=%q&kl=&l',
	yahoo: 'https://search.yahoo.com/sugg/gossip/gossip-us-fastbreak/?command=%q',
	startpage: 'https://www.startpage.com/suggestions?q=%q&lui=english&sc=i9RGhXphNiwC20',
}

async function duckduckgo(q: string): Promise<Suggestions> {
	type DuckduckgoAPI = { phrase: string }[]

	try {
		const url = providerURLs.duckduckgo.replace('%q', q)
		const response = await fetch(url, { headers })
		const json = await response.json()
		return Object.values(json as DuckduckgoAPI).map((item) => ({ text: item.phrase }))
	} catch (error) {
		console.warn("Can't get suggestions")
		console.warn(error)
	}

	return []
}

export default async (request: Request) => {
	const { pathname } = new URL(request.url)
	const ddg = await duckduckgo(pathname.replace('/', ''))

	console.log(ddg)

	return Response.json({ hello: 'world' })
}
