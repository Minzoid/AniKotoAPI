/*
 * ======= • ======= • ======= • ======= • =======• =======
 * AniKotoAPI — recentlyUpdatedTabs.extractor.js
 * Repository: https://github.com/Shineii86/AniKotoAPI
 *
 * @description
 *   Extracts recently updated anime from homepage with tab filtering.
 *   Supports three tabs: all, dub, and sub for different update types.
 *
 * @exports
 *   extractRecentlyUpdatedTabs
 *
 * @author  Shinei Nouzen
 * @license MIT
 * ======= • ======= • ======= • ======= • =======• =======
 */

import * as cheerio from "cheerio";
import { fetchWithMirror } from "../helper/mirror.helper.js";

// ══════════════════════════════════════════════════════════════
// RECENTLY UPDATED TABS EXTRACTION
// ══════════════════════════════════════════════════════════════

// ---- FEATURE: Extract recently updated anime with tab filtering ----
/**
 * Fetches and parses the recently updated anime section from the homepage.
 * Supports filtering by update type: all, dub, or sub.
 *
 * @param {string} tab - Tab filter: "all", "dub", or "sub" (default: "all")
 * @returns {Promise<Array<Object>>} Array of recently updated anime objects
 * @returns {string} return[].slug - URL slug for the anime
 * @returns {string} return[].poster - Poster image URL
 * @returns {string} return[].title - English title
 * @returns {string} return[].japaneseTitle - Japanese title
 * @returns {number} return[].sub - Subbed episode count
 * @returns {number} return[].dub - Dubbed episode count
 * @returns {number} return[].total - Total episode count
 * @returns {string} return[].type - Anime type
 * @returns {string} return[].episodeInfo - Latest episode info
 *
 * @example
 *   const all = await extractRecentlyUpdatedTabs("all");
 *   console.log(all.length); // number of updated anime
 *
 *   const dubOnly = await extractRecentlyUpdatedTabs("dub");
 *   console.log(dubOnly[0].title); // first dubbed updated anime
 */
const extractRecentlyUpdatedTabs = async (tab = "all") => {
  try {
    const { data } = await fetchWithMirror("/home");
    const $ = cheerio.load(data);

    const results = [];

    // NOTE: Homepage has tabbed sections: updated-all, updated-dub, updated-sub
    // Each section has data-name attribute matching the tab name
    const selector = tab === "dub"
      ? ".top-table[data-name='updated-dub'] .item, #updated-dub .item"
      : tab === "sub"
        ? ".top-table[data-name='updated-sub'] .item, #updated-sub .item"
        : ".top-table[data-name='updated-all'] .item, #recent-update .item, .section-updated .item";

    $(selector).each((i, el) => {
      const slug = $(el).find("a").attr("href")?.split("/watch/").pop() || "";
      if (!slug) return;

      const poster = $(el).find("img").attr("src") || "";
      const title = $(el).find(".film-name a, .name.d-title, a.name").text().trim() || "";
      const japaneseTitle = $(el).find(".name.d-title, a.name").attr("data-jp") || "";
      const sub = parseInt($(el).find(".ep-status.sub span").text().trim()) || 0;
      const dub = parseInt($(el).find(".ep-status.dub span").text().trim()) || 0;
      const total = parseInt($(el).find(".ep-status.total span").text().trim()) || 0;
      const type = $(el).find(".meta .inner .right, .type, .fdi-item:nth-child(2)").text().trim() || "";
      const episodeInfo = $(el).find(".episode-info, .ep-info").text().trim() || "";

      results.push({ slug, poster, title, japaneseTitle, sub, dub, total, type, episodeInfo });
    });

    return results;
  } catch (error) {
    throw error;
  }
};

export { extractRecentlyUpdatedTabs };

// ══════════════════════════════════════════════════════════════ END: recentlyUpdatedTabs.extractor.js
