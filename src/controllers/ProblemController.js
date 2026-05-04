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
      const { title, difficulty, tags, statement, allowedLanguages, defaultLanguage } = req.body;
      const problem = await Problem.create({
        title,
        difficulty,
        tags,
        statement,
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
      const { title, difficulty, tags, statement, allowedLanguages, defaultLanguage } = req.body;
      const problem = await Problem.findByIdAndUpdate(
        req.params.id,
        { title, difficulty, tags, statement, allowedLanguages, defaultLanguage },
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
  // this one is the actual ghee 
  // run: async (req, res) => {
  //   try {
  //     const { code, language, customInput } = req.body;
  //     console.log(`[Run] Problem ${req.params.id} — language: ${language}, customInput: ${JSON.stringify((customInput || '').slice(0, 200))}`);
  //     if (!code || !language) {
  //       console.log(`[Run] Missing code or language`);
  //       return res.status(400).json({ success: false, message: 'code and language are required' });
  //     }

  //     const problem = await Problem.findById(req.params.id).select('_id title');
  //     if (!problem) {
  //       console.log(`[Run] Problem ${req.params.id} not found`);
  //       return res.status(404).json({ success: false, message: 'Problem not found' });
  //     }

  //     const submissionId = crypto.randomUUID();
  //     console.log(`[Run] "${problem.title}" — submissionId: ${submissionId}, language: ${language}`);
  //     console.log(`[Run] Code (first 300 chars): ${code.slice(0, 300)}`);

  //     await Submission.create({
  //       submissionId,
  //       user: req.id,
  //       problem: problem._id,
  //       language,
  //       code,
  //       verdict: 'pending',
  //     });
  //     console.log(`[Run] Submission created — enqueuing to judge queue`);

  //     await judgeQueue.add('judge', {
  //       submissionId,
  //       code,
  //       language,
  //       testCases: [{ input: customInput || '', expectedOutput: '' }],
  //     });
  //     console.log(`[Run] Job enqueued — polling for result (timeout ${POLL_TIMEOUT_MS}ms)`);

  //     const result = await pollForResult(submissionId);

  //     if (!result) {
  //       console.log(`[Run] ${submissionId} — judge timed out after ${POLL_TIMEOUT_MS}ms`);
  //       return res.status(504).json({ success: false, message: 'Judge timed out. Try again.' });
  //     }

  //     const r = result.results[0];
  //     const status = r.timedOut ? 'time_limit_exceeded' : r.exitCode !== 0 ? 'runtime_error' : 'success';
  //     console.log(`[Run] ${submissionId} — status: ${status}, exitCode: ${r.exitCode}, timedOut: ${r.timedOut}`);
  //     console.log(`[Run] ${submissionId} — stdout: ${JSON.stringify(r.stdout.slice(0, 500))}`);
  //     if (r.stderr) console.log(`[Run] ${submissionId} — stderr: ${JSON.stringify(r.stderr.slice(0, 500))}`);

  //     res.json({
  //       success: true,
  //       status,
  //       stdout: r.stdout,
  //       stderr: r.stderr,
  //       runtimeMs: null,
  //     });
  //   } catch (error) {
  //     console.error(`[Run] Error:`, error.message);
  //     res.status(500).json({ success: false, message: error.message });
  //   }
  // },
};
