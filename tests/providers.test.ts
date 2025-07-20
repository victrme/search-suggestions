import { testPresentation, testResponse } from './index.test.ts'
import handler from '../src/index.ts'

Deno.test('Google', async () => {
	const response = await handler({ q: 'hello', with: 'google', lang: '' })
	testResponse(response)
	testPresentation(response)
})

Deno.test('Bing', async () => {
	const response = await handler({ q: 'hello', with: 'bing', lang: '' })
	testResponse(response)
	testPresentation(response)
})

Deno.test('Yahoo', async () => {
	const response = await handler({ q: 'hello', with: 'yahoo', lang: '' })
	testResponse(response)
	testPresentation(response)
})

Deno.test('Duckduckgo', async () => {
	const response = await handler({ q: 'hello', with: 'ddg', lang: '' })
	testResponse(response)
})

Deno.test('Qwant', async () => {
	const response = await handler({ q: 'hello', with: 'qwant', lang: '' })
	testResponse(response)
})

Deno.test('Brave', async () => {
	const response = await handler({ q: 'hello', with: 'brave', lang: '' })
	testResponse(response)
})
