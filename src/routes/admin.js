import express from "express"
import { AuthController } from "../controllers/AuthController.js"
import AdminMiddleware from "../middleware/AdminMiddleware.js"
import SuperAdminMiddleware from "../middleware/SuperAdminMiddleware.js"
import AdminController from "../controllers/AdminController.js"
import { VerifyToken } from "../middleware/AuthMiddleware.js"
import { Verify } from "crypto"
// import { VerifyToken } from "../middleware/AuthMiddleware.js"
export const adminRouter = express.Router()

// adminRouter.route('/signin').post(AuthController.LoginAdmin)
// adminRouter.route('/signup').post(AuthController.Register)

/// we dont need this as we have a common login for the users as well 

// I need to make a route for creatingg other admins 

// a user who is an superadmin will always be an admin 

adminRouter.route('/verify-admin').get(VerifyToken,AdminMiddleware,AdminController.VerifyAdmin)
adminRouter.route('/verify-super-admin').get(VerifyToken,SuperAdminMiddleware,AdminController.VerifySuperAdmin)

adminRouter.route('/create-admin').post(VerifyToken,AdminMiddleware,AdminController.createAdmin)
adminRouter.route('/create-super-admin').post(VerifyToken,SuperAdminMiddleware,AdminController.createSuperAdmin)
adminRouter.route('/remove-admin').post(VerifyToken,SuperAdminMiddleware,AdminController.removeAdmin)
adminRouter.route('/remove-super-admin').post(VerifyToken,SuperAdminMiddleware,AdminController.removeSuperAdmin)
adminRouter.route('/get-all-users').get(VerifyToken,AdminMiddleware,AdminController.getAllUsers)
adminRouter.route('/get-all-admins').get(VerifyToken,SuperAdminMiddleware,AdminController.getAllAdmins)
adminRouter.route('/get-all-super-admins').get(VerifyToken,SuperAdminMiddleware,AdminController.getAllSuperAdmins)
// Protected by superadmin middleware
adminRouter.route("/contacts").get(VerifyToken,SuperAdminMiddleware, AdminController.getContacts);