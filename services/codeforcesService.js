import fetch from "node-fetch";
import cache from "../utils/cache.js";
import limiter from "../utils/limiter.js";
import { buildCodeforcesUrl } from "../utils/codeforcesAPI.js";

/**
 * Fetch Codeforces stats for a given username, including total accepted solutions.
 */
export async function fetchCodeforcesStats(username) {
  // console.log(`[CF DEBUG] fetchCodeforcesStats called for ${username}`);
  try {
    const cached = cache.get(username);
    if (cached) {
      console.log(`Cache hit for CF ${username}`);
      return cached;
    }

    // --- User info ---
    const infoUrl = buildCodeforcesUrl("user.info", { handles: username });
    const infoRes = await limiter.schedule(() => fetch(infoUrl));
    const infoData = await infoRes.json();
    if (infoData.status !== "OK") throw new Error(infoData.comment);

    const userInfo = infoData.result[0];

    // --- Rating history ---
    const ratingUrl = buildCodeforcesUrl("user.rating", { handle: username });
    const ratingRes = await limiter.schedule(() => fetch(ratingUrl));
    const ratingData = await ratingRes.json();
    if (ratingData.status !== "OK") throw new Error(ratingData.comment);

    const contests = ratingData.result;

    // --- Total accepted solutions ---
    const statusUrl = buildCodeforcesUrl("user.status", { handle: username });
    const statusRes = await limiter.schedule(() => fetch(statusUrl));
    const statusData = await statusRes.json();
    if (statusData.status !== "OK") throw new Error(statusData.comment);
    // console.log("----------------status res------------------", statusData)
    // Count accepted (verdict === "OK"). Use a Set for unique problems if you only want unique solutions.
    const acceptedCount = statusData.result.reduce((acc, s) => {
      return s.verdict === "OK" ? acc + 1 : acc;
    }, 0);

    const stats = {
      rating: userInfo.rating || 0,
      maxRating: userInfo.maxRating || 0,
      rank: userInfo.rank || "unrated",
      maxRank: userInfo.maxRank || "unrated",
      totalContests: contests.length,
      totalAccepted: acceptedCount, // ✅ added
      ratingHistory: contests.map(c => ({
        contestId: c.contestId,
        contestName: c.contestName,
        rank: c.rank,
        rating: c.newRating,
        time: new Date(c.ratingUpdateTimeSeconds * 1000),
      })),
    };
    cache.set(username, stats);
    return stats;
  } catch (error) {
    console.error(`CF API error for ${username}:`, error.message);
    return {
      rating: 0,
      maxRating: 0,
      rank: "unknown",
      maxRank: "unknown",
      totalContests: 0,
      totalAccepted: 0,
      ratingHistory: [],
    };
  }
}
