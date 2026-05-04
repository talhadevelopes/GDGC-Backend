import mongoose from 'mongoose';

const testCaseResultSchema = new mongoose.Schema(
  {
    index: { type: Number, required: true },
    passed: { type: Boolean, required: true },
    stdout: { type: String, default: '' },
    stderr: { type: String, default: '' },
    exitCode: { type: Number, default: 0 },
    timedOut: { type: Boolean, default: false },
  },
  { _id: false }
);

const submissionSchema = new mongoose.Schema(
  {
    submissionId: { type: String, required: true, unique: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    problem: { type: mongoose.Schema.Types.ObjectId, ref: 'Problem', required: true, index: true },
    language: { type: String, required: true },
    code: { type: String, required: true },
    verdict: {
      type: String,
      enum: ['pending', 'accepted', 'wrong_answer', 'time_limit_exceeded', 'runtime_error'],
      default: 'pending',
    },
    allPassed: { type: Boolean },
    results: [testCaseResultSchema],
    completedAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model('Submission', submissionSchema);
