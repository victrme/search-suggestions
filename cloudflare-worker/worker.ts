import handler from '../src/handler'

export default {
	async fetch(request: Request) {
		const upgradeHeader = request.headers.get('Upgrade')

		if (!upgradeHeader || upgradeHeader !== 'websocket') {
			return new Response('Expected Upgrade: websocket', { status: 426 })
		}

		const webSocketPair = new WebSocketPair()
		const [client, server] = Object.values(webSocketPair)

		server.accept()

		server.addEventListener('message', (event) => {
			handler(event.data.toString()).then((response) => {
				server.send(JSON.stringify(response))
			})
		})

		return new Response(null, {
			status: 101,
			webSocket: client,
		})
	},
}
