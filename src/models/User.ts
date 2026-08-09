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

    // =========================
    // Profile Settings
    // =========================

    phone: {
      type: String,
      default: "",
    },

    bio: {
      type: String,
      default: "",
    },

    // =========================
    // Preferences
    // =========================

    preferences: {
      theme: {
        type: String,
        default: "light",
      },

      language: {
        type: String,
        default: "English",
      },

      timezone: {
        type: String,
        default: "(GMT+05:30) Asia/Kolkata",
      },

      summaryLength: {
        type: String,
        default: "Medium",
      },
    },

    // =========================
    // Notification Settings
    // =========================

    notifications: {
      emailNotifications: {
        type: Boolean,
        default: true,
      },

      summaryCompleted: {
        type: Boolean,
        default: true,
      },

      weeklyDigest: {
        type: Boolean,
        default: false,
      },

      productUpdates: {
        type: Boolean,
        default: true,
      },
    },

    // =========================
    // Existing Fields
 recentSearches: {
  type: [
    {
      query: {
        type: String,
        required: true,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  default: [],
},

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