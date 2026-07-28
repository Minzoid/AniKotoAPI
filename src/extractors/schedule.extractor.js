/*
 * ======= • ======= • ======= • ======= • =======• =======
 * AniKotoAPI — schedule.extractor.js
 * Repository: https://github.com/Shineii86/AniKotoAPI
 *
 * @description
 *   Extracts anime schedule for a specific date.
 *   Returns airing times and episode numbers for scheduled anime.
 *
 * @exports
 *   extractSchedule
 *
 * @author  Shinei Nouzen
 * @license MIT
 * ======= • ======= • ======= • ======= • =======• =======
 */

import * as cheerio from "cheerio";
import { URLS } from "../configs/dataUrl.js";
import { fetchWithMirror } from "../helper/mirror.helper.js";

// ══════════════════════════════════════════════════════════════
// SCHEDULE EXTRACTION
// ══════════════════════════════════════════════════════════════

// ---- FEATURE: Extract anime schedule for a specific date ----
/**
 * Fetches and parses the anime schedule for a given date.
 * Returns airing times and episode numbers for scheduled anime.
 *
 * @param {string} date - Date to fetch schedule for (format: YYYY-MM-DD)
 * @returns {Promise<Array<Object>>} Array of scheduled anime objects
 * @returns {string} return.slug - URL slug for the anime
 * @returns {string} return.title - Anime title
 * @returns {string} return.time - Airing time
 * @returns {number} return.episode_no - Episode number
 *
 * @example
 *   const schedule = await extractSchedule("2024-01-15");
 *   console.log(schedule[0].time); // Airing time
 *   console.log(schedule[0].episode_no); // Episode number
 */
const extractSchedule = async (date) => {
  try {
    const path = `/?date=${date}`;
    const { data } = await fetchWithMirror(path);
    const $ = cheerio.load(data);

    const schedule = [];

    $(".schedule-item, .anime-schedule .item").each((i, el) => {
      const slug = $(el).find("a").attr("href")?.split("/watch/").pop() || "";
      const title = $(el).find(".film-name a, .name").text().trim() || "";
      const time = $(el).find(".time, .schedule-time").text().trim() || "";
      const episodeNo = parseInt($(el).find(".episode-no, .ep-num").text().trim()) || 0;

      if (slug) {
        schedule.push({
          slug,
          title,
          time,
          episode_no: episodeNo
        });
      }
    });

    return schedule;
  } catch (error) {
    throw error;
  }
};

export { extractSchedule };

// ══════════════════════════════════════════════════════════════ END: schedule.extractor.js
