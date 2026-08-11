import mongoose, {
  Schema,
  models,
  model,
} from "mongoose";

const ProgressSchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    totalSearches: {
      type: Number,
      default: 0,
    },

    totalSummaries: {
      type: Number,
      default: 0,
    },

    savedSummaries: {
      type: Number,
      default: 0,
    },

    quizzesCompleted: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Progress =
  models.Progress ||
  model("Progress", ProgressSchema);

export default Progress;