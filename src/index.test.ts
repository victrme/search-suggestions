import { expect, test, describe } from 'vitest'
import handler from './'

type Suggestions = {
	text: string
	desc?: string
	image?: string
}[]

const providers = ['google', 'bing', 'yahoo', 'duckduckgo', 'qwant']

function testPresentation(response: Suggestions) {
	const presentations = Object.values(response).filter((el) => el.image)
	expect(presentations.length > 0).toBe(true)
	expect(new URL(presentations[0].image ?? '')).toBeTruthy()
}

function testResponse(response: Suggestions) {
	expect(typeof response[0].text).toBe('string')
}

describe('Returns empty array', () => {
	test('When no parameters', async () => {
		const response = await handler()
		expect(JSON.stringify(response)).toBe('[]')
	})

	test('When undefined params', async () => {
		//@ts-ignore
		const response = await handler({ q: undefined, with: undefined, lang: undefined })
		expect(JSON.stringify(response)).toBe('[]')
	})

	test('When only provider', async () => {
		const response = await handler({ q: '', with: 'google', lang: '' })
		expect(JSON.stringify(response)).toBe('[]')
	})
})

describe('Providers', () => {
	test('Google', async () => {
		const response = await handler({ q: 'hello', with: 'google', lang: '' })
		testResponse(response)
		testPresentation(response)
	})

	test('Bing', async () => {
		const response = await handler({ q: 'hello', with: 'bing', lang: '' })
		testResponse(response)
		testPresentation(response)
	})

	test('Yahoo', async () => {
		const response = await handler({ q: 'hello', with: 'yahoo', lang: '' })
		testResponse(response)
		testPresentation(response)
	})

	test('Duckduckgo', async () => {
		const response = await handler({ q: 'hello', with: 'ddg', lang: '' })
		testResponse(response)
	})

	test('Qwant', async () => {
		const response = await handler({ q: 'hello', with: 'qwant', lang: '' })
		testResponse(response)
	})
})

describe('Localization', () => {
	test('Fallback to auto on bad lang parameter', async () => {
		for (const provider of providers) {
			const res = await handler({ q: 'minecraft', lang: 'zesglljesh', with: provider })
			testResponse(res)
		}
	})

	test('Correct french in description', async () => {
		const providersWithDesc = ['google'] //, 'bing']

		for (const provider of providersWithDesc) {
			const res = await handler({ q: 'minecraft', lang: 'zesglljesh', with: provider })
			const descs = res.map((el) => el.desc).filter((desc) => desc?.includes('Jeu vidéo'))

			expect(descs.length > 0).toBe(true)
		}
	})
})
