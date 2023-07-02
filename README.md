[![Netlify Status](https://api.netlify.com/api/v1/badges/2476474f-17f1-4c71-844f-2a1a3fc75496/deploy-status)](https://app.netlify.com/sites/searchsuggestions/deploys)
![Static Badge](https://img.shields.io/badge/Cloudflare_Workers-should_work-yellow)

# Search Suggestions API

An API that parses search suggestions from a number of search providers. Might not live very long depending on the volatility of their APIs. Here's the list of available search providers:

-   Google ( w/ presentations )
-   Yahoo ( w/ presentations )
-   Bing ( w/ presentations )
-   Duckduckgo
-   Qwant

Try it here: https://suggestions.deno.dev/

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

First clone this repository

### Netlify

#### Develop
```bash
  npm i -g netlify
  netlify dev
```
### Deploy
Using app.netlify.com dashboard, for conveniance.

### Cloudflare Workers

#### Develop
```bash
  npm i -g wrangler
  wrangler dev
```

#### Deploy
```bash
  wrangler login
  wrangler deploy
```
