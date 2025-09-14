import { User } from "../models/userModel.js";
import { Stats } from "../models/stats.js";

export const COHORTS = ["1styr", "2ndyr", "3rdyr", "4thyr", "graduated"];

// Helper for averaging Map fields
function mergeMaps(mapAgg, obj) {
  if (!obj) return;
  for (const [k, v] of Object.entries(obj)) {
    if (!mapAgg[k]) mapAgg[k] = { sum: 0, count: 0 };
    mapAgg[k].sum += v;
    mapAgg[k].count++;
  }
}

// Helper for contests
function mergeContests(contAgg, arr) {
  if (!arr) return;
  for (const c of arr) {
    const key = c.contestName || c.contestId;
    if (!contAgg[key])
      contAgg[key] = { ratingSum: 0, rankSum: 0, count: 0, last: null };
    contAgg[key].ratingSum += c.rating || 0;
    contAgg[key].rankSum += c.rank || 0;
    contAgg[key].count++;
    const t = c.timestamp || c.time;
    if (t && (!contAgg[key].last || t > contAgg[key].last))
      contAgg[key].last = t;
  }
}

export const computeCohortAverage = async function (label) {
  const users = await User.find({ isCohortAccount: false }).lean();
  const ids = users.filter((u) => u.cohort === label).map((u) => u._id);
  if (!ids.length) {
    console.log(label);
    return null;
  }

  const statsList = await Stats.find({ user: { $in: ids } }).lean();
  let count = statsList.length;

  const agg = {
    leetcode: {
      totalSolved: 0,
      streak: 0,
      maxStreak: 0,
      rating: 0,
      globalRank: 0,
      contests: { attended: 0, rating: 0 },
    },
    codeforces: { rating: 0, maxRating: 0, totalContests: 0 },
  };
  const topicAgg = {},
    tagAgg = {},
    lcContests = {},
    cfContests = {};

  for (const s of statsList) {
    const l = s.leetcode || {};
    agg.leetcode.totalSolved += l.totalSolved || 0;
    agg.leetcode.streak += l.streak || 0;
    agg.leetcode.maxStreak += l.maxStreak || 0;
    agg.leetcode.rating += l.rating || 0;
    agg.leetcode.globalRank += l.globalRank || 0;
    agg.leetcode.contests.attended += l.contests?.attended || 0;
    agg.leetcode.contests.rating += l.contests?.rating || 0;
    mergeMaps(topicAgg, l.topicWise);
    mergeMaps(tagAgg, l.tagWise);
    mergeContests(lcContests, l.contests?.history);

    const c = s.codeforces || {};
    agg.codeforces.rating += c.rating || 0;
    agg.codeforces.maxRating += c.maxRating || 0;
    agg.codeforces.totalContests += c.totalContests || 0;
    mergeContests(cfContests, c.ratingHistory);
  }

  const avgStats = {
    leetcode: {
      totalSolved: Math.round(agg.leetcode.totalSolved / count),
      streak: Math.round(agg.leetcode.streak / count),
      maxStreak: Math.round(agg.leetcode.maxStreak / count),
      rating: Math.round(agg.leetcode.rating / count),
      globalRank: Math.round(agg.leetcode.globalRank / count),
      topicWise: {},
      tagWise: {},
      contests: {
        attended: Math.round(agg.leetcode.contests.attended / count),
        rating: Math.round(agg.leetcode.contests.rating / count),
        history: [],
      },
    },
    codeforces: {
      rating: Math.round(agg.codeforces.rating / count),
      maxRating: Math.round(agg.codeforces.maxRating / count),
      totalContests: Math.round(agg.codeforces.totalContests / count),
      ratingHistory: [],
    },
  };

  for (const [k, v] of Object.entries(topicAgg))
    avgStats.leetcode.topicWise[k] = v.sum / v.count;
  for (const [k, v] of Object.entries(tagAgg))
    avgStats.leetcode.tagWise[k] = v.sum / v.count;
  for (const [k, v] of Object.entries(lcContests)) {
    avgStats.leetcode.contests.history.push({
      contestName: k,
      rating: v.ratingSum / v.count,
      rank: v.rankSum / v.count,
      timestamp: v.last ? new Date(v.last).getTime() : null,
      count: v.count,
    });
  }
  for (const [k, v] of Object.entries(cfContests)) {
    avgStats.codeforces.ratingHistory.push({
      contestName: k,
      rating: v.ratingSum / v.count,
      rank: v.rankSum / v.count,
      timestamp: v.last ? new Date(v.last).getTime() : null,
      count: v.count,
    });
  }

  // Find or create cohort user
  let cohortUser = await User.findOne({ username: label });
  if (!cohortUser) {
    cohortUser = await User.create({
      name: label,
      email: `${label}cohort.local`,
      isCohortAccount: true,
    });
  }

  await Stats.findOneAndUpdate(
    { user: cohortUser._id },
    { $set: avgStats },
    { upsert: true }
  );

  return avgStats;
};
