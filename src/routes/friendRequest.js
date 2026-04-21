import express from "express";
import { FriendRequestController } from "../controllers/FriendRequestController.js";
import { VerifyToken } from '../middleware/AuthMiddleware.js';

const friendRequestRouter = express.Router();

friendRequestRouter
.route('/request/:receiver')
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
.route('/get-friends')
.get(VerifyToken, FriendRequestController.GetAllFriends); 

friendRequestRouter
.route('/get-friend-requests')
.get(VerifyToken, FriendRequestController.GetAllFriendRequests); 

friendRequestRouter
.route('/get-rejected-requests')
.get(VerifyToken, FriendRequestController.GetAllRejectedFriendRequests); 

export {friendRequestRouter};