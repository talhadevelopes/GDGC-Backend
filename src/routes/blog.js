import express from "express";
import {BlogController} from "../controllers/BlogController.js";
import { VerifyToken } from "../middleware/AuthMiddleware.js";
export const blogRouter = express.Router()


blogRouter.route('/get-blogs').get(BlogController.getBlogs)
blogRouter.route('/get-blog').post(BlogController.getBlog)
blogRouter.route('/publish-blog').post(VerifyToken,BlogController.publishBlog)
blogRouter.route('/like-blog').post(VerifyToken,BlogController.upVoteBlog)
blogRouter.route('/unlike-blog').post(VerifyToken,BlogController.downVoteBlog)
blogRouter.route('/delete-blog').delete(VerifyToken,BlogController.deleteBlog)
blogRouter.route('/add-comment').post(VerifyToken,BlogController.addComment)
blogRouter.route('/remove-comment').post(VerifyToken,BlogController.removeComment)
blogRouter.route('/get-comments').post(VerifyToken,BlogController.getComments)
blogRouter.route('/delete-all-blogs').get(BlogController.deleteAllBlogs)
blogRouter.route('/my-blogs').get(VerifyToken,BlogController.getAllBlogsOfAUser)
