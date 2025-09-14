import { Preferences } from "../models/preferences.js";
import { User } from "../models/userModel.js";


export const updatePreferences = async (req, res) => {
  try {
    const { email, leetcode_username, codechef, codeforces, codechef_calendar, codeforces_calendar, leetcode_contests_calendar, atcoder_username } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    // find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found. Please register first." });
    }

    // find or create preferences
    let prefs = await Preferences.findOne({ user: user._id });

    if (prefs) {
      prefs.leetcode_username = leetcode_username ?? prefs.leetcode_username;
      prefs.codechef = codechef ?? prefs.codechef;
      prefs.codeforces = codeforces ?? prefs.codeforces;
      prefs.codechef_calendar = codechef_calendar ?? prefs.codechef_calendar;
      prefs.codeforces_calendar = codeforces_calendar ?? prefs.codeforces_calendar;
      prefs.leetcode_contests_calendar = codeforces_calendar ?? prefs.codeforces_calendar;
      prefs.atcoder_username = atcoder_username ?? prefs.atcoder_username;
    } else {
      prefs = new Preferences({
        user: user._id,
        leetcode_username,
        codechef,
        codeforces,
        atcoder_username,
        codechef_calendar,
        codeforces_calendar,
        leetcode_contests_calendar,
      });
    }

    await prefs.save();

    return res.status(200).json({ success: true, message: "Preferences saved successfully", preferences: prefs });
  } catch (error) {
    console.error("Error in updatePreferences:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};


export const getPreferences = async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const prefs = await Preferences.findOne({ user: user._id });

    if (!prefs) {
      return res.status(200).json({ success: true, message: "No preferences found", preferences: {} });
    }

    return res.status(200).json({ success: true, preferences: prefs });
  } catch (error) {
    console.error("Error in getPreferences:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};


export const getHandles = async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    const handles = {
      leetcode_username : user.leetcode_username,
      codeforces_username : user.codeforces_username,
      atcoder_username : user.atcoder_username,
    }

    return res.status(200).json({ success: true, handles: handles });
  } catch (error) {
    console.error("Error in getting handles:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateHandles = async (req, res) => {
  try {
    const { email, handles, cohort} = req.body;
    // console.log(handles);
    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found. Please register first." });
    }

    if (handles) {
      user.leetcode_username = handles.leetcode_username ?? user.leetcode_username;
      user.codeforces_username = handles.codeforces_username ?? user.codeforces_username;
      user.atcoder_username = handles.atcoder_username ?? user.atcoder_username;
      user.github_username = handles.github_username ?? user.github_username;
    }
    if(cohort){
      user.cohort = cohort;
    }
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Handles saved successfully",
      user,
    });
  } catch (error) {
    console.error("Error in updateHandles:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};


export const getUserByEmail = async (req, res) => {
  try {
    // console.log("getUserByEmail req.query:", req.query); // debug

    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.status(200).json({
      success: true,
      message: "User found successfully",
      user
    });
  } catch (error) {
    console.error("Error in getUserByEmail:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
