import mongoose from 'mongoose';

const testCaseSchema = new mongoose.Schema({
  problem: { type: mongoose.Schema.Types.ObjectId, ref: 'Problem', required: true, index: true },
  input: { type: String, required: true },
  expectedOutput: { type: String, required: true },
}, { timestamps: true });

export default mongoose.model('TestCase', testCaseSchema);
