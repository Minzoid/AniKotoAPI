/*
 * ======= • ======= • ======= • ======= • =======• =======
 * AniKotoAPI — streamInfo.extractor.js
 * Repository: https://github.com/Shineii86/AniKotoAPI
 *
 * @description
 *   Handles server/stream resolution for episodes — fetches individual
 *   stream URLs, server lists via AJAX, and alternative servers from
 *   the nekostream mapper API.
 *
 * @exports
 *   extractStreamInfo, extractServerList, extractMapperServers
 *
 * @author  Shinei Nouzen
 * @license MIT
 * ======= • ======= • ======= • ======= • =======• =======
 */

import * as cheerio from "cheerio";
import { headers } from "../configs/header.config.js";
import { BASE_URL } from "../configs/dataUrl.js";
import { fetchWithMirror } from "../helper/mirror.helper.js";

// ══════════════════════════════════════════════════════════════
// STREAM INFO EXTRACTOR
// ══════════════════════════════════════════════════════════════

// ---- FEATURE: Resolve a single stream URL from a linkId ----
/**
 * Fetches the actual stream URL and skip data for a given server link ID.
 * This is the primary method for resolving playable video URLs.
 *
 * @param {string} linkId - The server link ID to resolve
 * @returns {Promise<Object>} Object with linkId, url, and skipData (intro/outro timestamps)
 *
 * @example
 *   const stream = await extractStreamInfo("abc123");
 *   console.log(stream.url);      // direct video URL
 *   console.log(stream.skipData); // intro/outro skip ranges
 */
const extractStreamInfo = async (linkId) => {
  try {
    const path = `/ajax/server?get=${linkId}`;
    const { data } = await fetchWithMirror(path, {
      headers: { "X-Requested-With": "XMLHttpRequest" }
    });

    if (!data || !data.result) {
      return { linkId, url: null, skipData: null };
    }

    const result = typeof data.result === "string" ? (() => { try { return JSON.parse(data.result); } catch { return {}; } })() : data.result;

    return {
      linkId,
      url: result.url || null,
      skipData: result.skip_data || null
    };
  } catch (error) {
    throw error;
  }
};

// ══════════════════════════════════════════════════════════════
// SERVER LIST EXTRACTOR
// ══════════════════════════════════════════════════════════════

// ---- FEATURE: Fetch available servers for a set of episode IDs ----
/**
 * Retrieves the server list for the given episode IDs from the AJAX endpoint.
 * Returns raw server data as provided by the source site.
 *
 * @param {string} episodeIds - Comma-separated or single episode ID string
 * @returns {Promise<Array>} Array of server objects with type, link_id, ep_id, etc.
 *
 * @example
 *   const servers = await extractServerList("12345");
 *   console.log(servers[0].link_id); // first server's link ID
 */
const extractServerList = async (episodeIds) => {
  try {
    const path = `/ajax/server/list?servers=${episodeIds}`;
    const { data: raw } = await fetchWithMirror(path, {
      headers: { "X-Requested-With": "XMLHttpRequest" }
    });

    const html = typeof raw === "string" ? raw : (raw?.result || "");
    const $ = cheerio.load(html);

    const servers = [];
    $(".servers .type").each((_, typeEl) => {
      const type = $(typeEl).attr("data-type") || "sub";
      $(typeEl).find("li[data-link-id]").each((__, li) => {
        servers.push({
          type,
          ep_id: $(li).attr("data-ep-id") || "",
          link_id: $(li).attr("data-link-id") || "",
          cmid: $(li).attr("data-cmid") || "",
          sv_id: $(li).attr("data-sv-id") || "",
          name: $(li).text().trim() || ""
        });
      });
    });

    return servers;
  } catch (error) {
    throw error;
  }
};

// ══════════════════════════════════════════════════════════════
// MAPPER SERVERS EXTRACTOR
// ══════════════════════════════════════════════════════════════

// ---- FEATURE: Fetch alternative streaming servers from nekostream mapper API ----
/**
 * Queries the nekostream mapper API for alternative streaming providers
 * (sub and dub) for a given anime identified by MAL ID, slug, and timestamp.
 * Returns a flat array of server objects per provider.
 *
 * @param {number|string} malId - MyAnimeList ID for the anime
 * @param {string} slug - The anime slug on anikototv.to
 * @param {string|number} timestamp - Episode timestamp identifier
 * @returns {Promise<Array>} Array of server objects with provider, type, url, download fields
 *
 * @example
 *   const servers = await extractMapperServers(21, "one-piece", 1234567890);
 *   console.log(servers[0].provider); // "vidstreaming"
 *   console.log(servers[0].type);     // "sub" or "dub"
 */
const extractMapperServers = async (malId, slug, timestamp) => {
  try {
    if (!Number.isFinite(Number(malId))) throw new Error("Invalid malId");
    if (!/^[a-zA-Z0-9-]+$/.test(slug)) throw new Error("Invalid slug");
    if (!Number.isFinite(Number(timestamp))) throw new Error("Invalid timestamp");

    const path = `/ajax/mapper/${encodeURIComponent(malId)}/${encodeURIComponent(slug)}/${encodeURIComponent(timestamp)}`;
    const { data } = await fetchWithMirror(path);

    const servers = [];

    if (data && typeof data === "object") {
      for (const [provider, sources] of Object.entries(data)) {
        if (sources && sources.sub) {
          servers.push({
            provider,
            type: "sub",
            url: sources.sub.url || null,
            download: sources.sub.download || null
          });
        }
        if (sources && sources.dub) {
          servers.push({
            provider,
            type: "dub",
            url: sources.dub.url || null,
            download: sources.dub.download || null
          });
        }
      }
    }

    return servers;
  } catch (error) {
    return [];
  }
};

export { extractStreamInfo, extractServerList, extractMapperServers };

// ══════════════════════════════════════════════════════════════ END: streamInfo.extractor.js
