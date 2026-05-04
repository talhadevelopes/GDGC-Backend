import mongoose from 'mongoose';
import Submission from '../models/Submission.js';

export const LeaderboardController = {
  leaderboard: async (req, res) => {
    try {
      const rankings = await Submission.aggregate([
        { $match: { verdict: 'accepted' } },
        { $group: { _id: { user: '$user', problem: '$problem' } } },
        { $group: { _id: '$_id.user', solved: { $sum: 1 } } },
        { $sort: { solved: -1 } },
        { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'userInfo' } },
        { $unwind: '$userInfo' },
        { $project: { _id: 0, userId: '$_id', name: '$userInfo.name', email: '$userInfo.email', solved: 1 } },
      ]);
      res.json({ success: true, rankings });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  userStats: async (req, res) => {
    try {
      const userId = req.params.id;

      const userObjectId = new mongoose.Types.ObjectId(userId);

      const [solveCount, languagesUsed, recentSubmissions] = await Promise.all([
        Submission.aggregate([
          { $match: { user: userObjectId, verdict: 'accepted' } },
          { $group: { _id: '$problem' } },
          { $count: 'count' },
        ]),
        Submission.distinct('language', { user: userObjectId }),
        Submission.find({ user: userObjectId })
          .sort({ createdAt: -1 })
          .limit(10)
          .select('submissionId problem language verdict createdAt'),
      ]);

      res.json({
        success: true,
        stats: {
          solved: solveCount[0]?.count || 0,
          languages: languagesUsed,
          recentSubmissions,
        },
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },
};
