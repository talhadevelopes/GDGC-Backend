import mongoose from 'mongoose';

const exampleSchema = new mongoose.Schema(
  {
    input: { type: String, default: '' },
    output: { type: String, default: '' },
    explanation: { type: String, default: '' },
  },
  { _id: false }
);

const statementSchema = new mongoose.Schema(
  {
    paragraphs: [{ type: String }],
    examples: [exampleSchema],
    constraints: [{ type: String }],
    inputFormat:  { type: String, default: '' },
    outputFormat: { type: String, default: '' },
  },
  { _id: false }
);

const problemSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    required: true,
  },
  tags: [{ type: String, trim: true }],
  statement: { type: statementSchema, default: () => ({}) },
  allowedLanguages: {
    type: [{ type: String }],
    default: ['javascript', 'python', 'cpp', 'java'],
  },
  defaultLanguage: { type: String, default: 'javascript' },
}, { timestamps: true });

export default mongoose.model('Problem', problemSchema);
