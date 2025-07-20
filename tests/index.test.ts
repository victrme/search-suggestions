import { expect } from '@std/expect'

type Suggestions = {
	text: string
	desc?: string
	image?: string
}[]

export function testPresentation(response: Suggestions) {
	const presentations = Object.values(response).filter((el) => el.image)
	expect(presentations.length > 0).toBe(true)
	expect(new URL(presentations[0].image ?? '')).toBeTruthy()
}

export function testResponse(response: Suggestions) {
	expect(typeof response[0].text).toBe('string')
}
