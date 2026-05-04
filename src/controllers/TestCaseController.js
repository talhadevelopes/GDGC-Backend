import TestCase from '../models/TestCase.js';
import Problem from '../models/Problem.js';

export const TestCaseController = {
  list: async (req, res) => {
    try {
      const testCases = await TestCase.find({ problem: req.params.id });
      res.json({ success: true, testCases });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  add: async (req, res) => {
    try {
      const problem = await Problem.findById(req.params.id);
      if (!problem) {
        return res.status(404).json({ success: false, message: 'Problem not found' });
      }
      const docs = req.body.map((tc) => ({
        problem: problem._id,
        input: tc.input,
        expectedOutput: tc.expectedOutput,
      }));
      const testCases = await TestCase.insertMany(docs);
      res.status(201).json({ success: true, testCases });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // remove all the test cases and replace with one test case that is provided
  replaceAll: async (req, res) => {
    try {
      const problem = await Problem.findById(req.params.id);
      if (!problem) return res.status(404).json({ success: false, message: 'Problem not found' });
      await TestCase.deleteMany({ problem: problem._id });
      const docs = req.body.map((tc) => ({
        problem: problem._id,
        input: tc.input,
        expectedOutput: tc.expectedOutput,
      }));
      const testCases = await TestCase.insertMany(docs);
      res.json({ success: true, testCases });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  update: async (req, res) => {
    try {
      const allowed = ['isSample', 'input', 'expectedOutput']
      const updates = {}
      allowed.forEach(key => { if (req.body[key] !== undefined) updates[key] = req.body[key] })
      const tc = await TestCase.findOneAndUpdate(
        { _id: req.params.tcId, problem: req.params.id },
        updates,
        { new: true }
      )
      if (!tc) return res.status(404).json({ success: false, message: 'Test case not found' })
      res.json({ success: true, testCase: tc })
    } catch (error) {
      res.status(500).json({ success: false, message: error.message })
    }
  },

  remove: async (req, res) => {
    try {
      const tc = await TestCase.findOneAndDelete({ _id: req.params.tcId, problem: req.params.id });
      if (!tc) return res.status(404).json({ success: false, message: 'Test case not found' });
      res.json({ success: true, message: 'Test case deleted' });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },
};
