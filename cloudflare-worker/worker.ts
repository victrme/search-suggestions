import handler from '../src/handler'

export default {
	async fetch(request: Request) {
		const upgradeHeader = request.headers.get('Upgrade')

		if (!upgradeHeader || upgradeHeader !== 'websocket') {
			return new Response('Expected Upgrade: websocket', { status: 426 })
		}

		const webSocketPair = new WebSocketPair()
		const [client, server] = Object.values(webSocketPair)
		let count = 0

		server.accept()

		server.addEventListener('message', (event) => {
			const url = event?.data?.toString() ?? ''

			if (count === 50) {
				server.close()
				return
			}

			handler(url).then((response) => {
				server.send(JSON.stringify(response))
			})

			count++
		})

		return new Response(null, {
			status: 101,
			webSocket: client,
		})
	},
}
