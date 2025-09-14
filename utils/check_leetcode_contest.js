// LeetCode contest schedule calculator based on fixed reference dates
export function getUpcomingLeetCodeContests(count = 3) {
  const contests = [];
  const tz = "Asia/Kolkata";

  // Reference anchors
  const weeklyAnchor = {
    number: 468,
    date: new Date("2025-09-21T08:00:00+05:30"),
  };
  const biweeklyAnchor = {
    number: 166,
    date: new Date("2025-09-27T20:00:00+05:30"),
  };

  const now = new Date();
  const istNow = new Date(now.toLocaleString("en-US", { timeZone: tz }));

  // --- Find next weekly contest ---
  const daysDiffWeekly = Math.ceil((istNow - weeklyAnchor.date) / (7 * 864e5));
  let nextWeeklyNum = weeklyAnchor.number + Math.max(daysDiffWeekly, 0);
  let nextWeeklyDate = new Date(weeklyAnchor.date.getTime() + Math.max(daysDiffWeekly, 0) * 7 * 864e5);

  // --- Find next biweekly contest ---
  const weeksSinceBiweekly = Math.ceil((istNow - biweeklyAnchor.date) / (14 * 864e5));
  let nextBiweeklyNum = biweeklyAnchor.number + Math.max(weeksSinceBiweekly, 0);
  let nextBiweeklyDate = new Date(biweeklyAnchor.date.getTime() + Math.max(weeksSinceBiweekly, 0) * 14 * 864e5);

  // Add next `count` weekly contests
  for (let i = 0; i < count; i++) {
    const date = new Date(nextWeeklyDate.getTime() + i * 7 * 864e5);
    contests.push({
      contestName: `LeetCode Weekly Contest ${nextWeeklyNum + i}`,
      link: `https://leetcode.com/contest/weekly-contest-${nextWeeklyNum + i}`,
      date: date.toLocaleDateString("en-IN", { timeZone: tz, year: "numeric", month: "long", day: "numeric" }),
      startHour: 8,
      endHour: 10,
    });
  }

  // Add next `count` biweekly contests
  for (let i = 0; i < count; i++) {
    const date = new Date(nextBiweeklyDate.getTime() + i * 14 * 864e5);
    contests.push({
      contestName: `LeetCode Biweekly Contest ${nextBiweeklyNum + i}`,
      link: `https://leetcode.com/contest/biweekly-contest-${nextBiweeklyNum + i}`,
      date: date.toLocaleDateString("en-IN", { timeZone: tz, year: "numeric", month: "long", day: "numeric" }),
      startHour: 20,
      endHour: 22,
    });
  }

  // Sort chronologically
  contests.sort((a, b) => new Date(a.date) - new Date(b.date));
  return contests;
}
