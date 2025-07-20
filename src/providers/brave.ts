import { fetchProviderJson, type Suggestions } from '../index.ts'

type BraveSearch = [
	string,
	{
		q: string
		name?: string
		desc?: string
		img?: string
	}[],
]

export async function brave(query: string): Promise<Suggestions> {
	const base = 'https://search.brave.com/api/suggest'
	const url = base + `?q=${query}&rich=true`
	const json = await fetchProviderJson<BraveSearch>(url)

	if (!json) {
		return []
	}

	return json[1]?.map((item) => ({
		text: item.q,
		desc: item.desc,
		image: item.img,
	}))
}
