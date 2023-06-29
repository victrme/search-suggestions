import handler from '../_handler'

export default {
	async fetch(request: Request): Promise<Response> {
		const { pathname } = new URL(request.url)

		let result = await handler({
			lang: 'en',
			provider: 'duckduckgo',
			query: pathname.replace('/', '') ?? '',
		})

		return new Response(JSON.stringify(result), {
			headers: {
				'Content-Type': 'application/json',
				'Access-Control-Allow-Origin': '*',
			},
		})
	},
}
