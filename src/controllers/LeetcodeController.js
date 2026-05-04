import { success } from "zod";
import LeetCode from "../models/LeetCode.js";

export const getLeaderBoard = async (req, res) => {
  try {
    const users = await LeetCode.find() //fetches all leetode docs
      .populate("user", "name")
      .sort({ totalSolved: -1 });

    const rankedUsers = users.map((user, index) => ({
      rank: index + 1,
      ...user.toObject(),
    }));
    //sending response
    res.json({
      success: true,
      data: rankedUsers,
    });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
};
