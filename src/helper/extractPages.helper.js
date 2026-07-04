/*
 * ======= • ======= • ======= • ======= • =======• =======
 * AniKotoAPI — extractPages.helper.js
 * Repository: https://github.com/Shineii86/AniKotoAPI
 *
 * @description
 *   HTTP client utility for fetching and parsing HTML content from
 *   paginated URLs. Uses mirror fallback for resilience and Cheerio
 *   for DOM parsing, with support for page-based pagination.
 *
 * @exports
 *   extractPages
 *
 * @author  Shinei Nouzen
 * @license MIT
 * ======= • ======= • ======= • ======= • =======• =======
 */

import * as cheerio from "cheerio";
import { fetchWithMirror } from "./mirror.helper.js";

/**
 * Fetches HTML content from a URL with pagination and mirror fallback.
 * Automatically tries alternative domains if primary fails.
 *
 * @param {string} url - Base URL path to fetch (e.g., "/filter?keyword=naruto")
 * @param {number} [page=1] - Page number to fetch (1-indexed)
 * @returns {Promise<CheerioAPI>} Parsed Cheerio instance of the page
 *
 * @example
 *   const $ = await extractPages("/filter?keyword=one-piece");
 *   const $page2 = await extractPages("/filter?keyword=one-piece", 2);
 */
const extractPages = async (url, page = 1) => {
  try {
    const separator = url.includes("?") ? "&" : "?";
    const path = page > 1 ? `${url}${separator}page=${page}` : url;
    const { data } = await fetchWithMirror(path);
    const $ = cheerio.load(data);
    return $;
  } catch (error) {
    throw error;
  }
};

export { extractPages };
