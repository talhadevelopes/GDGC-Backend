import express from "express";
import { TeamMemberController } from "../controllers/TeamMemberController.js";
import { VerifyToken } from "../middleware/AuthMiddleware.js";
import AdminMiddleware from "../middleware/AdminMiddleware.js";

export const teamRouter = express.Router();

teamRouter.get("/", TeamMemberController.list);
teamRouter.get("/:id", TeamMemberController.getById);
teamRouter.post("/", VerifyToken, AdminMiddleware, TeamMemberController.create);
teamRouter.put("/:id", VerifyToken, AdminMiddleware, TeamMemberController.update);
teamRouter.delete("/:id", VerifyToken, AdminMiddleware, TeamMemberController.delete);