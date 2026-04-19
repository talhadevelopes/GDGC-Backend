import {z} from 'zod';
import FriendRequest from '../models/FriendRequest.js';
import { io, userSocketMap } from '../index.js';
import Conversation from '../models/Conversation.js';

export const FriendRequestController = {

    SendFriendRequest: async (req, res) => { 
        const receiver = req.params.recieicer;
        const sender = req.id;
        if(!receiver) {
            return res.status(400).json({
                message: 'Receiver id needed'
            })
        }
        if(sender.toString() === receiver.toString()) {
            return res.status(400).json({ message: 'Cannot request to be your own friend' })
        }
        try {
            // Checking if the request already exists
            const existingRequest = await FriendRequest.findOne({
                $or: [
                    { sender, receiver},
                    { sender: receiver, receiver: sender}
                ]
            });
            if(existingRequest) {
                return res.status(409).json({
                    message: `Friend request already exists and is ${existingRequest.status}`
                })
            }

            const newFriendRequest = await FriendRequest.create({
                sender,
                receiver
            });

            const receiverSocketId = userSocketMap[receiver];
            if(receiverSocketId) {
                io.to(receiverSocketId).emit('NewFriendRequest', newFriendRequest);
            }

            return res.status(201).json({
                message: 'new friend request created and sent to the reciever',
                newFriendRequest
            })

        } catch (error) {
            return res.status(500).json({
                message: error.message
            })
        }
    },

    AcceptFriendRequest: async (req, res) => {
        // Get sender id from params, validate
        const receiver = req.id;
        const sender = req.params.sender;
        if(!sender) {
            return res.status(400).json({
                message: 'Senders Id is required'
            })
        }
        if(sender.toString() === receiver.toString()) {
            return res.status(400).json({ message: 'Cannot accept to be your own friend' })
        }

        try {
            // check for existing request if rejected throw error else if already friend throw conflict error else if pending patch!
            const existingRequest = await FriendRequest.findOne({
                sender,
                receiver
            });
            if(!existingRequest) {
                return res.status(400).json({
                    message: 'No friend request found'
                })
            }
            if(existingRequest.status !== 'pending') {
                return res.status(409).json({
                    message: `Request has already been ${existingRequest.status}`
                })
            }
    
            existingRequest.status = 'accepted';
            await existingRequest.save()
    
            // create a conversation between them
            await Conversation.create({
                participants: [sender, receiver],
            });
    
            // notify the sender of the status
            const senderSocketId = userSocketMap[sender];
            if(senderSocketId) {
                io.to(senderSocketId).emit('FriendRequestAccepted', existingRequest)
            }

            return res.status(200).json({
                message: 'Friend request accepted',
                data: existingRequest
            });

        } catch (error) {
            return res.status(500).json({
                message: error.message
            })
        }
    },

    RejectFriendRequest: async (req, res) => {
        // Get sender id from params, validate
        const receiver = req.id;
        const sender = req.params.sender;
        if(!sender) {
            return res.status(400).json({
                message: 'Senders Id is required'
            })
        }
        if(sender.toString() === receiver.toString()) {
            return res.status(400).json({ message: 'Cannot deny request to be your own friend' })
        }

        try {
            // check for existing request if rejected throw error else if already friend throw conflict error else if pending patch!
            const existingRequest = await FriendRequest.findOne({
                sender,
                receiver
            });
            if(!existingRequest) {
                return res.status(400).json({
                    message: 'No friend request found'
                })
            }
            if(existingRequest.status !== 'pending') {
                return res.status(409).json({
                    message: `Request has already been ${existingRequest.status}`
                })
            }

            existingRequest.status = 'rejected';
            await existingRequest.save()
    
    
            // notify the sender of the status
            const senderSocketId = userSocketMap[sender];
            if(senderSocketId) {
                io.to(senderSocketId).emit('FriendRequestRejected', existingRequest)
            }

            return res.status(200).json({
                message: 'Friend request rejected',
                data: existingRequest
            });

        } catch(error) {
            return res.status(500).json({
                message: error.message
            })
        }
    },

    GetAllFriendRequests: async (req, res) => {
        const userId = req.id;

        try {
            const friendRequests = await FriendRequest.find({
                $or: [
                    { receiver: userId },
                    { sender: userId }
                ],
                status: 'pending'
            });
            if(friendRequests.length === 0) {
                return res.status(200).json({ message: 'No friend requests yet' })
            }

            return res.status(200).json({
                friendRequests
            })
        } catch (error) {
            return res.status(500).json({ message: error.message })
        }
    },

    GetAllRejectedFriendRequests: async (req, res) => {
        const userId = req.id;

        try {
            const rejectedFriendRequests = await FriendRequest.find({
                $or: [
                    { receiver: userId },
                    { sender: userId }
                ],
                status: 'rejected'
            });
            if(rejectedFriendRequests.length === 0) {
                return res.status(200).json({ message: 'No rejections yet' })
            }

            return res.status(200).json({
                rejectedFriendRequests
            })
        } catch (error) {
            return res.status(500).json({ message: error.message })
        }
    },

    GetAllFriends: async (req, res) => {
        const userId = req.id;

        try {
            const friends = await FriendRequest.find({
                $or: [
                    { receiver: userId },
                    { sender: userId }
                ],
                status: 'accepted'
            });
            if(friends.length === 0) {
                return res.status(200).json({ message: 'No friends yet' })
            }

            return res.status(200).json({
                friends
            })
        } catch (error) {
            return res.status(500).json({ message: error.message })
        }
    },

    BlockFriend: async (req, res) => {
        const userId = req.id;
        const unfrinedId = req.params.unfrinedId;
        if(!unfrinedId) {
            return res.status(400).json({
                message: 'unfriendId is required'
            });
        }
        if(userId.toString() === unfrinedId.toString()) {
            return res.status(400).json({ message: 'Cannot block your own self' })
        }

        try {
            // Check for existing && accepted friend requests with user and unfriend, if none thorw error
            const existingRequest = await FriendRequest.findOne({
                $or: [
                    { receiver: userId, sender: unfrinedId },
                    { receiver: unfrinedId, sender: userId },
                ],
                status: 'accepted'
            });
            if(!existingRequest) {
                return res.status(404).json({
                    message: 'No such friend to unfrined'
                })
            }
    
            // patch status to block
            existingRequest.status = 'blocked';
            await existingRequest.save();

            // Send the other party a notification
            // Question to captain, should the user being blocked be notified about him being blocked by the current user?
            const unfriendSocketId = userSocketMap[unfrinedId];
            if(unfriendSocketId) {
                io.to(unfriendSocketId).emit('Blocked', existingRequest)
            }
    
            // return result
            return res.status(200).json({
                message: 'user blocked successfully',
                existingRequest
            })
        } catch (error) {
            return res.status(500).json({
                message: error.message
            })
        }

    },
 
}