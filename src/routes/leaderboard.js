import express from 'express';
import { LeaderboardController } from '../controllers/LeaderboardController.js';

export const leaderboardRouter = express.Router();

leaderboardRouter.get('/', LeaderboardController.leaderboard);

export const userStatsRouter = express.Router();
userStatsRouter.get('/:id/stats', LeaderboardController.userStats);
