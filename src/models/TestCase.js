import mongoose from 'mongoose';

const testCaseSchema = new mongoose.Schema({
  problem: { type: mongoose.Schema.Types.ObjectId, ref: 'Problem', required: true, index: true },
  input: { type: String, required: true },
  expectedOutput: { type: String, required: true },
  isSample: { type: Boolean, default: false }, // true = shown to user + used for Run; false = hidden, only used for Submit
}, { timestamps: true });

export default mongoose.model('TestCase', testCaseSchema);
