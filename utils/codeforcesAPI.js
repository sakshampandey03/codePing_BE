import crypto from "crypto";
import fetch from "node-fetch";
import dotenv from 'dotenv'

dotenv.config()

const API_KEY = process.env.CF_API_KEY;
const API_SECRET = process.env.CF_SECRET;

/**
 * Build a signed Codeforces API request URL
 * @param {string} methodName - API method name e.g. "user.info"
 * @param {object} extraParams - Additional params (like { handles: "tourist" })
 * @returns {string} - Signed URL
 */
export function buildCodeforcesUrl(methodName, extraParams = {}) {
  const baseUrl = `https://codeforces.com/api/${methodName}`;
  const time = Math.floor(Date.now() / 1000);
  const rand = Math.random().toString(36).substring(2, 8);

  const params = {
    apiKey: API_KEY,
    time,
    ...extraParams,
  };

  // Sort params lexicographically by key
  const paramString = Object.entries(params)
    .sort(([aKey], [bKey]) => aKey.localeCompare(bKey))
    .map(([k, v]) => `${k}=${v}`)
    .join("&");

  // Create string to hash
  const stringToHash = `${rand}/${methodName}?${paramString}#${API_SECRET}`;
  const hash = crypto.createHash("sha512").update(stringToHash).digest("hex");

  const apiSig = `${rand}${hash}`;
  const finalUrl = `${baseUrl}?${paramString}&apiSig=${apiSig}`;
  return finalUrl;
}
