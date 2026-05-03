import express from "express";
import { TechDebateController } from "../controllers/TechDebateController.js";
export const techDebateRouter = express.Router();
import SuperAdminMiddleware from "../middleware/SuperAdminMiddleware.js";
import AdminMiddleware from "../middleware/AdminMiddleware.js";
import { formLimiter, strictLimiter, defaultLimiter } from "../middleware/RateLimitter.js";

// Public routes with rate limiting
techDebateRouter.route('/form').post(formLimiter, TechDebateController.formSubmit)
techDebateRouter.route('/get-score').get(TechDebateController.getScore)
techDebateRouter.route('/vote').post(strictLimiter, TechDebateController.vote)
techDebateRouter.route('/get-history').get(TechDebateController.history)

// Admin protected routes (no rate limiting needed)
techDebateRouter.route('/start-round').post( TechDebateController.startDebate)
techDebateRouter.route('/get-clubs').get( TechDebateController.getClubs)
techDebateRouter.route('/increment-score').post( TechDebateController.increment)
techDebateRouter.route('/end-debate').post( TechDebateController.endDebate)
techDebateRouter.route('/temp').post(  TechDebateController.createDebatesfortesting)
techDebateRouter.route('/delete-debates').delete( TechDebateController.deleteAllDebateDocuments) 
techDebateRouter.route('/delete-clubs').delete(TechDebateController.deleteAllClubDocuments)
techDebateRouter.route('/pause').post( TechDebateController.pauseDebate)
techDebateRouter.route('/resume').post(TechDebateController.resumeDebate)
// techDebateRouter.route('/end-current-debate').post( TechDebateController.endCurrentDebate)
// techDebateRouter.route('/get-clubs').get( TechDebateController.getClubIdUsingName)
// techDebateRouter.route('/make-debate').post( TechDebateController.makeTheDebateLiveAgain)
// techDebateRouter.route('/get-all-debates').get( TechDebateController.allhistory)
//stuff i be doing for media team
