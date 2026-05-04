import { BuildWeekController } from "../controllers/BuildWeekController.js";
import express from "express";
const buildweekRouter = express.Router()

buildweekRouter.route('/form').post(BuildWeekController.submitForm)

export {buildweekRouter}