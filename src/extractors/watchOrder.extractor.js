/*
 * ======= • ======= • ======= • ======= • =======• =======
 * AniKotoAPI — watchOrder.extractor.js
 * Repository: https://github.com/Shineii86/AniKotoAPI
 *
 * @description
 *   Extracts watch order and related anime information from the
 *   anikototv.to AJAX endpoint. Returns related anime with their
 *   relationship types (sequel, prequel, summary, etc.).
 *
 * @exports
 *   extractWatchOrder
 *
 * @author  Shinei Nouzen
 * @license MIT
 * ======= • ======= • ======= • ======= • =======• =======
 */

import * as cheerio from "cheerio";
import { fetchWithMirror } from "../helper/mirror.helper.js";

/**
 * Fetches and parses watch order / related anime for an anime.
 * Scrapes the AJAX endpoint that returns related anime HTML.
 *
 * @param {string|number} animeId - The numeric anime ID
 * @returns {Promise<Object>} Object with animeId, totalRelated, related array
 *
 * @example
 *   const data = await extractWatchOrder(7174);
 *   console.log(data.totalRelated); // number of related anime
 *   console.log(data.related[0].title); // first related anime
 */
const extractWatchOrder = async (animeId) => {
  try {
    const { data } = await fetchWithMirror(`/api/watch-order/${animeId}`, {
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

    // Extract related anime
    const related = [];
    
    // Try multiple selectors
    const selectors = [
      "#w-related .item",
      ".item.flexserieslist",
      ".scaff.side.items .item",
      ".item"
    ];
    
    for (const selector of selectors) {
      $(selector).each((_, el) => {
        const link = $(el).find("a.name").first();
        const href = link.attr("href") || "";
        const title = link.text().trim() || "";
        const poster = $(el).find("img").attr("src") || "";
        const slug = href.split("/watch/").pop() || "";

        // Extract relationship type
        const relationEl = $(el).find(".relation, .serieslabelitem").first();
        let relationType = relationEl.text().trim().toLowerCase() || 
                          relationEl.attr("id") || "related";

        if (slug || title) {
          related.push({
            title,
            slug,
            poster,
            url: href,
            relation: relationType
          });
        }
      });
      
      if (related.length > 0) break;
    }

    return {
      animeId,
      totalRelated: related.length,
      related
    };
  } catch (error) {
    throw error;
  }
};

export { extractWatchOrder };
