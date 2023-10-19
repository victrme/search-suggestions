import handler from '../src'

let server: WebSocket
let client: WebSocket

export default {
	async fetch(request: Request) {
		const upgradeHeader = request.headers.get('Upgrade')

		if (!upgradeHeader || upgradeHeader !== 'websocket') {
			return new Response('Expected Upgrade: websocket', { status: 426 })
		}

		let subRequestCount = 0
		const webSocketPair = new WebSocketPair()
		client = webSocketPair[0]
		server = webSocketPair[1]

		server.accept()

		server.addEventListener(
			'message',
			debounce((ev: MessageEvent) => {
				if (subRequestCount++ === 50) {
					subRequestCount = 0
					server.close()
					return
				}

				sendMessage(ev)
			}, 150)
		)

		return new Response(null, {
			status: 101,
			webSocket: client,
		})
	},
}

function sendMessage(event: MessageEvent) {
	try {
		const data = JSON.parse(event.data.toString() ?? '{}')

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
