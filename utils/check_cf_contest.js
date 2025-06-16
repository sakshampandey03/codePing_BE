import crypto from "crypto";
import fetch from "node-fetch";
import dotenv from 'dotenv'

dotenv.config()
// Replace with your actual credentials
const API_KEY = process.env.CF_API_KEY;
const API_SECRET = process.env.CF_SECRET;

export async function getUpcomingCodeforcesContest() {
  const methodName = "contest.list";
  const baseUrl = `https://codeforces.com/api/${methodName}`;
  const time = Math.floor(Date.now() / 1000);
  const rand = Math.random().toString(36).substring(2, 8); // e.g., 'abc123'

  const params = {
    apiKey: API_KEY,
    time,
  };

  const paramString = Object.entries(params)
    .sort(([aKey], [bKey]) => aKey.localeCompare(bKey))
    .map(([k, v]) => `${k}=${v}`)
    .join("&");

  const stringToHash = `${rand}/${methodName}?${paramString}#${API_SECRET}`;
  const hash = crypto.createHash("sha512").update(stringToHash).digest("hex");

  const apiSig = `${rand}${hash}`;
  const finalUrl = `${baseUrl}?${paramString}&apiSig=${apiSig}`;

  try {
    const response = await fetch(finalUrl);
    const data = await response.json();

    if (data.status !== "OK") {
      console.error("Error:", data.comment);
      return null;
    }

    const contests = data.result;
    const upcoming = contests
      .filter(contest => contest.phase === "BEFORE")
      .sort((a, b) => a.startTimeSeconds - b.startTimeSeconds);

    return upcoming[0] || null;
  } catch (error) {
    console.error("Failed to fetch Codeforces contest:", error);
    return null;
  }
}
