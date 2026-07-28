# Streaming Flow Guide

This guide explains how to get streaming URLs from AniKotoAPI in 3 steps.

## Overview

```
Step 1: Get Episodes   →  /api/episodes/:id
Step 2: Get Servers    →  /api/servers?ids={server_ids}
Step 3: Get Stream URL →  /api/stream?id={link_id}
```

---

## Step 1: Get Episodes

Each anime has multiple episodes. Fetch the episode list with the anime slug or animeId.

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

> **Key field:** `server_ids` — Pass this to the next step.

---

## Step 2: Get Servers

Each episode has multiple servers. Use the `server_ids` from Step 1.

**Request:**

```bash
curl "https://anikototvapi.vercel.app/api/servers?ids=dXNCT3hNQzk3THhSTW8ySnM5..."
```

**Response:**

```json
{
  "success": true,
  "results": [
    {
      "type": "sub",
      "ep_id": "16638",
      "link_id": "MTF1dkFtaW9BRTZPbzJJRElFZUZr...",
      "cmid": "animixplay-fqsqfvdf4u",
      "sv_id": "8e4",
      "name": "VidPlay-1"
    },
    {
      "type": "sub",
      "ep_id": "16638",
      "link_id": "MTF1dkFtaW9BRTZPbzJJRElFZUZr...",
      "cmid": "animixplay-fqsqfvdf4u",
      "sv_id": "323",
      "name": "HD-1"
    }
  ]
}
```

> **Key field:** `link_id` — Pick a server and pass its `link_id` to the next step.

---

## Step 3: Get Stream URL

Get the actual streaming URL using the `link_id` from Step 2.

**Request:**

```bash
curl "https://anikototvapi.vercel.app/api/stream?id=MTF1dkFtaW9BRTZPbzJJRElFZUZr..."
```

**Response:**

```json
{
  "success": true,
  "results": {
    "linkId": "MTF1dkFtaW9BRTZPbzJJRElFZUZr...",
    "url": "https://vidtube.site/stream/aVlsNDR3MnRLbWRvQUFBbWJUNERLQT09/sub",
    "skipData": {
      "intro": [0, 0],
      "outro": [0, 0]
    }
  }
}
```

> **Done!** Use `results.url` in your video player.

---

## JavaScript Example

```javascript
async function getStreamUrl(animeId) {
  // Step 1: Get episodes
  const episodesRes = await fetch(`https://anikototvapi.vercel.app/api/episodes/${animeId}`);
  const episodesData = await episodesRes.json();
  const episodes = episodesData.results.episodes;
  
  if (!episodes || episodes.length === 0) {
    throw new Error('No episodes found');
  }
  
  // Use first episode's server_ids
  const serverIds = episodes[0].server_ids;
  
  // Step 2: Get servers
  const serversRes = await fetch(`https://anikototvapi.vercel.app/api/servers?ids=${serverIds}`);
  const serversData = await serversRes.json();
  const servers = serversData.results;
  
  if (!servers || servers.length === 0) {
    throw new Error('No servers found');
  }
  
  // Pick first server (VidPlay-1)
  const linkId = servers[0].link_id;
  
  // Step 3: Get stream URL
  const streamRes = await fetch(`https://anikototvapi.vercel.app/api/stream?id=${linkId}`);
  const streamData = await streamRes.json();
  
  return streamData.results.url; // "https://vidtube.site/stream/..."
}

// Usage
getStreamUrl(958)
  .then(url => console.log('Stream URL:', url))
  .catch(err => console.error('Error:', err));
```

---

## Python Example

```python
import requests

def get_stream_url(anime_id):
    base = "https://anikototvapi.vercel.app/api"
    
    # Step 1: Get episodes
    episodes_res = requests.get(f"{base}/episodes/{anime_id}")
    episodes_data = episodes_res.json()
    episodes = episodes_data['results']['episodes']
    
    if not episodes:
        raise Exception("No episodes found")
    
    server_ids = episodes[0]['server_ids']
    
    # Step 2: Get servers
    servers_res = requests.get(f"{base}/servers", params={"ids": server_ids})
    servers_data = servers_res.json()
    servers = servers_data['results']
    
    if not servers:
        raise Exception("No servers found")
    
    link_id = servers[0]['link_id']
    
    # Step 3: Get stream URL
    stream_res = requests.get(f"{base}/stream", params={"id": link_id})
    stream_data = stream_res.json()
    
    return stream_data['results']['url']

# Usage
url = get_stream_url(958)
print(f"Stream URL: {url}")
```

---

## Player Integration

### HLS.js (HLS Streams)

```html
<script src="https://cdn.jsdelivr.net/npm/hls.js@latest"></script>
<video id="player" controls></video>

<script>
const url = 'https://megaplay.buzz/stream/s-5/94736/sub';
const video = document.getElementById('player');

if (Hls.isSupported()) {
  const hls = new Hls();
  hls.loadSource(url);
  hls.attachMedia(video);
}
</script>
```

### Plyr (MP4 Streams)

```html
<link rel="stylesheet" href="https://cdn.plyr.io/3.7.8/plyr.css" />
<video id="player" controls></video>
<script src="https://cdn.plyr.io/3.7.8/plyr.polyfilled.js"></script>

<script>
const player = new Plyr('#player');
player.source = {
  type: 'video',
  sources: [{ src: 'STREAM_URL_HERE' }]
};
</script>
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "No episodes found" | Check the anime ID is correct (use `/api/search` first to find slug, then use animeId) |
| "No servers found" | The `server_ids` may be invalid, try another episode |
| Stream URL 403 | Some servers require specific referrer headers |
| CORS error | Use `/api/stream/proxy` endpoint to proxy M3U8 playlists |

---

## Stream URL Resolution (v2.2.0)

The `/api/stream` endpoint returns an **embed URL** (e.g., `vidtube.site/stream/...`). To get the **actual video URL** (m3u8/mp4), use the resolver:

### Step 4: Resolve Embed URL to Video URL

```bash
# Resolve embed URL to actual stream URL
curl "https://anikototvapi.vercel.app/api/stream/resolve?id=MTF1dkFtaW9BRTZPbzJJRElFZUZr..."
```

```json
{
  "success": true,
  "results": {
    "url": "https://vid-tube.site/hls/b32de9d4a3230c95f52948373e6e1549.m3u8",
    "type": "hls",
    "server": "HD-1",
    "subtitles": []
  }
}
```

### Get Quality Options

```bash
curl "https://anikototvapi.vercel.app/api/stream/qualities?url=https://example.com/playlist.m3u8"
```

```json
{
  "success": true,
  "results": {
    "qualities": [
      { "url": "https://example.com/360.m3u8", "quality": "360p", "width": 640, "height": 360 },
      { "url": "https://example.com/720.m3u8", "quality": "720p", "width": 1280, "height": 720 }
    ]
  }
}
```

### M3U8 Proxy (CORS-Free Playback)

Browser video players often can't fetch M3U8 playlists directly due to CORS. Use the proxy:

```bash
# Proxy rewrites all relative URLs to go through our API
curl "https://anikototvapi.vercel.app/api/stream/proxy?url=https://example.com/playlist.m3u8"
```

The proxy:
1. Fetches the M3U8 playlist
2. Rewrites relative `.m3u8` URLs → `https://anikototvapi.vercel.app/api/stream/proxy?url=...`
3. Rewrites `.ts` segment URLs → `https://anikototvapi.vercel.app/api/stream/ts-proxy?url=...`
4. Returns the rewritten M3U8 content with CORS headers

---

## Alternative: All-in-One /watch Endpoint

For a simpler approach, use the `/watch` endpoint which returns episode data, servers, and recommendations in a single call.

**Request:**

```bash
curl "https://anikototvapi.vercel.app/api/watch?slug=naruto-eybxz&ep=1"
```

**Response includes:**
- Episode data with title, number, and description
- Server list (sub and dub)
- Trending sidebar anime
- Recommended anime
- Next episode schedule

This is useful when you need all watch page data at once instead of making 3 separate requests.

---

## Download Links

For downloading episodes, use the `/download` endpoint which returns decoded download links.

**Request:**

```bash
curl "https://anikototvapi.vercel.app/api/download?slug=one-piece-odmau&ep=1165"
```

**Response:**

```json
{
  "success": true,
  "results": {
    "downloadLinks": [...],
    "episodeNumber": 1165,
    "title": "One Piece"
  }
}
```

> **Note:** Download links are decoded from base64 data and may require browser interaction due to Cloudflare protection on some hosts.
