import express from "express";
import {
  createImage,
  deleteImage,
  getAllImages,
  getImageById,
  updateImage,
} from "../controllers/ImageController.js";

import  AdminMiddleware  from "../middleware/AdminMiddleware.js";
import { VerifyToken } from "../middleware/AuthMiddleware.js";

export const imageRouter = express.Router();


const validateImage = (req, res, next) => {
  const { title, imageUrl } = req.body;

  if (!title || !imageUrl) {
    return res.status(400).json({
      success: false,
      msg: "Title and Image URL are required",
    });
  }

  const urlRegex = /^(https?:\/\/)[^\s]+$/;

  if (!urlRegex.test(imageUrl)) {
    return res.status(400).json({
      success: false,
      msg: "Invalid image URL",
    });
  }

  next();
};



imageRouter
  .route("/")
  .get(VerifyToken, AdminMiddleware, getAllImages)
  .post(VerifyToken, AdminMiddleware, validateImage, createImage);

imageRouter
  .route("/:id")
  .get(VerifyToken, AdminMiddleware, getImageById)
  .put(VerifyToken, AdminMiddleware, validateImage, updateImage)
  .delete(VerifyToken, AdminMiddleware, deleteImage);

imageRouter
  .route("/")
  .get(getAllImages)
  .post(VerifyToken, AdminMiddleware, validateImage, createImage);

imageRouter
  .route("/:id")
  .get(getImageById)
  .put(VerifyToken, AdminMiddleware, validateImage, updateImage)
  .delete(VerifyToken, AdminMiddleware, deleteImage);