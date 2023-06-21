# Search Suggestions API
An API that parses search suggestions from a number of search providers. Might not live very long depending on the volatility of their APIs. Here's the list of available search providers:

- Google ( w/ presentations )
- Yahoo ( w/ presentations )
- Bing ( w/ presentations )
- Duckduckgo
- Qwant
- Startpage

Try it here: https://searchsuggestions.netlify.app/duckduckgo/thanks

## How to use

```HTTP
GET /provider/query
```

```ts
type Response = {
  text: string
  desc?: string   // when presentation is available
  image?: string  // when presentation is available
}[]
```

## Examples

```HTTP
GET /duckduckgo/can we go to
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
GET /google/vercel
```

```json
[
  {
    "text": "vercel",
    "desc": "Vercel",
    "image": "https://encrypted-tbn0.gstatic.com/image...twA27Zwng&s=10"
  },
  {
    "text": "vercel deutsch"
  },
  {
    "text": "vercelli",
    "desc": "Vercelli",
    "image": "https://encrypted-tbn0.gstatic.com/image...T6EFkkz_s&s=10"
  },
  {
    "text": "vercel pricing"
  }
]
```
