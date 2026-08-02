import mongoose, { Schema, models, model } from "mongoose";

const SearchCacheSchema = new Schema(
  {
    query: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    videos: {
      type: Array,
      required: true,
    },

    createdAt: {
      type: Date,
      default: Date.now,
      expires: 60 * 60 * 24 * 30, // Auto delete after 30 days
    },
  },
  {
    timestamps: true,
  }
);

export default models.SearchCache ||
  model("SearchCache", SearchCacheSchema);