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

		server.addEventListener(
			'message',
			debounce((event: MessageEvent) => {
				const url = event.data?.toString() ?? ''

				if (count === 50) {
					server.close()
					return
				}

				handler(url).then((response) => {
					server.send(JSON.stringify(response))
				})

				count++
			}, 200)
		)

		return new Response(null, {
			status: 101,
			webSocket: client,
		})
	},
}

function debounce(callback: Function, delay: number) {
	let timer = setTimeout(() => {})

	return function () {
		clearTimeout(timer)

		timer = setTimeout(() => {
			callback(...arguments)
		}, delay)
	}
}
