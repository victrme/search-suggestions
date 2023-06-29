import handler from '../../_handler.ts'

export default async (request: Request): Promise<Response> => {
	const Authorization = request.headers.get('Authorization')
	const AUTHKEY = Deno.env.get('AUTHKEY')
	let json = { lang: '', query: '', provider: '' }

	if (request.method === 'OPTIONS') {
		return new Response(null, {
			status: 200,
			headers: {
				'Access-Control-Max-Age': '86400',
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Allow-Methods': 'POST',
				'Access-Control-Allow-Headers': 'authorization',
			},
		})
	}

	if (AUTHKEY !== Authorization) {
		return new Response(JSON.stringify({ error: 'Authorization is incorrect: ' + Authorization }), {
			headers: {
				'Content-Type': 'application/json',
				'Access-Control-Allow-Origin': '*',
			},
			status: 401,
		})
	}

	try {
		json = await request.json()
	} catch (_) {
		return new Response(JSON.stringify({ error: 'Cannot parse request' }), {
			headers: {
				'Content-Type': 'application/json',
				'Access-Control-Allow-Origin': '*',
			},
			status: 500,
		})
	}

	const result = await handler({
		...json,
	})

	return Response.json(result, {
		headers: {
			'Content-Type': 'application/json',
			'Access-Control-Allow-Origin': '*',
		},
	})
}

// import { DOMParser, Element } from 'https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts'
// try {
// 	const document = new DOMParser().parseFromString(text, 'text/html')
// 	const items = Object.values(document?.querySelectorAll('ul li') ?? [])

// 	items.forEach((item) => {
// 		const imgdom = (item as Element).querySelector('img')
// 		const descdom = (item as Element).querySelector('.b_vPanel span')

// 		const desc = descdom?.textContent ?? ''

// 		result.push({
// 			text: item.textContent.replace(desc, ''),
// 			desc: descdom ? descdom?.textContent ?? '' : undefined,
// 			image: imgdom ? imgdom.getAttribute('src') ?? '' : undefined,
// 		})
// 	})

// 	return result
// } catch (_) {
// 	console.log("Can't parse bing HTML")
// }
