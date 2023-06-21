# Search Suggestions API

An API that parses search suggestions from a number of search providers. Might not live very long depending on the volatility of their APIs. Here's the list of available search providers:

-   Google ( w/ presentations )
-   Yahoo ( w/ presentations )
-   Bing ( w/ presentations )
-   Duckduckgo
-   Qwant
-   Startpage

Try it here: https://suggestions.deno.dev/

## How to use

#### Endpoint
```HTTP
POST /
```

#### Body
```json
{
  "lang": "",
  "query": "",
  "provider": ""
}
```

#### Headers
```json
  {
    "Authorization": "YOUR_AUTH_KEY"
  }
```

#### Response
```ts
type Response = {
  text: string
  desc?: string // when presentation is available
  image?: string // when presentation is available
}[]
```

## Examples

```json
{
  "lang": "en",
  "query": "can we go to",
  "provider": "duckduckgo"
}
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

```json
{
  "lang": "fr",
  "query": "vercel",
  "provider": "google"
}
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
