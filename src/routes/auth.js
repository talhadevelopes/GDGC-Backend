import express from "express"
import { AuthController } from "../controllers/AuthController.js"
import { VerifyToken } from "../middleware/AuthMiddleware.js"
import { InitialSetupVerify } from "../middleware/InitialSetupMiddleware.js"

export const authRouter = express.Router()

// authRouter.route('/signin').post(AuthController.LoginAdmin)
authRouter.route('/signup').post(AuthController.CreateUserFromEmail)
authRouter.route('/signin').post(AuthController.LoginUser)
authRouter.route('/forgot-password').post(AuthController.ForgotPassword)
authRouter.route('/signup-guest').post(AuthController.GuestLogin)
// authRouter.route('/about').get(VerifyToken,AuthController.aboutUser)
// ^ this is redundant we are using get-dashboard to do the same 
authRouter.route('/change-password').post(VerifyToken,AuthController.ChangePassword)
authRouter.route('/simple-verify').get(VerifyToken,AuthController.SimpleVerify)
authRouter.route('/initial-setup-check').get(InitialSetupVerify,AuthController.SimpleVerify)