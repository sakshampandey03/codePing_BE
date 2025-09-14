import mongoose from "mongoose";

const userModelSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    avatar: { type: String },

    // Coding handles
    leetcode_username: { type: String, default: "" },
    codeforces_username: { type: String, default: "" },
    atcoder_username: { type: String, default: "" },
    github_username: { type: String, default: "" },
    cohort : {type : String, default : ""},
    isCohortAccount: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userModelSchema);
