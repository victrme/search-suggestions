import handler from '../../src'

export default {
	async fetch(request: Request) {
		const upgradeHeader = request.headers.get('Upgrade') === 'websocket'

		// When using GET method
		if (request.method === 'GET' && !upgradeHeader) {
			return await responseAsHttp(request)
		}

		// When using WS method
		if (request.method === 'WS' || (request.method === 'GET' && upgradeHeader)) {
			return createWebsocket()
		}

		return new Response('', { status: 405 })
	},
}

async function responseAsHttp(request: Request): Promise<Response> {
	const url = new URL(request.url)
	const params = new URLSearchParams(url.searchParams)

	const result = await handler({
		q: params.get('q') ?? '',
		lang: params.get('l') ?? 'en',
		with: params.get('with') ?? 'duckduckgo',
	})

	return new Response(JSON.stringify(result), {
		headers: {
			'Content-Type': 'application/json',
			'Access-Control-Allow-Origin': '*',
		},
	})
}

function createWebsocket() {
	let subRequestCount = 0
	const webSocketPair = new WebSocketPair()
	const [client, server] = Object.values(webSocketPair)

	//@ts-ignore
	server.accept()

	server.addEventListener(
		'message',
		debounce((ev: MessageEvent) => {
			if (subRequestCount++ === 50) {
				subRequestCount = 0
				server.send(JSON.stringify({ error: 'subrequest limit reached' }))
				server.close()
				return
			}

			try {
				const data = JSON.parse(ev.data.toString() ?? '{}')

				const response = handler({
					q: data.q ?? '',
					with: data.with ?? '',
					lang: data.lang ?? '',
				})

				response.then((response) => {
					server.send(JSON.stringify(response))
				})

				//
			} catch (error) {
				console.error(error)
				server.send('{error: ' + error + '}')
			}
		}, 150),
	)

	return new Response(null, {
		status: 101,
		webSocket: client,
	})
}

function debounce(callback: Function, delay: number) {
	let timer = 0

	return function (...args: unknown[]) {
		clearTimeout(timer)
		timer = setTimeout(() => callback(...args), delay)
	}
}
