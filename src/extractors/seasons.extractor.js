/*
 * ======= • ======= • ======= • ======= • =======• =======
 * AniKotoAPI — seasons.extractor.js
 * Repository: https://github.com/Shineii86/AniKotoAPI
 *
 * @description
 *   Extracts season information for a specific anime from the
 *   anikototv.to AJAX endpoint. Returns all seasons/OVAs/specials
 *   for a given anime series.
 *
 * @exports
 *   extractSeasons
 *
 * @author  Shinei Nouzen
 * @license MIT
 * ======= • ======= • ======= • ======= • =======• =======
 */

import * as cheerio from "cheerio";
import { fetchWithMirror } from "../helper/mirror.helper.js";

/**
 * Fetches and parses season information for an anime.
 * Scrapes the AJAX endpoint that returns season carousel HTML.
 *
 * @param {string|number} animeId - The numeric anime ID
 * @returns {Promise<Object>} Object with animeId, totalSeasons, and seasons array
 *
 * @example
 *   const seasons = await extractSeasons(7174);
 *   console.log(seasons.totalSeasons); // number of seasons
 *   console.log(seasons.seasons[0].title); // first season title
 */
const extractSeasons = async (animeId) => {
  try {
    const { data } = await fetchWithMirror(`/api/seasons/${animeId}`, {
      headers: { "X-Requested-With": "XMLHttpRequest" }
    });

    // Handle both string HTML and JSON responses
    let raw = "";
    if (typeof data === "string") {
      try {
        const json = JSON.parse(data);
        raw = json.result || data;
      } catch (e) {
        raw = data;
      }
    } else if (data?.result) {
      raw = data.result;
    } else if (data?.data) {
      raw = data.data;
    }
    
    const $ = cheerio.load(raw);

    const seasons = [];
    
    // Try multiple selectors to handle different HTML structures
    const selectors = [
      ".swiper-slide.season",
      ".seasons .swiper-slide",
      "#w-seasons .swiper-slide",
      ".swiper-slide"
    ];
    
    for (const selector of selectors) {
      $(selector).each((_, el) => {
        const link = $(el).find("a").first();
        const href = link.attr("href") || "";
        const style = link.attr("style") || "";
        const poster = style.match(/url\(['"]?(.+?)['"]?\)/)?.[1] || "";
        const title = $(el).find(".name").text().trim() || 
                     link.text().trim() || "";

        // Extract slug from href
        const slug = href.split("/watch/").pop() || "";

        if (slug || title) {
          seasons.push({ title, slug, poster, url: href });
        }
      });
      
      if (seasons.length > 0) break;
    }

    return {
      animeId,
      totalSeasons: seasons.length,
      seasons
    };
  } catch (error) {
    throw error;
  }
};

export { extractSeasons };
