import express from "express";
import { getLeaderBoard } from "../controllers/LeetcodeController.js";

const leaderboardrouter = express.Router();

leaderboardrouter.get("/",getLeaderBoard);

export default leaderboardrouter;