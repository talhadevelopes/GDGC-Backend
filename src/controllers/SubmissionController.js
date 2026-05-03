import crypto from 'crypto';
import Submission from '../models/Submission.js';
import TestCase from '../models/TestCase.js';
import { judgeQueue } from '../queue.js';
import { QueueEvents } from 'bullmq';

const connection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
};

export const SubmissionController = {
  submit: async (req, res) => {
    try {
      const { problemId, code, language } = req.body;
      console.log(`[Submit] Problem ${problemId} — language: ${language}, user: ${req.id}`);
      if (!problemId || !code || !language) {
        console.log(`[Submit] Missing required fields — problemId: ${!!problemId}, code: ${!!code}, language: ${!!language}`);
        return res.status(400).json({ success: false, message: 'problemId, code, and language are required' });
      }

      const testCases = await TestCase.find({ problem: problemId }).lean();
      console.log(`[Submit] Found ${testCases.length} test case(s) for problem ${problemId}`);
      if (!testCases.length) {
        console.log(`[Submit] No test cases — aborting`);
        return res.status(400).json({ success: false, message: 'No test cases found for this problem' });
      }

      const submissionId = crypto.randomUUID();
      console.log(`[Submit] submissionId: ${submissionId}`);
      console.log(`[Submit] Code (first 300 chars): ${code.slice(0, 300)}`);
      console.log(`[Submit] Test cases being sent to worker:`);
      testCases.forEach((tc, i) => {
        console.log(`  [${i}] input=${JSON.stringify(tc.input.slice(0, 100))} expected=${JSON.stringify(tc.expectedOutput.slice(0, 100))}`);
      });

      const submission = await Submission.create({
        submissionId,
        user: req.id,
        problem: problemId,
        language,
        code,
        verdict: 'pending',
      });
      console.log(`[Submit] Submission created — enqueuing to judge queue`);

      await judgeQueue.add('judge', {
        submissionId,
        code,
        language,
        testCases: testCases.map((tc) => ({ input: tc.input, expectedOutput: tc.expectedOutput })),
      });
      console.log(`[Submit] Job enqueued — returning submissionId to client`);

      res.status(201).json({ success: true, submissionId: submission.submissionId });
    } catch (error) {
      console.error(`[Submit] Error:`, error.message);
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

  // 0. SOLVED — returns set of problemIds the current user has accepted submissions for
  // GET /api/submissions/solved
  solved: async (req, res) => {
    try {
      const solvedIds = await Submission.distinct('problem', {
        user: req.id,
        verdict: 'accepted',
      });
      res.json({ success: true, solvedIds });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // 1. CUSTOM RUN — run code against a single user-provided input, no expected output comparison
  // Body: { code, language, input }
  // Returns: { stdout, stderr, exitCode, timedOut }
  customRun: async (req, res) => {
    try {
      const { code, language, input } = req.body;
      if (!code || !language || input === undefined) {
        return res.status(400).json({ success: false, message: 'code, language, and input are required' });
      }

      const runId = crypto.randomUUID();
      console.log(`[CustomRun] ${runId} — language: ${language}`);

      const queueEvents = new QueueEvents('judge', { connection });
      const job = await judgeQueue.add('run', {
        submissionId: runId,
        code,
        language,
        testCases: [{ input, expectedOutput: '' }],
      });

      const returnvalue = await job.waitUntilFinished(queueEvents, 30_000);
      await queueEvents.close();

      const result = returnvalue.results?.[0];
      if (!result) return res.status(500).json({ success: false, message: 'Worker returned no result' });

      console.log(`[CustomRun] ${runId} — exit: ${result.exitCode}`);
      res.json({ success: true, stdout: result.stdout, stderr: result.stderr, exitCode: result.exitCode, timedOut: result.timedOut });
    } catch (error) {
      console.error(`[CustomRun] Error:`, error.message);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // 2. RUN — run against sample test cases only (isSample: true), no submission saved
  // Body: { code, language, problemId }
  // Returns: { results: [{ index, passed, stdout, stderr, exitCode, timedOut, expectedOutput, input }] }
  run: async (req, res) => {
    try {
      const { code, language, problemId } = req.body;
      if (!code || !language || !problemId) {
        return res.status(400).json({ success: false, message: 'code, language, and problemId are required' });
      }

      const testCases = await TestCase.find({ problem: problemId, isSample: true }).lean();
      if (!testCases.length) {
        return res.status(400).json({ success: false, message: 'No sample test cases found. Ask an admin to mark test cases as sample.' });
      }

      const runId = crypto.randomUUID();
      console.log(`[Run] ${runId} — language: ${language}, sample cases: ${testCases.length}`);

      const queueEvents = new QueueEvents('judge', { connection });
      const job = await judgeQueue.add('run', {
        submissionId: runId,
        code,
        language,
        testCases: testCases.map(tc => ({ input: tc.input, expectedOutput: tc.expectedOutput })),
      });

      const returnvalue = await job.waitUntilFinished(queueEvents, 30_000);
      await queueEvents.close();

      const results = returnvalue.results;
      if (!results) return res.status(500).json({ success: false, message: 'Worker returned no results' });

      const enriched = results.map((r, i) => ({
        ...r,
        expectedOutput: testCases[i]?.expectedOutput ?? '',
        input: testCases[i]?.input ?? '',
      }));

      console.log(`[Run] ${runId} — ${enriched.filter(r => r.passed).length}/${enriched.length} sample passed`);
      res.json({ success: true, results: enriched });
    } catch (error) {
      console.error(`[Run] Error:`, error.message);
      res.status(500).json({ success: false, message: error.message });
    }
  },
};
