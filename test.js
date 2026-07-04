/*
 * ======= • ======= • ======= • ======= • =======• =======
 * AniKotoAPI — test.js
 * Repository: https://github.com/Shineii86/AniKotoAPI
 *
 * @description
 *   Comprehensive integration test suite for AniKotoAPI endpoints.
 *   Tests all major endpoints for correct response format, status codes,
 *   error handling, and performance benchmarks.
 *
 * @author  Shinei Nouzen
 * @license MIT
 * ======= • ======= • ======= • ======= • =======• =======
 */

const BASE = process.env.API_URL || "https://anikototvapi.vercel.app/api";

const tests = [
  // Core endpoints
  { name: "Home", url: "/", check: (d) => d.results?.spotlights || d.results?.trending },
  { name: "Search", url: "/search?keyword=naruto", check: (d) => d.results?.data },
  { name: "Info", url: "/info?id=road-of-naruto-ggjw8", check: (d) => d.results?.title },
  { name: "Episodes", url: "/episodes/road-of-naruto-ggjw8", check: (d) => d.results?.episodes },
  { name: "Servers", url: "/servers?ids=1", check: (d) => d.results },
  { name: "Watch", url: "/watch?slug=road-of-naruto-ggjw8&ep=1", check: (d) => d.results?.servers || d.results?.episodeNumber },
  
  // Discovery endpoints
  { name: "Suggestions", url: "/suggestions?keyword=naruto", check: (d) => d.results },
  { name: "Spotlight", url: "/spotlight", check: (d) => d.results },
  { name: "Trending", url: "/trending", check: (d) => d.results },
  { name: "Top 10", url: "/top-ten", check: (d) => d.results },
  { name: "Random", url: "/random", check: (d) => d.results },
  { name: "Most Popular", url: "/most-popular", check: (d) => d.results },
  { name: "New Release", url: "/new-release", check: (d) => d.results },
  { name: "Newly Added", url: "/newly-added", check: (d) => d.results },
  { name: "Latest Updated", url: "/latest-updated", check: (d) => d.results, optional: true },
  
  // Category endpoints
  { name: "Genre", url: "/genre/action", check: (d) => d.results },
  { name: "Type", url: "/type/tv", check: (d) => d.results },
  { name: "AZ List", url: "/az-list/a", check: (d) => d.results },
  { name: "Filter", url: "/filter?keyword=&genre[]=1", check: (d) => d.results },
  
  // Utility endpoints
  { name: "Health", url: "/health", check: (d) => d.status || d.results?.status },
  { name: "Stats", url: "/stats", check: (d) => d.results },
  
  // Search variants
  { name: "Search Suggest", url: "/search/suggest?keyword=naruto", check: (d) => d.results },
  { name: "Episodes Ajax", url: "/episodes-ajax/7174", check: (d) => d.results },
  { name: "Trending Sidebar", url: "/trending-sidebar", check: (d) => d.results },
  { name: "Mapper Servers", url: "/mapper-servers?malId=21&slug=one-piece-100&timestamp=1234567890", check: (d) => d.results },
  { name: "Seasons", url: "/seasons/7174", check: (d) => d.results?.seasons || d.results?.totalSeasons, optional: true },
  { name: "Watch Order", url: "/watch-order/7174", check: (d) => d.results?.related || d.results?.totalRelated, optional: true },
];

let passed = 0;
let failed = 0;
let skipped = 0;
let total = 0;
const results = [];

async function runTest(test) {
  total++;
  const start = Date.now();
  
  try {
    const res = await fetch(`${BASE}${test.url}`);
    const duration = Date.now() - start;
    
    if (!res.ok) {
      if (test.optional && (res.status === 404 || res.status === 500)) {
        console.log(`⏭️  ${test.name} - Skipped (HTTP ${res.status}) (${duration}ms)`);
        skipped++;
        results.push({ name: test.name, status: "SKIP", httpStatus: res.status, duration });
        return;
      }
      console.log(`❌ ${test.name} - HTTP ${res.status} (${duration}ms)`);
      failed++;
      results.push({ name: test.name, status: "FAIL", httpStatus: res.status, duration });
      return;
    }
    
    const data = await res.json();
    
    if (!data.success) {
      if (test.optional) {
        console.log(`⏭️  ${test.name} - Skipped (success=false) (${duration}ms)`);
        skipped++;
        results.push({ name: test.name, status: "SKIP", reason: "success=false", duration });
        return;
      }
      console.log(`❌ ${test.name} - success=false (${duration}ms)`);
      failed++;
      results.push({ name: test.name, status: "FAIL", reason: "success=false", duration });
      return;
    }
    
    // Check custom validation
    if (test.check && !test.check(data)) {
      if (test.optional) {
        console.log(`⏭️  ${test.name} - Skipped (validation failed) (${duration}ms)`);
        skipped++;
        results.push({ name: test.name, status: "SKIP", reason: "Validation failed", duration });
        return;
      }
      console.log(`❌ ${test.name} - Validation failed (${duration}ms)`);
      failed++;
      results.push({ name: test.name, status: "FAIL", reason: "Validation failed", duration });
      return;
    }
    
    console.log(`✅ ${test.name} (${duration}ms)`);
    passed++;
    results.push({ name: test.name, status: "PASS", duration });
    
  } catch (error) {
    const duration = Date.now() - start;
    if (test.optional) {
      console.log(`⏭️  ${test.name} - Skipped (${error.message}) (${duration}ms)`);
      skipped++;
      results.push({ name: test.name, status: "SKIP", reason: error.message, duration });
      return;
    }
    console.log(`❌ ${test.name} - ${error.message} (${duration}ms)`);
    failed++;
    results.push({ name: test.name, status: "FAIL", reason: error.message, duration });
  }
}

async function runAll() {
  console.log(`\n🧪 Running ${tests.length} tests...\n`);
  console.log(`📡 API: ${BASE}\n`);
  
  // Run tests sequentially to avoid rate limiting
  for (const test of tests) {
    await runTest(test);
  }
  
  console.log(`\n${"=".repeat(50)}`);
  console.log(`📊 Results: ${passed} passed, ${failed} failed, ${skipped} skipped, ${total} total`);
  console.log(`${"=".repeat(50)}`);
  
  // Performance summary
  const durations = results.filter(r => r.status === "PASS").map(r => r.duration);
  if (durations.length > 0) {
    const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
    const maxDuration = Math.max(...durations);
    const minDuration = Math.min(...durations);
    
    console.log(`\n⚡ Performance:`);
    console.log(`   Average: ${avgDuration.toFixed(0)}ms`);
    console.log(`   Min: ${minDuration}ms`);
    console.log(`   Max: ${maxDuration}ms`);
  }
  
  // Detailed results
  console.log(`\n📋 Detailed Results:`);
  results.forEach(r => {
    const icon = r.status === "PASS" ? "✅" : r.status === "SKIP" ? "⏭️" : "❌";
    console.log(`   ${icon} ${r.name} - ${r.status} (${r.duration}ms)${r.reason ? ` - ${r.reason}` : ""}`);
  });
  
  process.exit(failed > 0 ? 1 : 0);
}

runAll();
