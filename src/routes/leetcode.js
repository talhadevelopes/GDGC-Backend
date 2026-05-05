import express from "express";
import { getLeaderBoard } from "../controllers/LeetcodeController.js";
import { VerifyToken } from "../middleware/AuthMiddleware.js";


const leaderboardrouter = express.Router();

// leaderboardrouter.get("/",getLeaderBoard);
leaderboardrouter.get("/", VerifyToken, getLeaderBoard);

export default leaderboardrouter;