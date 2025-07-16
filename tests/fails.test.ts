import { expect } from '@std/expect'
import handler from '../src/index.ts'

Deno.test('When no parameters', async () => {
	const response = await handler()
	expect(JSON.stringify(response)).toBe('[]')
})

Deno.test('When undefined params', async () => {
	//@ts-ignore -> Type 'undefined' is not assignable to type 'string'.
	const response = await handler({ q: undefined, with: undefined, lang: undefined })
	expect(JSON.stringify(response)).toBe('[]')
})

Deno.test('When only provider', async () => {
	const response = await handler({ q: '', with: 'google', lang: '' })
	expect(JSON.stringify(response)).toBe('[]')
})
