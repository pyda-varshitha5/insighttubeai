import mongoose, { Schema, models, model } from "mongoose";

const ProgressSchema = new Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
  },

  totalSearches: {
    type: Number,
    default: 0,
  },

  searchedTopics: {
    type: [String],
    default: [],
  },

  generatedSummaries: {
  type: [String],
  default: [],
},

  totalSummaries: {
    type: Number,
    default: 0,
  },

  savedSummaries: {
    type: Number,
    default: 0,
  },

  timeSavedMinutes: {
    type: Number,
    default: 0,
  },

  quizzesCompleted: {
    type: Number,
    default: 0,
  },

  streak: {
    type: Number,
    default: 0,
  },
});
export default models.Progress || model("Progress", ProgressSchema);