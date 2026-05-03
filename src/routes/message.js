import { Router } from "express";
import { MessageController } from "../controllers/MessageController.js";
import { VerifyToken } from "../middleware/AuthMiddleware.js";
import { BlockCheckerMiddleware, ConversationMiddleware } from "../middleware/ConversationMiddleware.js";

export const messageRouter = Router();

messageRouter
.route('/send/:conversationId')
.post(VerifyToken, ConversationMiddleware, BlockCheckerMiddleware, MessageController.SendMessage);

messageRouter
.route('/get/:conversationId')
.get(VerifyToken, ConversationMiddleware, MessageController.GetMessages);

messageRouter
.route('/remove/:conversationId/:messageId')
.patch(VerifyToken, ConversationMiddleware, BlockCheckerMiddleware, MessageController.RemoveMessage)

messageRouter
.route('/edit/:conversationId/:messageId')
.patch(VerifyToken, ConversationMiddleware, BlockCheckerMiddleware, MessageController.EditMessage)
