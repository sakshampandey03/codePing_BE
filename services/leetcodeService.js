import fetch from "node-fetch";
import { Stats } from "../models/stats.js"; // your statsSchema model
import cache from "../utils/cache.js";
// LeetCode GraphQL endpoint
const LEETCODE_API = "https://leetcode.com/graphql";

const defaultContests = {
  attended: 0,
  rating: 0,
  history: [],
};

// ------------------ Queries ------------------

const getUserContestRankingQuery = `query getUserContestRanking($username: String!) {
  userContestRanking(username: $username) {
    attendedContestsCount
    rating
    globalRanking
    badge { name } 
  }
  userContestRankingHistory(username: $username) {
    attended
    trendDirection
    problemsSolved
    totalProblems
    finishTimeInSeconds
    rating
    ranking
    contest {
      title
      startTime
    }
  }
}`;
const getUserProfileQuery = `
query getUserProfile($username: String!) {
  allQuestionsCount {
    difficulty
    count
  }
  matchedUser(username: $username) {
    submitStats {
      acSubmissionNum {
        difficulty
        count
        submissions
      }
    }
    tagProblemCounts {
      advanced {
        tagName
        tagSlug
        problemsSolved
      }
      intermediate {
        tagName
        tagSlug
        problemsSolved
      }
      fundamental {
        tagName
        tagSlug
        problemsSolved
      }
    }
  }
}`;

const userProfileCalendarQuery = `
query UserProfileCalendar($username: String!, $year: Int!) {
  matchedUser(username: $username) {
    userCalendar(year: $year) {
      streak
      totalActiveDays
      submissionCalendar
    }
  }
}
`;

// ------------------ Helper ------------------
async function fetchGraphQL(query, variables) {
  const res = await fetch(LEETCODE_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query,
      variables,
    }),
  });

  const json = await res.json();
  if (json.errors) {
    console.error("GraphQL errors:", json.errors);
    throw new Error(json.errors[0].message);
  }
  return json.data;
}

// ------------------ Service Function ------------------
export const fetchLeetCodeStats = async (userId, username) => {
  try {
    if (!username) throw new Error("LeetCode username missing");
    const idx = `${userId}${username}`
    const cached = cache.get(idx);
    if (cached) {
      console.log(`Cache hit for CF ${idx}`);
      return cached;
    }
    // 1. Profile (total solved + topic wise)
    const profileData = await fetchGraphQL(getUserProfileQuery, { username });
    let totalSolved =
      profileData.matchedUser.submitStats.acSubmissionNum.reduce(
        (sum, item) => sum + item.count,
        0
      );
    totalSolved = totalSolved/2;
      // console.log("here s the profile data", profileData);
    const topicWise = {};
    profileData.matchedUser.submitStats.acSubmissionNum.forEach((item) => {
      topicWise[item.difficulty] = item.count;
    });
    // after you have profileData
    let tagWise = {};
    try {
      if (profileData.matchedUser && profileData.matchedUser.tagProblemCounts) {
        const tpc = profileData.matchedUser.tagProblemCounts;

        // LeetCode groups tags by difficulty level
        const categories = ["advanced", "intermediate", "fundamental"];

        categories.forEach((cat) => {
          (tpc[cat] || []).forEach((tag) => {
            // Extract tag name and solved count
            const name = tag.tagName ?? tag.name ?? tag.tag ?? tag.label;
            const solved =
              tag.problemsSolved ??
              tag.count ??
              tag.solved ??
              tag.problems ??
              0;

            if (name) {
              tagWise[name] = (tagWise[name] || 0) + Number(solved);
            }
          });
        });
      }
    } catch (e) {
      console.warn("tagProblemCounts parse failed, will fallback:", e.message);
      tagWise = {};
    }

    // 2. Calendar (streak + maxStreak)
    const currentYear = new Date().getFullYear();
    const calendarData = await fetchGraphQL(userProfileCalendarQuery, {
      username,
      year: currentYear,
    });
    const calendar = calendarData.matchedUser?.userCalendar;
    const submissionCalendar = calendar?.submissionCalendar
      ? JSON.parse(calendar.submissionCalendar)
      : {};

    let maxStreak = 0;
    let currStreak = 0;

    // Convert timestamps → integer days (YYYY-MM-DD) for easier diff calculation
    const days = Object.keys(submissionCalendar)
      .filter((ts) => submissionCalendar[ts] > 0) // only keep days with submissions
      .map((ts) => {
        const d = new Date(parseInt(ts) * 1000);
        return d.toISOString().slice(0, 10); // YYYY-MM-DD
      })
      .sort(); // lexicographic sort works for ISO strings

    // ---- Calculate maxStreak ----
    for (let i = 0; i < days.length; i++) {
      if (i > 0) {
        const prev = new Date(days[i - 1]);
        const curr = new Date(days[i]);
        const diff = (curr - prev) / (1000 * 60 * 60 * 24);
        if (diff === 1) {
          currStreak++;
        } else {
          maxStreak = Math.max(maxStreak, currStreak);
          currStreak = 1;
        }
      } else {
        currStreak = 1;
      }
    }
    maxStreak = Math.max(maxStreak, currStreak);

    // ---- Calculate currStreak (ending yesterday) ----
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    let tempDate = new Date(yesterday);
    let currentStreak = 0;
    while (true) {
      const key = Math.floor(tempDate.getTime() / 1000 / 86400) * 86400; // midnight timestamp
      // Find any matching submission day by comparing ISO strings
      const iso = tempDate.toISOString().slice(0, 10);
      if (days.includes(iso)) {
        currentStreak++;
        tempDate.setDate(tempDate.getDate() - 1);
      } else {
        break; // stop streak when a day has zero submissions
      }
    }

    console.log({ maxStreak, currStreak: currentStreak });

    // 3. Contest Stats
    let rating = 0;
    let badge = "";
    let globalRank = 0;
    let contests = { ...defaultContests };

    try {
      const contestData = await fetchGraphQL(getUserContestRankingQuery, {
        username,
      });
      if (contestData) {
        const contestRanking = contestData.userContestRanking || {};
        const contestHistory = contestData.userContestRankingHistory || [];

        rating = contestRanking.rating || 0; // ✅ rating
        badge = contestRanking.badge?.name || ""; // ✅ badge
        globalRank = contestRanking.globalRanking || 0;

        contests = {
          attended: contestRanking.attendedContestsCount || 0,
          rating: contestRanking.rating || 0,
          history: Array.isArray(contestHistory)
            ? contestHistory.map((h) => ({
                contestName: h.contest?.title || "Unknown",
                rating: h.rating || 0,
                rank: h.ranking || 0,
                timestamp: h.contest?.startTime
                  ? new Date(h.contest.startTime * 1000)
                  : null,
              }))
            : [],
        };
      }
    } catch (err) {
      console.warn("Contest data fetch failed:", err.message);
      // contests stays default
    }

    // 4. Save/Update DB
    let stats = await Stats.findOne({ user: userId });
    if (!stats) stats = new Stats({ user: userId });

    const leetcodeData = {
      totalSolved,
      streak : currStreak,
      maxStreak,
      topicWise,
      tagWise,
      rating,
      badge,
      globalRank,
      contests: contests || defaultContests,
      submissionCalendar: JSON.stringify(submissionCalendar || {}),
    };

    // Save/update for completeness (optional)

    stats.leetcode = leetcodeData;
    await stats.save();
    cache.set(idx, leetcodeData);
    // Return only the   leetcode subobject
    return leetcodeData;
  } catch (err) {
    console.error("Error in updateLeetCodeStats:", err.message);
    throw err;
  }
};
