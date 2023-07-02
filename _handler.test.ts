import handler from './_handler'

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
	test('On bad URL', async () => {
		const response = await handler('hello there/')
		expect(JSON.stringify(response)).toBe('[]')
	})

	test('When no parameters', async () => {
		const response = await handler('localhost:8888/')
		expect(JSON.stringify(response)).toBe('[]')
	})

	test('When only provider', async () => {
		const response = await handler('localhost:8888/?with=duckduckgo')
		expect(JSON.stringify(response)).toBe('[]')
	})
})

describe('Providers', () => {
	test('Google', async () => {
		const response = await handler('localhost:8888/?q=hello&with=google')
		testResponse(response)
		testPresentation(response)
	})

	// test('Bing', async () => {
	// 	const response = await handler('localhost:8888/?q=hello&with=bing')
	// 	const presentations = Object.values(response).filter((el) => el.image)

	// 	console.log(presentations)

	// 	expect(typeof response[0].text).toBe('string')
	// 	expect(presentations.length > 0).toBe(true)
	// 	expect(new URL(presentations[0].image ?? '')).toBeTruthy()
	// })

	test('Yahoo', async () => {
		const response = await handler('localhost:8888/?q=hello&with=yahoo')
		testResponse(response)
		testPresentation(response)
	})

	test('Duckduckgo', async () => {
		const response = await handler('localhost:8888/?q=hello&with=duckduckgo')
		testResponse(response)
	})

	test('Qwant', async () => {
		const response = await handler('localhost:8888/?q=hello&with=qwant')
		testResponse(response)
	})
})

describe('Localization', () => {
	test('Fallback to auto on bad lang parameter', async () => {
		for (const provider of providers) {
			const res = await handler(`localhost:8888/?q=minecraft&l=zesglljesh&with=${provider}`)
			testResponse(res)
		}
	})
	test('Correct french in description', async () => {
		const providersWithDesc = ['google', 'bing']

		for (const provider of providersWithDesc) {
			const res = await handler(`localhost:8888/?q=minecraft&l=zesglljesh&with=${provider}`)
			const descs = res.map((el) => el.desc).filter((desc) => desc?.includes('Jeu vidéo'))

			expect(descs.length > 0).toBe(true)
		}
	})
})
