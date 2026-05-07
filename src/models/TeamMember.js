import mongoose from "mongoose";

const teamMemberSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  domain: {
    type: String,
    required: true,
    enum: ["WEB", "UI/UX", "AI/ML", "CYBERSEC", "CLOUD", "HR", "MEDIA", "DESIGN", "DOC", "EVENTS", "OPERATIONS", "MARKETING"],
  },
  role: {
    type: String,
    required: true,
    enum: ["EXECOM", "CORE"],
  },
  linkedin: {
    type: String,
    default: "",
  },
  github: {
    type: String,
    default: "",
  },
  instagram: {
    type: String,
    default: "",
  },
}, {
  timestamps: true,
});

const TeamMember = mongoose.model("TeamMember", teamMemberSchema);

export default TeamMember;