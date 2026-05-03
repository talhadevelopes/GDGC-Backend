import express from "express";
import { createContact } from "../controllers/ContactController.js";
import rateLimit from "express-rate-limit";

export const contactRouter = express.Router();


const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 20, 
  message: {
    success: false,
    msg: "Too many requests. Please try again later.",
  },
});


const validateContact = (req, res, next) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    return res.status(400).json({
      success: false,
      msg: "All fields are required",
    });
  }

  const emailRegex = /\S+@\S+\.\S+/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      msg: "Invalid email format",
    });
  }
  if (message.length < 10) {
    return res.status(400).json({
      success: false,
      msg: "Message should be at least 10 characters",
    });
  }

  next();
};

contactRouter
  .route("/")
  .post(contactLimiter, validateContact, createContact);