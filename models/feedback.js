import mongoose from 'mongoose';
const feedbackSchema = new mongoose.Schema({
  email: String,
  name : String,
  subject : String,
  message: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
export const Feedback = mongoose.model("Feedback", feedbackSchema);
