/*
 * ======= • ======= • ======= • ======= • =======• =======
 * AniKotoAPI — completedAnime.extractor.js
 * Repository: https://github.com/Shineii86/AniKotoAPI
 *
 * @description
 *   Extracts completed anime from the homepage section.
 *   Scrapes the completed tab/section for finished anime series.
 *
 * @exports
 *   extractCompletedAnime
 *
 * @author  Shinei Nouzen
 * @license MIT
 * ======= • ======= • ======= • ======= • =======• =======
 */

import * as cheerio from "cheerio";
import { fetchWithMirror } from "../helper/mirror.helper.js";

// ══════════════════════════════════════════════════════════════
// COMPLETED ANIME EXTRACTION
// ══════════════════════════════════════════════════════════════

// ---- FEATURE: Extract completed anime from homepage section ----
/**
 * Fetches and parses the completed anime section from the homepage.
 * Returns a list of anime that have finished airing.
 *
 * @returns {Promise<Array<Object>>} Array of completed anime objects
 * @returns {string} return[].slug - URL slug for the anime
 * @returns {string} return[].poster - Poster image URL
 * @returns {string} return[].title - English title
 * @returns {string} return[].japaneseTitle - Japanese title
 * @returns {number} return[].sub - Subbed episode count
 * @returns {number} return[].dub - Dubbed episode count
 * @returns {number} return[].total - Total episode count
 * @returns {string} return[].type - Anime type
 *
 * @example
 *   const completed = await extractCompletedAnime();
 *   console.log(completed.length); // number of completed anime
 *   console.log(completed[0].title); // first completed anime title
 */
const extractCompletedAnime = async () => {
  try {
    const { data } = await fetchWithMirror("/home");
    const $ = cheerio.load(data);

    const results = [];

    // NOTE: completed section contains finished anime series
    $(".top-table[data-name='completed'] .item, #completed .item, .completed-list .item").each((i, el) => {
      const slug = $(el).find("a").attr("href")?.split("/watch/").pop() || "";
      if (!slug) return;

      const poster = $(el).find("img").attr("src") || "";
      const title = $(el).find(".film-name a, .name.d-title, a.name").text().trim() || "";
      const japaneseTitle = $(el).find(".name.d-title, a.name").attr("data-jp") || "";
      const sub = parseInt($(el).find(".ep-status.sub span").text().trim()) || 0;
      const dub = parseInt($(el).find(".ep-status.dub span").text().trim()) || 0;
      const total = parseInt($(el).find(".ep-status.total span").text().trim()) || 0;
      const type = $(el).find(".meta .inner .right, .type, .fdi-item:nth-child(2)").text().trim() || "";

      results.push({ slug, poster, title, japaneseTitle, sub, dub, total, type });
    });

    return results;
  } catch (error) {
    throw error;
  }
};

export { extractCompletedAnime };

// ══════════════════════════════════════════════════════════════ END: completedAnime.extractor.js
