import { Stats } from "../models/stats.js";
import { User } from "../models/userModel.js";
import { fetchLeetCodeStats } from "../services/leetcodeService.js";
import { fetchCodeforcesStats } from "../services/codeforcesService.js";


export const updateStats = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    // Get user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Get or create stats doc
    let stats = await Stats.findOne({ user: user._id });
    if (!stats) {
      stats = await Stats.create({ user: user._id });
    }

    // Update stats platform by platform
    if (user.leetcode_username) {
      const leetStats = await fetchLeetCodeStats(user._id, user.leetcode_username);
      stats.leetcode = { ...stats.leetcode.toObject?.() ?? stats.leetcode, ...leetStats };
    }

    if (user.codeforces_username) {
      const cfStats = await fetchCodeforcesStats(user.codeforces_username);
      stats.codeforces = { ...stats.codeforces, ...cfStats };
    }


    await stats.save();

    return res.status(200).json({
      success: true,
      message: "Stats updated successfully",
      stats,
    });
  } catch (error) {
    console.error("Error in updateStats:", error);
    return res.status(500).json({
      success: false,
      message: "Error while updating stats",
    });
  }
};

/**
 * Get stats for a given user
 * @route GET /api/stats?email=...
 */
export const getStats = async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const stats = await Stats.findOne({ user: user._id });
    if (!stats) {
      return res.status(200).json({
        success: true,
        message: "No stats found for user",
        stats: {},
      });
    }

    return res.status(200).json({
      success: true,
      message: "Stats fetched successfully",
      stats,
    });
  } catch (error) {
    console.error("Error in getStats:", error);
    return res.status(500).json({
      success: false,
      message: "Error while fetching stats",
    });
  }
};
