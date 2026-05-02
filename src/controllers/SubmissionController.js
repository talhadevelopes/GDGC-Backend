import crypto from 'crypto';
import Submission from '../models/Submission.js';
import TestCase from '../models/TestCase.js';
import { judgeQueue } from '../queue.js';

export const SubmissionController = {
  submit: async (req, res) => {
    try {
      const { problemId, code, language } = req.body;
      if (!problemId || !code || !language) {
        return res.status(400).json({ success: false, message: 'problemId, code, and language are required' });
      }

      const testCases = await TestCase.find({ problem: problemId }).lean();
      if (!testCases.length) {
        return res.status(400).json({ success: false, message: 'No test cases found for this problem' });
      }

      const submissionId = crypto.randomUUID();

      const submission = await Submission.create({
        submissionId,
        user: req.id,
        problem: problemId,
        language,
        code,
        verdict: 'pending',
      });

      await judgeQueue.add('judge', {
        submissionId,
        code,
        language,
        testCases: testCases.map((tc) => ({ input: tc.input, expectedOutput: tc.expectedOutput })),
      });

      res.status(201).json({ success: true, submissionId: submission.submissionId });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },
  status: async (req, res) => {
    try {
      const submission = await Submission.findOne({ submissionId: req.params.id })
        .select('submissionId verdict allPassed completedAt');
      if (!submission) return res.status(404).json({ success: false, message: 'Submission not found' });
      res.json({
        success: true,
        submissionId: submission.submissionId,
        verdict: submission.verdict,
        done: submission.verdict !== 'pending',
        allPassed: submission.allPassed ?? null,
        completedAt: submission.completedAt ?? null,
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },
  getById: async (req, res) => {
    try {
      const submission = await Submission.findOne({ submissionId: req.params.id });
      if (!submission) return res.status(404).json({ success: false, message: 'Submission not found' });
      res.json({ success: true, submission });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },
  list: async (req, res) => {
    try {
      const filter = {};
      if (req.query.problemId) filter.problem = req.query.problemId;
      if (req.query.userId) filter.user = req.query.userId;

      const submissions = await Submission.find(filter)
        .sort({ createdAt: -1 })
        .select('submissionId user problem language verdict createdAt');
      res.json({ success: true, submissions });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },
};
