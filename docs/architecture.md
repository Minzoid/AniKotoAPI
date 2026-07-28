# Architecture

## Project Structure

```
AniKotoAPI/
├── server.js                          # Express entry point, port 4444
├── package.json                       # name: "AniKotoAPI"
├── vercel.json                        # Routes /api/* and /* to server.js
├── .env                               # Configuration (see .env.example)
│
├── public/                            # Static files served from process.cwd()
│   ├── index.html                     # Premium landing page (56KB, SVG icons, live console)
│   ├── 404.html                       # Glitch animation error page
│   ├── manifest.json                  # PWA manifest (theme: #A855F7)
│   ├── robots.txt                     # Crawler directives
│   ├── sitemap.xml                    # 4 pages (/, /tos, /privacy, /api)
│   ├── og-image.svg                   # SVG Open Graph image
│   ├── privacy.html                   # Privacy policy (served at /privacy)
│   └── tos.html                       # Terms of service (served at /tos)
│
├── docs/                              # API documentation
│   ├── index.md                       # Overview, quick start, features
│   ├── endpoints.md                   # Full API reference (38 endpoints)
│   ├── streaming.md                   # Streaming flow guide + resolver/proxy
│   ├── examples.md                    # cURL, JavaScript, Python, Node.js
│   └── architecture.md                # This file
│
├── src/
│   ├── configs/
│   │   ├── dataUrl.js                 # URL patterns, BASE_URL: https://anikototv.to
│   │   ├── header.config.js           # Request headers (User-Agent, Referer, etc.)
│   │   └── ids.config.js              # Genre/type/status/source/season ID mappings
│   │
│   ├── routes/
│   │   ├── apiRoutes.js               # All route definitions + OpenAPI spec (38 endpoints)
│   │   └── category.route.js          # genre/:name, type/:name, status/:name
│   │
│   ├── controllers/
│   │   ├── homeInfo.controller.js         # Homepage data
│   │   ├── search.controller.js       # Anime search
│   │   ├── animeInfo.controller.js         # Anime info (accepts ?id= or ?slug=)
│   │   ├── episodeList.controller.js     # Episode list
│   │   ├── episodeListAjax.controller.js # AJAX episode list
│   │   ├── servers.controller.js      # Server list
│   │   ├── stream.controller.js       # Stream URL
│   │   ├── streamResolver.controller.js  # 🆕 Stream URL resolution + quality detection
│   │   ├── suggestion.controller.js   # Anime suggestions
│   │   ├── spotlight.controller.js    # Spotlight anime
│   │   ├── trending.controller.js     # Trending anime
│   │   ├── topten.controller.js       # Top 10
│   │   ├── topAnimeRankings.controller.js # 🆕 Top rankings
│   │   ├── upcomingAnime.controller.js    # 🆕 Upcoming anime
│   │   ├── recentlyUpdatedTabs.controller.js # 🆕 Recently updated with tabs
│   │   ├── completedAnime.controller.js    # 🆕 Completed anime
│   │   ├── schedule.controller.js     # Schedule
│   │   ├── random.controller.js       # Random anime
│   │   ├── newRelease.controller.js   # New releases + Latest Updated
│   │   ├── popular.controller.js  # Most popular
│   │   ├── category.controller.js        # Genre/Type/Status filter
│   │   └── filter.controller.js       # Advanced filter
│   │
│   ├── extractors/
│   │   ├── homeInfo.extractor.js      # Homepage extraction
│   │   ├── search.extractor.js        # Search results
│   │   ├── animeInfo.extractor.js     # Anime details
│   │   ├── episodeList.extractor.js   # Episode list + server_ids
│   │   ├── episodeListAjax.extractor.js # AJAX episode list
│   │   ├── serverList.extractor.js    # Server list
│   │   ├── streamInfo.extractor.js    # Stream URL extraction (with session cookies)
│   │   ├── streamResolver.extractor.js  # 🆕 Stream URL resolution, M3U8 parser, server normalization
│   │   ├── spotlight.extractor.js     # Spotlight anime
│   │   ├── trending.extractor.js      # Trending anime
│   │   ├── topTen.extractor.js        # Top 10
│   │   ├── topAnimeRankings.extractor.js # 🆕 Top rankings from sidebar
│   │   ├── upcomingAnime.extractor.js    # 🆕 Upcoming anime
│   │   ├── recentlyUpdatedTabs.extractor.js # 🆕 Recently updated with tab filtering
│   │   ├── completedAnime.extractor.js    # 🆕 Completed anime from top-table
│   │   ├── schedule.extractor.js      # Schedule
│   │   ├── random.extractor.js        # Random anime
│   │   ├── newRelease.extractor.js    # New releases + Latest Updated
│   │   ├── mostPopular.extractor.js   # Most popular
│   │   ├── genre.extractor.js         # Genre filter
│   │   ├── filter.extractor.js        # Advanced filter (with source/season params)
│   │   ├── suggestion.extractor.js    # Suggestions
│   │   ├── seasons.extractor.js       # Seasons from watch page sidebar
│   │   ├── watchOrder.extractor.js    # Watch order from watch page sidebar
│   │   └── download.extractor.js      # Download links
│   │
│   └── helper/
│       ├── cache.helper.js            # LRU cache with configurable TTL
│       ├── mirror.helper.js           # Multi-mirror fallback (5 domains, 404-safe)
│       ├── extractPages.helper.js     # Page fetching with mirror fallback
│       ├── formatTitle.helper.js      # Title formatter
│       ├── countPages.helper.js       # Pagination counter
│       ├── parseListItem.helper.js    # 🆕 Shared list item parser with self-anchor detection
│       └── pagination.helper.js       # Pagination metadata generator
│
│   └── middleware/
│       └── creatorInfo.js             # Creator attribution injection
│
├── test.js                            # Test suite (38 tests)
├── agents/                            # AI agent prompts (6 agents)
└── CHANGELOG.md                       # Version history
```

## Tech Stack

| Component | Technology |
|-----------|------------|
| Runtime | Node.js |
| Framework | Express.js |
| Scraping | Cheerio + Axios |
| Deployment | Vercel (Serverless) |
| Caching | LRU cache with configurable TTL |
| Compression | gzip (level 6, 1024 byte threshold) |
| Mirror Fallback | 5 mirror domains with health checks |
| Middleware | Creator info attribution injection |
| Static Files | Express static middleware |

## Request Flow

```
Client Request
    ↓
Vercel Routes (/api/* → server.js)
    ↓
Express Middleware
    ↓
├── CORS
├── Security Headers
├── Compression (gzip)
├── Rate Limiting
├── Creator Info Injection
    ↓
Express Router (apiRoutes.js)
    ↓
Controller (e.g., search.controller.js)
    ↓
Extractor (e.g., search.extractor.js)
    ↓
HTTP Request to anikototv.to (with headers)
    ↓
Cheerio parses HTML response
    ↓
Returns structured JSON with Creator Attribution
    ↓
Client Response
```

## Streaming Flow

```
/api/episodes/:animeId
    ↓
    Returns: server_ids, animeId, totalEpisodes
    ↓
/api/servers?ids={server_ids}
    ↓
    Returns: link_id, type (sub/dub), name (HD-1, Vidstream-2, etc.)
    ↓
/api/stream?id={link_id}
    ↓
    Returns: url (embed URL), skipData (intro/outro timestamps)
    ↓
/api/stream/resolve?id={link_id}     ← 🆕 Resolve to actual video URL
    ↓
    Returns: url (m3u8/mp4), type, server name, subtitles
    ↓
/api/stream/qualities?url={m3u8_url} ← 🆕 Get quality options
    ↓
    Returns: qualities array with resolution, bandwidth, codec
    ↓
/api/stream/proxy?url={m3u8_url}     ← 🆕 CORS-free proxy
    ↓
    Returns: rewritten M3U8 with proxy URLs
```

## Caching Strategy

- **Type:** In-memory Map
- **TTL:** 5 minutes (300,000ms)
- **Key:** Full request URL
- **Behavior:** First request fetches from source, subsequent requests served from cache
- **Reset:** TTL resets on each access
- **Eviction:** Automatic when TTL expires

## Anti-Bot Protection

The source site monitors AJAX responses for missing `data-ep-id` and `data-link-id` attributes. If these are missing in the `/ajax/server/list` response, it triggers a reCAPTCHA challenge.

**Solution:** The API properly passes `data-ids` to the server list endpoint and parses the JSON response to extract the required attributes.

## Vercel Configuration

```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "server.js"
    },
    {
      "src": "/(.*)",
      "dest": "server.js"
    }
  ]
}
```

- `/api/*` routes to Express for API handling
- `/*` routes to Express for static file serving
- Static files served from `process.cwd()` (Vercel serverless compatible)

## Environment Variables

| Variable | Description |
|----------|-------------|
| `ANIKOTO_CHECK_SERVER_TS` | Anti-bot check timestamp from source site |

## Response Format

All API responses follow this structure:

```json
{
  "success": true,
  "results": { ... }
}
```

Error responses:

```json
{
  "success": false,
  "message": "Error description"
}
```

## Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| express | ^4.21.0 | Web framework |
| cheerio | ^1.0.0-rc.12 | HTML parsing |
| axios | ^1.8.0 | HTTP requests |
| cookie-parser | ^1.4.7 | Cookie parsing |
| dotenv | ^16.4.0 | Environment variables |
| compression | ^1.7.4 | Response compression |
