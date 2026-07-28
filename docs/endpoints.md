# API Endpoints Reference

Base URL: `https://anikototvapi.vercel.app/api`

---

## Pagination

All list endpoints include pagination metadata in the response:

```json
{
  "success": true,
  "results": {
    "data": [...],
    "pagination": {
      "currentPage": 1,
      "totalPages": 294,
      "totalItems": 8820,
      "itemsPerPage": 30,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

| Field | Type | Description |
|:---|:---|:---|
| `currentPage` | `number` | Current page number (1-indexed) |
| `totalPages` | `number` | Total number of pages available |
| `totalItems` | `number` | Estimated total items across all pages |
| `itemsPerPage` | `number` | Number of items per page (default: 30) |
| `hasNext` | `boolean` | Whether there is a next page |
| `hasPrev` | `boolean` | Whether there is a previous page |

**Endpoints with pagination:** `/api/search`, `/api/most-popular`, `/api/new-release`, `/api/newly-added`, `/api/latest-updated`, `/api/az-list/:letter`, `/api/filter`, `/api/genre/:name`, `/api/type/:name`, `/api/status/:name`

---

## GET /

Returns homepage data: spotlight anime, trending, top-airing, and genres.

**Response:**

```json
{
  "success": true,
  "results": {
    "spotlights": [
      {
        "slug": "wistoria-wand-and-sword-season-2-dua04",
        "poster": "https://cdn.anipixcdn.co/background/101f58336250ee0d_1779363645.webp",
        "title": "Wistoria: Wand and Sword Season 2",
        "japaneseTitle": "Tsue to Tsurugi no Wistoria Season 2",
        "description": "",
        "rating": "PG-13",
        "quality": "HD"
      }
    ],
    "trending": [
      {
        "slug": "witch-hat-atelier-ikmut/ep-11",
        "poster": "https://cdn.anipixcdn.co/thumbnail/0412057393e8a45b3ba8b16874b6034d.jpg",
        "title": "Witch Hat Atelier",
        "japaneseTitle": "Tongari Boushi no Atelier",
        "sub": 11,
        "dub": 11,
        "total": 13,
        "type": "TV"
      }
    ],
    "topAiring": [
      {
        "slug": "wistoria-wand-and-sword-season-2-dua04",
        "poster": "https://cdn.anipixcdn.co/thumbnail/4739d8dbd05dddb73604f6240b83ea68.jpg",
        "title": "Wistoria: Wand and Sword Season 2",
        "sub": 9,
        "dub": 7,
        "type": ""
      }
    ],
    "genres": ["Action", "Adventure", "Cars", "Comedy", "Dementia", "Demons", "Drama", "Ecchi", "Fantasy", "Game", "Harem", "Historical", "Horror", "Isekai", "Josei", "Kids", "Magic", "Martial Arts", "Mecha", "Military", "Music", "Mystery", "Parody", "Police", "Psychological", "Romance", "Samurai", "School", "Sci-Fi", "Seinen", "Shoujo", "Shounen", "Slice of Life", "Space", "Sports", "Super Power", "Supernatural", "Thriller", "Vampire"]
  }
}
```

---

## GET /search

Search for anime by keyword.

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `keyword` | string | Yes | Search query |

**Request:**

```bash
curl "https://anikototvapi.vercel.app/api/search?keyword=naruto"
```

**Response:**

```json
{
  "success": true,
  "results": {
    "totalPages": 1,
    "data": [
      {
        "slug": "road-of-naruto-ggjw8/ep-1",
        "animeId": "7174",
        "poster": "https://cdn.anipixcdn.co/thumbnail/abfd676ad3a01f1e8860fecff9f5b8e0.jpg",
        "title": "Road of Naruto",
        "japaneseTitle": "Road of Naruto",
        "sub": 1,
        "dub": 0,
        "total": 0,
        "type": "ONA",
        "rating": "8.55",
        "genres": ["Action", "Fantasy", "Shounen"]
      }
    ]
  }
}
```

---

## GET /info

Get detailed info about an anime.

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Anime slug (e.g., `road-of-naruto-ggjw8`) |

**Request:**

```bash
curl "https://anikototvapi.vercel.app/api/info?id=road-of-naruto-ggjw8"
```

**Response:**

```json
{
  "success": true,
  "results": {
    "title": "Road of Naruto",
    "type": "ONA",
    "status": "Finished Airing",
    "totalEpisodes": null,
    "synopsis": "In celebration of 20 years of Naruto, Studio Pierrot posted an anniversary PV on their YouTube channel...",
    "malId": "53236",
    "genres": ["Action", "Fantasy", "Shounen"]
  }
}
```

---

## GET /episodes

Get episode list for an anime.

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Anime slug or animeId |

**Request:**

```bash
curl "https://anikototvapi.vercel.app/api/episodes/958"
```

**Response:**

```json
{
  "success": true,
  "results": {
    "animeId": 958,
    "slug": "958",
    "totalEpisodes": 220,
    "episodes": [
      {
        "id": "16638",
        "episode_no": 1,
        "slug": "1",
        "title": "",
        "active": true,
        "href": "#",
        "server_ids": "dXNCT3hNQzk3THhSTW8ySnM5...",
        "timestamp": "1729197616",
        "mal_id": "20"
      }
    ]
  }
}
```

> **Important:** The `server_ids` field is needed to fetch servers. Pass it to the `/servers` endpoint.

---

## GET /servers

Get available servers for an episode.

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `ids` | string | Yes | `server_ids` from `/episodes` response |

**Request:**

```bash
curl "https://anikototvapi.vercel.app/api/servers?ids=SlNVT25JaFlCMnZOeXZ2aG5takIx..."
```

**Response:**

```json
{
  "success": true,
  "results": [
    {
      "type": "sub",
      "ep_id": "110289",
      "link_id": "MTF1dkFtaW9BRTZPbzJJRElFZUZrOWdjeldjOERLaWNMMXFNbVB3WUJqOHZGS2FSWVgvbVJraVpIV1dQRjRoN01hOFUvYmxsWXFYNGtiR0h5OWdGQWc9PQ",
      "cmid": "animixplay-fqs",
      "sv_id": "1",
      "ep_id": "110289",
      "name": "HD-1"
    },
    {
      "type": "sub",
      "ep_id": "110289",
      "link_id": "MTF1dkFtaW9BRTZPbzJJRElFZUZrOWdjeldjOERLaWNMMXFNbVB3WUJqOEZ4cFNpMDdQbnV1S3dNdklpRkhWbzRsVmgxSGx4YWx3LytPcnZXU0RCVHc9PQ",
      "cmid": "animixplay-fqs",
      "sv_id": "2",
      "ep_id": "110289",
      "name": "Vidstream-2"
    }
  ]
}
```

> **Note:** There are usually 3 servers: HD-1 (sub), Vidstream-2 (sub), VidCloud-1 (sub).

---

## GET /stream

Get streaming URL for a server.

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | `link_id` from `/servers` response |

**Request:**

```bash
curl "https://anikototvapi.vercel.app/api/stream?id=MTF1dkFtaW9BRTZPbzJJRElFZUZrOWdjeldjOERLaWNMMXFNbVB3WUJqOHZGS2FSWVgvbVJraVpIV1dQRjRoN01hOFUvYmxsWXFYNGtiR0h5OWdGQWc9PQ"
```

**Response:**

```json
{
  "success": true,
  "results": {
    "linkId": "MTF1dkFtaW9BRTZPbzJJRElFZUZrOWdjeldjOERLaWNMMXFNbVB3WUJqOHZGS2FSWVgvbVJraVpIV1dQRjRoN01hOFUvYmxsWXFYNGtiR0h5OWdGQWc9PQ",
    "url": "https://megaplay.buzz/stream/s-5/94736/sub",
    "skipData": {
      "intro": [0, 0],
      "outro": [0, 0]
    }
  }
}
```

> **Note:** The `url` is a direct stream link. Use it with a video player like HLS.js or Plyr.

---

## GET /suggestions

Get anime suggestions based on keyword.

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `keyword` | string | Yes | Partial title for suggestions |

**Request:**

```bash
curl "https://anikototvapi.vercel.app/api/suggestions?keyword=naruto"
```

**Response:**

```json
{
  "success": true,
  "results": [
    {
      "slug": "road-of-naruto-ggjw8/ep-1",
      "poster": "https://cdn.anipixcdn.co/thumbnail/abfd676ad3a01f1e8860fecff9f5b8e0.jpg",
      "title": "Road of Naruto",
      "japaneseTitle": "Road of Naruto"
    }
  ]
}
```

---

## GET /spotlight

Get spotlight (featured) anime.

```bash
curl "https://anikototvapi.vercel.app/api/spotlight"
```

Returns array of spotlight anime with posters, descriptions, ratings, and quality info.

---

## GET /trending

Get currently trending anime.

```bash
curl "https://anikototvapi.vercel.app/api/trending"
```

**Response:**

```json
{
  "success": true,
  "results": [
    {
      "slug": "witch-hat-atelier-ikmut/ep-11",
      "poster": "https://cdn.anipixcdn.co/thumbnail/0412057393e8a45b3ba8b16874b6034d.jpg",
      "title": "Witch Hat Atelier",
      "japaneseTitle": "Tongari Boushi no Atelier",
      "sub": 11,
      "dub": 11,
      "total": 13,
      "type": "TV"
    }
  ]
}
```

---

## GET /top-ten

Get top 10 anime for today, this week, and this month.

```bash
curl "https://anikototvapi.vercel.app/api/top-ten"
```

Returns `{ today: [...], week: [...], month: [...] }`.

---

## GET /schedule

Get anime schedule.

```bash
curl "https://anikototvapi.vercel.app/api/schedule"
```

Returns array of scheduled anime with air times.

---

## GET /random

Get a random anime.

```bash
curl "https://anikototvapi.vercel.app/api/random"
```

**Response:**

```json
{
  "success": true,
  "results": {
    "title": "Massara",
    "type": "ONA",
    "genres": ["Slice of Life", "Music"]
  }
}
```

---

## GET /new-release

Get latest released episodes.

```bash
curl "https://anikototvapi.vercel.app/api/new-release"
```

Returns paginated list of recently released anime episodes.

---

## GET /most-popular

Get most popular anime.

```bash
curl "https://anikototvapi.vercel.app/api/most-popular"
```

Returns paginated list with `totalPages` and `data` array.

---

## GET /genre/:name

Get anime by genre.

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Genre name (e.g., `action`, `romance`) |
| `page` | number | No | Page number (default: 1) |

```bash
curl "https://anikototvapi.vercel.app/api/genre/action"
```

Returns paginated anime list filtered by genre.

---

## GET /type/:name

Get anime by type (TV, OVA, Movie, ONA, etc).

```bash
curl "https://anikototvapi.vercel.app/api/type/tv"
```

---

## GET /status/:name

Get anime by status (airing, completed, upcoming).

```bash
curl "https://anikototvapi.vercel.app/api/status/completed"
```

---

## GET /filter

Filter anime with multiple parameters.

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `keyword` | string | No | Search keyword (pass empty string if not searching) |
| `genre[]` | number | No | Genre IDs |
| `type` | string | No | TV, OVA, Movie, etc. |
| `status` | string | No | aired, ongoing, upcoming |
| `sort` | string | No | Most watched, score, name, etc. |
| `page` | number | No | Page number |

> **Important:** The `keyword` parameter must be present (even empty) or the site returns a 500 error.

```bash
curl "https://anikototvapi.vercel.app/api/filter?keyword=&genre[]=1"
```

Returns filtered and paginated anime list.

---

## GET /watch

Get full watch page data including servers, trending, and recommended anime.

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `slug` | string | Yes | Anime slug (e.g., `one-piece-100`) |
| `ep` | number | Yes | Episode number |

```bash
curl "https://anikototvapi.vercel.app/api/watch?slug=one-piece-100&ep=1"
```

Returns episode data with server list, trending sidebar, and recommended anime.

---

## GET /search/suggest

Get search autocomplete suggestions.

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `keyword` | string | Yes | Search keyword |

```bash
curl "https://anikototvapi.vercel.app/api/search/suggest?keyword=naruto"
```

Returns array of suggestion objects with title, ID, and image.

---

## GET /episodes-ajax/:id

Get AJAX-loaded episode list for an anime.

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Anime ID or slug |

```bash
curl "https://anikototvapi.vercel.app/api/episodes-ajax/one-piece-100"
```

Returns episode list with filters, ranges, and server IDs.

---

## GET /mapper-servers

Get cross-server mapping for gogoanime/anivibe servers.

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `malId` | number | Yes | MyAnimeList ID |
| `slug` | string | Yes | Anime slug |
| `timestamp` | number | Yes | Timestamp |

```bash
curl "https://anikototvapi.vercel.app/api/mapper-servers?malId=21&slug=one-piece-100&timestamp=1234567890"
```

Returns mapped server URLs for gogoanime/anivibe.

---

## GET /newly-added

Get newly added anime series.

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `page` | number | No | Page number (default: 1) |

```bash
curl "https://anikototvapi.vercel.app/api/newly-added"
```

Returns paginated list of newly added anime.

---

## GET /trending-sidebar

Get trending sidebar widget data.

```bash
curl "https://anikototvapi.vercel.app/api/trending-sidebar"
```

Returns trending anime for sidebar display.

---

## GET /seasons/:id

Get all seasons for an anime (main season, OVAs, movies, specials).

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | number | Yes | Anime numeric ID |

```bash
curl "https://anikototvapi.vercel.app/api/seasons/1642"
```

Returns all seasons including OVAs, movies, and specials for the anime.

---

## GET /watch-order/:id

Get recommended watch order for an anime franchise.

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | number | Yes | Anime numeric ID |

```bash
curl "https://anikototvapi.vercel.app/api/watch-order/1642"
```

Returns recommended watch order sequence with relationship types.

---

## GET /latest-updated

Get recently updated anime sorted by update time.

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `page` | number | No | Page number (default: 1) |

```bash
curl "https://anikototvapi.vercel.app/api/latest-updated"
```

Returns paginated list of recently updated anime.

---

## GET /download

Get download links for an anime episode.

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `slug` | string | Yes | Anime slug |
| `ep` | number | Yes | Episode number |

```bash
curl "https://anikototvapi.vercel.app/api/download?slug=one-piece-odmau&ep=1165"
```

Returns decoded download links for the specified episode.

---

## GET /az-list/:letter

Get anime alphabetically by letter.

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `letter` | string | Yes | Letter (a-z, or # for numbers) |
| `page` | number | No | Page number (default: 1) |

```bash
curl "https://anikototvapi.vercel.app/api/az-list/a"
```

Returns paginated list of anime starting with the specified letter.

---

## GET /upcoming

Get upcoming anime sorted by air date.

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `page` | number | No | Page number (default: 1) |

```bash
curl "https://anikototvapi.vercel.app/api/upcoming"
```

Returns paginated list of upcoming anime with sub/dub counts, type, and rating.

---

## GET /top-rankings

Get top-ranked anime (source site's top section).

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `page` | number | No | Page number (default: 1) |

```bash
curl "https://anikototvapi.vercel.app/api/top-rankings"
```

Returns paginated list with rank numbers extracted from CSS classes.

---

## GET /recently-updated

Get recently updated anime. Supports tab filtering.

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `tab` | string | No | Filter: `sub`, `dub`, `all` (default: `all`) |
| `page` | number | No | Page number (default: 1) |

```bash
curl "https://anikototvapi.vercel.app/api/recently-updated"
```

Returns paginated list from `#recent-update` section with client-side tab filtering.

---

## GET /completed

Get completed anime sorted by score.

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `page` | number | No | Page number (default: 1) |

```bash
curl "https://anikototvapi.vercel.app/api/completed"
```

Returns paginated list of finished anime from `section.top-table[data-name='completed']`.

---

## GET /stream/resolve

Resolve an embed URL to actual video URL (m3u8/mp4).

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | `link_id` from `/servers` response |
| `slug` | string | No | Anime slug (for session cookies) |

```bash
curl "https://anikototvapi.vercel.app/api/stream/resolve?id=MTF1dkFtaW9BRTZPbzJJRElFZUZr..."
```

Returns resolved URL, type (hls/mp4), server name, and subtitle URLs.

---

## GET /stream/qualities

Parse M3U8 playlist for available quality options.

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `url` | string | Yes | M3U8 playlist URL |

```bash
curl "https://anikototvapi.vercel.app/api/stream/qualities?url=https://example.com/playlist.m3u8"
```

Returns array of quality objects with url, quality label, resolution, bandwidth, and codec.

---

## GET /stream/proxy

M3U8 playlist proxy — rewrites relative URLs to proxy endpoints for CORS-free playback.

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `url` | string | Yes | M3U8 playlist URL |

```bash
curl "https://anikototvapi.vercel.app/api/stream/proxy?url=https://example.com/playlist.m3u8"
```

Returns rewritten M3U8 content with all `.m3u8` and `.ts` URLs pointing to proxy endpoints.

---

## GET /stream/ts-proxy

TS video segment proxy — serves `.ts` segments with proper Content-Type and CORS headers.

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `url` | string | Yes | `.ts` segment URL |

```bash
curl "https://anikototvapi.vercel.app/api/stream/ts-proxy?url=https://example.com/segment.ts"
```

Returns binary video segment with `Content-Type: video/mp2t` and `Access-Control-Allow-Origin: *`.
