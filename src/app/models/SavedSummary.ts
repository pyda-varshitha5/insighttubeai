import { Schema, model, models } from "mongoose";

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
  },
  {
    timestamps: true,
  }
);

export default models.SavedSummary ||
  model("SavedSummary", SavedSummarySchema);