import express from "express";
import { FriendRequestController } from "../controllers/FriendRequestController.js";
import { VerifyToken } from '../middleware/AuthMiddleware.js';

const friendRequestRouter = express.Router();

friendRequestRouter
.route('/send/:receiver')
.post(VerifyToken, FriendRequestController.SendFriendRequest); 

friendRequestRouter
.route('/accept/:sender')
.patch(VerifyToken, FriendRequestController.AcceptFriendRequest); 

friendRequestRouter
.route('/reject/:sender')
.patch(VerifyToken, FriendRequestController.RejectFriendRequest); 

friendRequestRouter
.route('/block/:unfrinedId')
.patch(VerifyToken, FriendRequestController.BlockFriend);

friendRequestRouter
.route('/unblock/:unBlockFriendId')
.patch(VerifyToken, FriendRequestController.UnblockFriend)

friendRequestRouter
.route('/friends')
.get(VerifyToken, FriendRequestController.GetAllFriends); 

friendRequestRouter
.route('/friend-requests')
.get(VerifyToken, FriendRequestController.GetAllFriendRequests); 

friendRequestRouter
.route('/rejected-requests')
.get(VerifyToken, FriendRequestController.GetAllRejectedFriendRequests); 

friendRequestRouter
.route('/conversations')
.get(VerifyToken, FriendRequestController.GetAllConversations);

friendRequestRouter
.route('/users')
.get(VerifyToken, FriendRequestController.GetAllUsers);

export {friendRequestRouter};