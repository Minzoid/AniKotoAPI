/*
 * ======= • ======= • ======= • ======= • =======• =======
 * AniKotoAPI — mirror.helper.js
 * Repository: https://github.com/Shineii86/AniKotoAPI
 *
 * @description
 *   Multi-mirror fallback helper for resilient scraping.
 *   Automatically tries alternative domains if primary is blocked/down.
 *   Caches working mirror per session for faster subsequent requests.
 *
 * @exports
 *   fetchWithMirror, getWorkingMirror, resetMirrorCache
 *
 * @author  Shinei Nouzen
 * @license MIT
 * ======= • ======= • ======= • ======= • =======• =======
 */

import axios from "axios";
import { headers } from "../configs/header.config.js";
import { getCache, setCache } from "./cache.helper.js";

// ══════════════════════════════════════════════════════════════
// MIRROR CONFIGURATION
// ══════════════════════════════════════════════════════════════

// Default mirrors with names and priority
const DEFAULT_MIRRORS = [
  { url: "https://anikototv.to", name: "Primary", priority: 1 },
  { url: "https://anikoto.cz", name: "Regional CZ", priority: 2 },
  { url: "https://anikoto.me", name: "Short TLD", priority: 3 },
  { url: "https://anikoto.net", name: "Network", priority: 4 },
  { url: "https://anikototv.se", name: "Nordic .se", priority: 5 },
];

// Parse custom mirrors from env or use defaults
function parseMirrors() {
  const envMirrors = process.env.MIRROR_DOMAINS;
  if (!envMirrors) return DEFAULT_MIRRORS;
  
  return envMirrors.split(",").map((url, index) => ({
    url: url.trim(),
    name: `Mirror ${index + 1}`,
    priority: index + 1
  }));
}

const ALL_MIRRORS = parseMirrors();
ALL_MIRRORS.sort((a, b) => a.priority - b.priority);

// Cache key for working mirror
const MIRROR_CACHE_KEY = "working_mirror";
const MIRROR_CACHE_TTL = parseInt(process.env.MIRROR_CACHE_TTL) || 3600000;

// ══════════════════════════════════════════════════════════════
// MIRROR STATE
// ══════════════════════════════════════════════════════════════

let workingMirror = null;
let failedMirrors = new Set();

// ══════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ══════════════════════════════════════════════════════════════

/**
 * Check if a mirror is accessible
 * @param {string} baseUrl - Mirror base URL
 * @returns {Promise<boolean>}
 */
async function checkMirror(baseUrl) {
  try {
    const response = await axios.get(`${baseUrl}/home`, {
      headers,
      timeout: 10000,
      maxRedirects: 5,
    });
    return response.status === 200;
  } catch (error) {
    return false;
  }
}

/**
 * Get the best available mirror
 * @returns {Promise<string>} Working mirror base URL
 */
async function getWorkingMirror() {
  // Check cache first
  const cached = getCache(MIRROR_CACHE_KEY);
  if (cached && !failedMirrors.has(cached)) {
    workingMirror = cached;
    return workingMirror;
  }

  // Try mirrors in priority order
  for (const mirror of ALL_MIRRORS) {
    if (failedMirrors.has(mirror.url)) continue;

    const isWorking = await checkMirror(mirror.url);
    if (isWorking) {
      workingMirror = mirror.url;
      setCache(MIRROR_CACHE_KEY, mirror.url, MIRROR_CACHE_TTL);
      console.log(`[MIRROR] Using: ${mirror.name} (${mirror.url})`);
      return mirror.url;
    } else {
      failedMirrors.add(mirror.url);
      console.log(`[MIRROR] Failed: ${mirror.name} (${mirror.url})`);
    }
  }

  // All mirrors failed, reset and try again
  failedMirrors.clear();
  workingMirror = ALL_MIRRORS[0].url;
  console.log(`[MIRROR] All failed, resetting to primary: ${workingMirror}`);
  return workingMirror;
}

/**
 * Reset mirror cache and failed state
 */
function resetMirrorCache() {
  workingMirror = null;
  failedMirrors.clear();
  setCache(MIRROR_CACHE_KEY, null, 0);
  console.log("[MIRROR] Cache reset");
}

/**
 * Build URL with current mirror
 * @param {string} path - URL path
 * @param {string} baseUrl - Optional custom base URL
 * @returns {string} Full URL
 */
function buildUrl(path, baseUrl = workingMirror) {
  const base = baseUrl || ALL_MIRRORS[0].url;
  return `${base}${path}`;
}

/**
 * Fetch with automatic mirror fallback
 * @param {string} path - URL path to fetch
 * @param {object} options - Additional options
 * @returns {Promise<{data: string, mirror: string}>}
 */
async function fetchWithMirror(path, options = {}) {
  const { 
    timeout = 15000, 
    retries = 2,
    returnType = "text",
    headers: customHeaders = {}
  } = options;

  // Merge default headers with custom headers
  const requestHeaders = { ...headers, ...customHeaders };

  let lastError = null;

  // Try cached working mirror first
  const mirrorsToTry = [];
  
  if (workingMirror && !failedMirrors.has(workingMirror)) {
    mirrorsToTry.push(workingMirror);
  }

  // Add remaining mirrors
  for (const mirror of ALL_MIRRORS) {
    if (!mirrorsToTry.includes(mirror.url) && !failedMirrors.has(mirror.url)) {
      mirrorsToTry.push(mirror.url);
    }
  }

  // If all failed, reset and try all
  if (mirrorsToTry.length === 0) {
    failedMirrors.clear();
    mirrorsToTry.push(...ALL_MIRRORS.map(m => m.url));
  }

  for (const mirror of mirrorsToTry) {
    const url = buildUrl(path, mirror);
    
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await axios.get(url, {
          headers: requestHeaders,
          timeout,
          responseType: returnType === "text" ? "text" : "json",
        });

        if (response.status === 200) {
          // Update working mirror
          if (mirror !== workingMirror) {
            workingMirror = mirror;
            setCache(MIRROR_CACHE_KEY, mirror, MIRROR_CACHE_TTL);
            console.log(`[MIRROR] Switched to: ${mirror}`);
          }
          return { 
            data: returnType === "text" ? response.data : response.data,
            mirror 
          };
        }
      } catch (error) {
        lastError = error;
        if (attempt < retries) {
          // Wait before retry
          await new Promise(r => setTimeout(r, 500 * (attempt + 1)));
        }
      }
    }

    // Mark mirror as failed after all retries
    failedMirrors.add(mirror);
    console.log(`[MIRROR] Marked as failed: ${mirror}`);
  }

  throw new Error(`All mirrors failed. Last error: ${lastError?.message}`);
}

/**
 * Get mirror status for all domains
 * @returns {Promise<Array>}
 */
async function getMirrorStatus() {
  const status = [];
  
  for (const mirror of ALL_MIRRORS) {
    const start = Date.now();
    const isWorking = await checkMirror(mirror.url);
    const latency = Date.now() - start;
    
    status.push({
      name: mirror.name,
      url: mirror.url,
      priority: mirror.priority,
      status: isWorking ? "online" : "offline",
      latency: `${latency}ms`,
      isCurrent: mirror.url === workingMirror,
    });
  }
  
  return status;
}

export { 
  fetchWithMirror, 
  getWorkingMirror, 
  resetMirrorCache, 
  buildUrl,
  getMirrorStatus,
  ALL_MIRRORS
};
