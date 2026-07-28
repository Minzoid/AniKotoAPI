/*
 * ======= • ======= • ======= • ======= • =======• =======
 * AniKotoAPI — topAnimeRankings.extractor.js
 * Repository: https://github.com/Shineii86/AniKotoAPI
 *
 * @description
 *   Extracts top anime rankings from the homepage with sort options.
 *   Supports both "top" (all-time) and "newest" ranking modes.
 *   Parses ranked items with position numbers 1-9.
 *
 * @exports
 *   extractTopAnimeRankings
 *
 * @author  Shinei Nouzen
 * @license MIT
 * ======= • ======= • ======= • ======= • =======• =======
 */

import * as cheerio from "cheerio";
import { fetchWithMirror } from "../helper/mirror.helper.js";

// ══════════════════════════════════════════════════════════════
// TOP ANIME RANKINGS EXTRACTION
// ══════════════════════════════════════════════════════════════

// ---- FEATURE: Extract top anime rankings with sort option ----
/**
 * Fetches and parses the top anime rankings from the homepage.
 * Supports switching between "top" (all-time) and "newest" rankings.
 *
 * @param {string} sort - Ranking sort mode: "top" or "newest" (default: "top")
 * @returns {Promise<Array<Object>>} Array of ranked anime objects
 * @returns {number} return[].rank - Ranking position (1-9)
 * @returns {string} return[].slug - URL slug for the anime
 * @returns {string} return[].poster - Poster image URL
 * @returns {string} return[].title - Anime title
 * @returns {string} return[].japaneseTitle - Japanese title
 * @returns {number} return[].sub - Subbed episode count
 * @returns {number} return[].dub - Dubbed episode count
 * @returns {string} return[].type - Anime type
 * @returns {string} return[].views - View count
 *
 * @example
 *   const topAnime = await extractTopAnimeRankings("top");
 *   console.log(topAnime[0].rank); // 1
 *   console.log(topAnime[0].title); // #1 anime
 *
 *   const newest = await extractTopAnimeRankings("newest");
 *   console.log(newest[0].title); // #1 newest anime
 */
const extractTopAnimeRankings = async (sort = "top") => {
  try {
    // NOTE: Homepage contains both top and newest rankings in tabbed sections
    const { data } = await fetchWithMirror("/home");
    const $ = cheerio.load(data);

    const results = [];

    // NOTE: Ranking items have rank1 through rank9 classes for position
    // The data-sort attribute on tabs controls which ranking is displayed
    // We parse all ranked items and return them with position
    $("#top-anime .item, .top-anime .item, .top-table[data-name='top'] .item").each((i, el) => {
      const slug = $(el).find("a").attr("href")?.split("/watch/").pop() || "";
      if (!slug) return;

      const poster = $(el).find("img").attr("src") || "";
      const title = $(el).find(".name, .film-name a").text().trim() || "";
      const japaneseTitle = $(el).find(".name").attr("data-jp") || "";
      const sub = parseInt($(el).find(".ep-status.sub span").text().trim()) || 0;
      const dub = parseInt($(el).find(".ep-status.dub span").text().trim()) || 0;
      const type = $(el).find(".type").text().trim() || "";
      const views = $(el).find(".views, .view-count").text().trim() || "";

      // NOTE: Rank is determined by position in the list (1-indexed)
      const rank = i + 1;

      results.push({ rank, slug, poster, title, japaneseTitle, sub, dub, type, views });
    });

    return results;
  } catch (error) {
    throw error;
  }
};

export { extractTopAnimeRankings };

// ══════════════════════════════════════════════════════════════ END: topAnimeRankings.extractor.js
