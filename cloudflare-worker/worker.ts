import handler from '../_handler'

export default {
	async fetch(request: Request): Promise<Response> {
		const result = await handler(request.url ?? '')

		return new Response(JSON.stringify(result), {
			headers: {
				'Content-Type': 'application/json',
				'Access-Control-Allow-Origin': '*',
			},
		})
	},
}
