import mongoose from "mongoose";
const Schema = mongoose.Schema

const buildWeekFormSchema = new Schema(
  {
    user: {
      type: mongoose.Types.ObjectId,
      ref:"User",
      required: true,
    },
    college: {
      type: String,
      required: true,
    },
    roll_no: {
      type: String,
      required: true,
    },
    phone_no: {
      type: String,
      required: true,
    },
    domain1: {
      type: String,
      required: true,
      enum: ["Web Basic", "Web Intermediate", "AIML", "CyberSecurity"],
    },
    domain2: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);


export default mongoose.model("BuildWeekForm", buildWeekFormSchema);