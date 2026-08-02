import mongoose, { Schema, models, model } from "mongoose";

const SavedSummarySchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
    },

    title: {
      type: String,
      required: true,
    },

    markdown: {
      type: String,
      required: true,
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export default models.SavedSummary ||
  model("SavedSummary", SavedSummarySchema);