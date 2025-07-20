import { expect } from '@std/expect'
import { testResponse } from './index.test.ts'
import handler from '../src/index.ts'

const providers = ['google', 'bing', 'yahoo', 'duckduckgo', 'qwant', 'brave']

Deno.test('Fallback to auto on bad lang parameter', async () => {
	for (const provider of providers) {
		const res = await handler({
			q: 'minecraft',
			lang: 'zesglljesh',
			with: provider,
		})
		testResponse(res)
	}
})

Deno.test('Correct french in description', async () => {
	const providersWithDesc = ['google'] //, 'bing']

	for (const provider of providersWithDesc) {
		const res = await handler({ q: 'minecraft', lang: 'fr', with: provider })
		const hasAccentAigu = JSON.stringify(res).includes('é')

		expect(hasAccentAigu).toBe(true)
	}
})
