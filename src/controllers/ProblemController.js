import crypto from 'crypto';
import Problem from '../models/Problem.js';
import Submission from '../models/Submission.js';
import TestCase from '../models/TestCase.js';
import { judgeQueue } from '../queue.js';

const POLL_INTERVAL_MS = 500;
const POLL_TIMEOUT_MS = 15_000;

async function pollForResult(submissionId) {
  const deadline = Date.now() + POLL_TIMEOUT_MS;
  while (Date.now() < deadline) {
    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
    const sub = await Submission.findOne({ submissionId }).select('verdict results');
    if (sub && sub.verdict !== 'pending') return sub;
  }
  return null;
}

export const ProblemController = {
  list: async (req, res) => {
    try {
      const problems = await Problem.find().select('title difficulty tags allowedLanguages createdAt');
      res.json({ success: true, problems });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  getById: async (req, res) => {
    try {
      const problem = await Problem.findById(req.params.id);
      if (!problem) return res.status(404).json({ success: false, message: 'Problem not found' });
      res.json({ success: true, problem });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  create: async (req, res) => {
    try {
      const { title, difficulty, tags, statement, starterCode, allowedLanguages, defaultLanguage } = req.body;
      const problem = await Problem.create({
        title,
        difficulty,
        tags,
        statement,
        starterCode,
        allowedLanguages,
        defaultLanguage,
      });
      res.status(201).json({ success: true, problem });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  update: async (req, res) => {
    try {
      const { title, difficulty, tags, statement, starterCode, allowedLanguages, defaultLanguage } = req.body;
      const problem = await Problem.findByIdAndUpdate(
        req.params.id,
        { title, difficulty, tags, statement, starterCode, allowedLanguages, defaultLanguage },
        { new: true, runValidators: true }
      );
      if (!problem) return res.status(404).json({ success: false, message: 'Problem not found' });
      res.json({ success: true, problem });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  delete: async (req, res) => {
    try {
      const problem = await Problem.findByIdAndDelete(req.params.id);
      if (!problem) return res.status(404).json({ success: false, message: 'Problem not found' });
      res.json({ success: true, message: 'Problem deleted' });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  run: async (req, res) => {
    try {
      const { code, language, customInput } = req.body;
      if (!code || !language) {
        return res.status(400).json({ success: false, message: 'code and language are required' });
      }

      const problem = await Problem.findById(req.params.id).select('_id');
      if (!problem) return res.status(404).json({ success: false, message: 'Problem not found' });

      const submissionId = crypto.randomUUID();

      await Submission.create({
        submissionId,
        user: req.id,
        problem: problem._id,
        language,
        code,
        verdict: 'pending',
      });

      await judgeQueue.add('judge', {
        submissionId,
        code,
        language,
        testCases: [{ input: customInput || '', expectedOutput: '' }],
      });

      const result = await pollForResult(submissionId);

      if (!result) {
        return res.status(504).json({ success: false, message: 'Judge timed out. Try again.' });
      }

      const r = result.results[0];
      const status = r.timedOut ? 'time_limit_exceeded' : r.exitCode !== 0 ? 'runtime_error' : 'success';

      res.json({
        success: true,
        status,
        stdout: r.stdout,
        stderr: r.stderr,
        runtimeMs: null,
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },
};
