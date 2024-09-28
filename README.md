# Search Suggestions API

An API that parses search suggestions from a number of search providers. Might not live very long depending on the volatility of their APIs. Here's the list of available search providers:

-   Google ( w/ presentations )
-   Yahoo ( w/ presentations )
-   Brave ( w/ presentations )
-   Bing ( w/ presentations )
-   Duckduckgo
-   Qwant

Try it here: https://suggestions.victr.me/

## How to use

#### Endpoint
```HTTP
GET /
```

| Parameter | Role            | Requirement |
|-----------|-----------------|-------------|
| `q`       | Search query    | required    |
| `l`       | Localization    | optional    |
| `with`    | Search provider | optional    |

#### Response
```ts
type Response = {
  text: string
  desc?: string // when presentation is available
  image?: string // when presentation is available
}[]
```

### Websockets
Using Clouflare workers, you can also get results using websockets.

```js
const socket = new WebSocket('ws://localhost:8787')

socket.onmessage = function (event: MessageEvent) {
  console.log(JSON.parse(event.data))
}

socket.send(JSON.stringify({ q, with, lang }))
```


## Examples

```HTTP
GET /?q=can%20we%20go%20to
```

```json
[
  { "text": "can we go to heaven with tattoos" },
  { "text": "can we go to mars" },
  { "text": "can we go to saturn" },
  { "text": "can we go to your room now" }
]
```

<br />

```HTTP
GET /?with=google&q=vercel&l=fr
```

```json
[
  {
    "text": "vercel"
  },
  {
    "text": "vercelli",
    "desc": "Verceil — Ville en Italie",
    "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQID9TX_tSffwg1RLvecGtuPHMZWbbEOSx0d6_poXT6bqChYkEazWYz6G1ilQ&s=10"
  },
  {
    "text": "vercel villedieu le camp",
    "desc": "Commune en France",
    "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQGB1DiSdJxQgJfHphVKCfENgDCeGWobdbBpErowNFfDEExoFTuRmmPfEVJuQ&s=10"
  },
  {
    "text": "vercel pricing"
  },
  {
    "text": "vercel deploy"
  }
]
```

## Install

First clone this repository.

### Netlify

```bash
npm install netlify-cli -g

# On port 8888
netlify dev
```

### Cloudflare Workers

```bash
npm install wrangler -g

# On port 8787
wrangler dev

wrangler deploy
```
