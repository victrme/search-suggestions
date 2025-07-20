import { duckduckgo } from './providers/duckduckgo.ts'
import { google } from './providers/google.ts'
import { brave } from './providers/brave.ts'
import { qwant } from './providers/qwant.ts'
import { yahoo } from './providers/yahoo.ts'
import { bing } from './providers/bing.ts'

export type Suggestions = {
	text: string
	desc?: string
	image?: string
}[]

const headers = {
	'Accept-Language': 'en-US,en;q=1',
	'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:109.0) Gecko/20100101 Firefox/114.0',
}

export default async function handler(args = { q: '', with: '', lang: '' }): Promise<Suggestions> {
	const { q, lang } = args

	if (!q) {
		return []
	}

	if (lang) {
		headers['Accept-Language'] = `${lang};q=0.9`
	}

	switch (args.with) {
		case 'ddg':
		case 'duckduckgo':
			return await duckduckgo(q, lang)
		case 'google':
			return await google(q, lang)
		case 'bing':
			return await bing(q, lang)
		case 'brave':
			return await brave(q)
		case 'qwant':
			return await qwant(q, lang)
		case 'yahoo':
			return await yahoo(q)
		default:
			return []
	}
}

//
//	Helpers
//

export async function fetchProviderJson<T>(url: string): Promise<T | undefined> {
	try {
		const response = await fetch(url, { headers })
		try {
			return await response.json() as T
		} catch (_) {
			console.warn(`Cannot parse ${url} as JSON`)
		}
	} catch (_) {
		console.warn(`Cannot reach ${url}`)
	}
}

export async function fetchProviderText(url: string): Promise<string | undefined> {
	try {
		const response = await fetch(url, { headers })
		try {
			return await response.text()
		} catch (_) {
			console.warn(`Cannot get ${url} as text`)
		}
	} catch (_) {
		console.warn(`Cannot reach ${url}`)
	}
}
