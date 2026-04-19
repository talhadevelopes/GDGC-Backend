import express from "express";
import { FriendRequestController } from "../controllers/FriendRequestController.js";
import { VerifyToken } from '../middleware/AuthMiddleware.js';

const friendRequestRouter = express.Router();

friendRequestRouter
.route('/request/:recieicer')
.post(VerifyToken, FriendRequestController.SendFriendRequest); 

friendRequestRouter
.route('/accept/:sender')
.post(VerifyToken, FriendRequestController.AcceptFriendRequest); 

friendRequestRouter
.route('/reject/:sender')
.post(VerifyToken, FriendRequestController.RejectFriendRequest); 

friendRequestRouter
.route('/block/:unfrinedId')
.post(VerifyToken, FriendRequestController.BlockFriend);

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