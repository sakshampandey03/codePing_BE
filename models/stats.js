import mongoose from "mongoose";

const statsSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  leetcode: {
    totalSolved: { type: Number, default: 0 },
    streak: { type: Number, default: 0 },
    maxStreak: { type: Number, default: 0 },
    topicWise: { type: Map, of: Number, default: {} },
    tagWise: { type: Map, of: Number, default: {} },
    rating: { type: Number, default: 0 },          // ✅ add rating
    badge: { type: String, default: "" },          // ✅ add badge name
    globalRank: { type: Number, default: 0 }, 
    contests: {
      attended: { type: Number, default: 0 },
      rating: { type: Number, default: 0 },
      history: [
        {
          contestName: String,
          rating: Number,
          rank: Number,
          timestamp: Date,
        },
      ],
      default : [],
    },
    submissionCalendar: { type: String, default: "{}" },
  },
  codeforces: {
    rating: { type: Number, default: 0 },
    maxRating: { type: Number, default: 0 },
    rank: { type: String, default: "unrated" },
    maxRank: { type: String, default: "unrated" },
    totalContests: { type: Number, default: 0 },
    totalAccepted :{type : Number, default : 0},
    ratingHistory: [
      {
        contestId: Number,
        contestName: String,
        rank: Number,
        rating: Number,
        time: Date,
      },
    ],
  },

  codechef: {
    contests: {
      attended: { type: Number, default: 0 },
      rating: { type: Number, default: 0 },
      history: [
        {
          contestName: String,
          rating: Number,
          rank: Number,
          timestamp: Date,
        },
      ],
    },
  },
  atcoder: {
    contests: {
      attended: { type: Number, default: 0 },
      rating: { type: Number, default: 0 },
      history: [
        {
          contestName: String,
          rating: Number,
          rank: Number,
          timestamp: Date,
        },
      ],
    },
  },
});

export const Stats = mongoose.model("Stats", statsSchema);
