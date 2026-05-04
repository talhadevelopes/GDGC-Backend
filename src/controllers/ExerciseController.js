import Exercise from '../models/Exercise.js';
import Submission from '../models/Submission.js';

export const ExerciseController = {
  // GET /api/exercises  — list all, include per-user progress if authenticated
  list: async (req, res) => {
    try {
      const exercises = await Exercise.find()
        .populate('problems', '_id title difficulty tags')
        .sort({ createdAt: -1 })
        .lean();

      // If the user is logged in, attach solved counts
      let solvedSet = new Set();
      if (req.id) {
        const solvedIds = await Submission.distinct('problem', {
          user: req.id,
          verdict: 'accepted',
        });
        solvedSet = new Set(solvedIds.map(String));
      }

      const enriched = exercises.map((ex) => ({
        ...ex,
        problemCount: ex.problems.length,
        solvedCount: ex.problems.filter((p) => solvedSet.has(String(p._id))).length,
      }));

      res.json({ success: true, exercises: enriched });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // GET /api/exercises/:id  — single exercise with problems + user solved status
  getById: async (req, res) => {
    try {
      const exercise = await Exercise.findById(req.params.id)
        .populate('problems', '_id title difficulty tags slug')
        .lean();

      if (!exercise) {
        return res.status(404).json({ success: false, message: 'Exercise not found' });
      }

      let solvedSet = new Set();
      if (req.id) {
        const solvedIds = await Submission.distinct('problem', {
          user: req.id,
          verdict: 'accepted',
        });
        solvedSet = new Set(solvedIds.map(String));
      }

      const problems = exercise.problems.map((p) => ({
        ...p,
        solved: solvedSet.has(String(p._id)),
      }));

      res.json({
        success: true,
        exercise: {
          ...exercise,
          problems,
          problemCount: problems.length,
          solvedCount: problems.filter((p) => p.solved).length,
        },
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // POST /api/exercises  (admin)
  create: async (req, res) => {
    try {
      const { title, description, problems } = req.body;
      if (!title?.trim()) {
        return res.status(400).json({ success: false, message: 'title is required' });
      }
      const exercise = await Exercise.create({
        title: title.trim(),
        description: description || '',
        problems: problems || [],
        createdBy: req.id,
      });
      res.status(201).json({ success: true, exercise });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // PUT /api/exercises/:id  (admin)
  update: async (req, res) => {
    try {
      const allowed = ['title', 'description', 'problems'];
      const updates = {};
      allowed.forEach((key) => {
        if (req.body[key] !== undefined) updates[key] = req.body[key];
      });

      const exercise = await Exercise.findByIdAndUpdate(req.params.id, updates, { new: true })
        .populate('problems', '_id title difficulty tags');

      if (!exercise) {
        return res.status(404).json({ success: false, message: 'Exercise not found' });
      }
      res.json({ success: true, exercise });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // DELETE /api/exercises/:id  (admin)
  delete: async (req, res) => {
    try {
      const exercise = await Exercise.findByIdAndDelete(req.params.id);
      if (!exercise) {
        return res.status(404).json({ success: false, message: 'Exercise not found' });
      }
      res.json({ success: true, message: 'Exercise deleted' });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },
};
