import mongoose from 'mongoose';

const exerciseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    problems: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Problem' }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export default mongoose.model('Exercise', exerciseSchema);
