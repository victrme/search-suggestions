import handler from '../_handler'

export default {
	async fetch(request: Request): Promise<Response> {
		const { pathname } = new URL(request.url)
		const cat = pathname.split('/')
		const provider = cat[1]
		const lang = cat[2]
		const query = pathname.slice(lang.length + provider.length + 3)

		let result = await handler({ lang, provider, query })

		return new Response(JSON.stringify(result), {
			headers: {
				'Content-Type': 'application/json',
				'Access-Control-Allow-Origin': '*',
			},
		})
	},
}
