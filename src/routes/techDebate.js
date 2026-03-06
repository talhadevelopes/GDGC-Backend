import express from "express";
import { TechDebateController } from "../controllers/TechDebateController.js";
export const techDebateRouter = express.Router();

techDebateRouter.route('/form').post(TechDebateController.formSubmit)
techDebateRouter.route('/start-round').post(TechDebateController.startDebate)
techDebateRouter.route('/get-clubs').get(TechDebateController.getClubs)
techDebateRouter.route('/get-score').get(TechDebateController.getScore)
techDebateRouter.route('/increment-score').post(TechDebateController.increment)
techDebateRouter.route('/end-debate').post(TechDebateController.endDebate)
techDebateRouter.route('/vote').post(TechDebateController.vote)
techDebateRouter.route('/temp').post(TechDebateController.createDebatesfortesting)
techDebateRouter.route('/delete-debates').delete(TechDebateController.deleteAllDebateDocuments) 
techDebateRouter.route('/delete-clubs').delete(TechDebateController.deleteAllClubDocuments)
techDebateRouter.route('/get-history').get(TechDebateController.history)
techDebateRouter.route('/pause').post(TechDebateController.pauseDebate)
techDebateRouter.route('/resume').post(TechDebateController.resumeDebate)
techDebateRouter.route('/vote-r').post(TechDebateController.voteRightForLiveMatch)