import mongoose from "mongoose";

const preferencesSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    leetcode_username: { type: String, default: "" },
    codechef: { type: Boolean, default: false },
    codeforces: { type: Boolean, default: false },
    leetcode_contests : {type : Boolean, default : false},
    atcoder_username: { type: String, default: "" },
    codechef_calendar: { type: Boolean, default: false },
    codeforces_calendar: { type: Boolean, default: false },
    leetcode_contests_calendar : {type : Boolean, default : false},
  },
  { timestamps: true }
);

export const Preferences = mongoose.model("UserPreferences", preferencesSchema);
