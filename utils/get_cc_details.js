export function getNextCodechefContest() {
  const startDate = new Date("2025-06-12T20:00:00+05:30"); // START191
  const startNumber = 190;

  const now = new Date();
  const nowIST = new Date(
    now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
  );

  const msInWeek = 7 * 24 * 60 * 60 * 1000;
  const weeksPassed = Math.floor((nowIST - startDate) / msInWeek);
  const upcomingContestNumber = startNumber + weeksPassed;

  const link = `https://www.codechef.com/START${upcomingContestNumber}`;
  const today = new Date();
  const formattedDate = today.toLocaleDateString("en-IN", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  return {
    contestName: `STARTERS ${upcomingContestNumber}`,
    link,
    date: formattedDate
  };
}
