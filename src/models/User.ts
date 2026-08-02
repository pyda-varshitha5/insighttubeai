import mongoose, { Schema, models, model } from "mongoose";

const UserSchema = new Schema(
  {
    uid: {
      type: String,
      required: true,
      unique: true,
    },

    firstName: {
      type: String,
      required: true,
    },

    lastName: {
      type: String,
      default: "",
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    photoURL: {
      type: String,
      default: "",
    },

    recentSearches: [
      {
        type: String,
      },
    ],

    savedSummaries: [
      {
        type: Schema.Types.ObjectId,
        ref: "Summary",
      },
    ],

    totalSummaries: {
      type: Number,
      default: 0,
    },

    hoursSaved: {
      type: Number,
      default: 0,
    },

    learningStreak: {
      type: Number,
      default: 0,
    },
    analytics: {
  totalSearches: {
    type: Number,
    default: 0,
  },

  videosViewed: {
    type: Number,
    default: 0,
  },

  summariesGenerated: {
    type: Number,
    default: 0,
  },

  savedSummariesCount: {
    type: Number,
    default: 0,
  },

  lastActive: {
    type: Date,
    default: Date.now,
  },
},
  },
  {
    timestamps: true,
  }
);

export default models.User || model("User", UserSchema);