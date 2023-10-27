import type { Suggestions } from '../../src/index.ts'
import handler from '../../src/index.ts'

export default async (request: Request): Promise<Response> => {
	let result: Suggestions

	try {
		const params = new URL(request.url ?? '').searchParams
		result = await handler({
			q: params.get('q') ?? '',
			lang: params.get('l') ?? 'en',
			with: params.get('with') ?? 'duckduckgo',
		})
	} catch (_) {
		console.warn('Request URL is not valid')
		result = []
	}

	return Response.json(result, {
		headers: {
			'Content-Type': 'application/json',
			'Access-Control-Allow-Origin': '*',
		},
	})
}
