import handler from '../../src/handler.ts'

export default async (request: Request): Promise<Response> => {
	const result = await handler(request.url ?? '')

	return Response.json(result, {
		headers: {
			'Content-Type': 'application/json',
			'Access-Control-Allow-Origin': '*',
		},
	})
}
