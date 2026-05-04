import express from "express";
import { updateSocials, getMySocials, getAllSocials } from "../controllers/SocialsController.js";
import { VerifyToken } from "../middleware/AuthMiddleware.js";

const socialsRouter = express.Router();

socialsRouter.post('/',VerifyToken,updateSocials);
socialsRouter.get('/me',VerifyToken, getMySocials );
socialsRouter.get('/',getAllSocials);



export default socialsRouter;