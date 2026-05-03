import mongoose from "mongoose";

const { Schema, Types } = mongoose;

const tweetSchema = new Schema(
  {
    author: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    text: {
      type: String,
      trim: true,
      maxlength: 280,
      default: "",
    },

    media: [
      {
        url: String,
        public_id: String,
        type: {
          type: String,
          enum: ["image", "video", "gif"],
        },
      },
    ],

    // Reply system
    parentTweet: {
      type: Types.ObjectId,
      ref: "Tweet",
      default: null,
      index: true,
    },

    rootTweet: {
      type: Types.ObjectId,
      ref: "Tweet",
      default: null,
      index: true,
    },

    replyToUser: {
      type: Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },

    isReply: {
      type: Boolean,
      default: false,
      index: true,
    },

    // Engagement
    likeCount: {
      type: Number,
      default: 0,
    },

    replyCount: {
      type: Number,
      default: 0,
    },

    repostCount: {
      type: Number,
      default: 0,
    },

    quoteCount: {
      type: Number,
      default: 0,
    },

    viewCount: {
      type: Number,
      default: 0,
    },

    // User interaction tracking
    likedBy: [
      {
        type: Types.ObjectId,
        ref: "User",
      },
    ],

    repostedBy: [
      {
        type: Types.ObjectId,
        ref: "User",
      },
    ],

    bookmarkedBy: [
      {
        type: Types.ObjectId,
        ref: "User",
      },
    ],

    // Discovery / search
    mentions: [
      {
        type: Types.ObjectId,
        ref: "User",
      },
    ],

    hashtags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],

    // Thread / moderation
    deletedAt: {
      type: Date,
      default: null,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },

    visibility: {
      type: String,
      enum: ["public", "followers", "private"],
      default: "public",
    },
  },
  { timestamps: true }
);

// Useful indexes
tweetSchema.index({ author: 1, createdAt: -1 });
tweetSchema.index({ rootTweet: 1, createdAt: 1 });
tweetSchema.index({ parentTweet: 1, createdAt: 1 });
tweetSchema.index({ hashtags: 1, createdAt: -1 });

export const Tweet = mongoose.model("Tweet", tweetSchema);