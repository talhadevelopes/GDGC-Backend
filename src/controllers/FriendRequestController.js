import FriendRequest from '../models/FriendRequest.js';
import { io, userSocketMap } from '../index.js';
import Conversation from '../models/Conversation.js';

 const COOL_DOWN_PERIOD = 5 * 24 * 60 *  60 * 1000;
export const FriendRequestController = {

    SendFriendRequest: async (req, res) => { 
        const receiver = req.params.receiver;
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
            if(!existingRequest) { // No request exists so, one is created
                const newFriendRequest = await FriendRequest.create({
                    sender,
                    receiver
                });
 
                // receiver notified
                const receiverSocketId = userSocketMap[receiver];
                if(receiverSocketId) {
                    io.to(receiverSocketId).emit('NewFriendRequest', newFriendRequest);
                }

                return res.status(201).json({
                    message: 'new friend request created and sent to the reciever',
                    newFriendRequest
                })
            }
            if(existingRequest.status !== 'rejected') { // if accepted or pending pr blocked
                return res.status(409).json({
                    message: `Friend request already exists and is ${existingRequest.status}`
                })
            }
            // computing time elapsed after being rejected
            const timeAfterRejection = Date.now() - existingRequest.rejectedAt.getTime();
            if(
                timeAfterRejection < COOL_DOWN_PERIOD && // elapsed time should be more than cool down period or else try later
                sender.toString() === existingRequest.sender.toString() // previous sender should be the current sender (resending the request after being rejected)
            ) {
                return res.status(409).json({
                    message: 'Try again later'
                })
            } 
            
            existingRequest.status = 'pending'; 
            if(sender.toString() === existingRequest.receiver.toString()) { // current user(sender) should have received a request from the current receiver meaning the current user must be same as the previous receiver
                existingRequest.receiver = receiver; // changing the previous request's receiver(current user/sender) to the current receiver  
                existingRequest.sender = sender; // changing the previous sender(current receiver) to the current sender who is the current user
            }
            existingRequest.rejectedAt = null;
            await existingRequest.save();

            const receiverSocketId = userSocketMap[receiver];
            if(receiverSocketId) {
                io.to(receiverSocketId).emit('NewFriendRequest', existingRequest);
            }

            return res.status(200).json({
                message: 'Rejected request refreshed'
            });

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
            existingRequest.rejectedAt = new Date()
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
            })
            .populate('sender', 'name admin superadmin')
            .populate('receiver', 'name admin supreadmin');
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
            })
            .populate('sender', 'name admin superadmin')
            .populate('receiver', 'name admin supreadmin');
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
            })
            .populate('sender', 'name admin superadmin')
            .populate('receiver', 'name admin superadmin')
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
        const blockFrinedId = req.params.unfrinedId;
        if(!blockFrinedId) {
            return res.status(400).json({
                message: 'unfriendId is required'
            });
        }
        if(userId.toString() === blockFrinedId.toString()) {
            return res.status(400).json({ message: 'Cannot block your own self' })
        }

        try {
            // Check for existing && accepted friend requests with user and unfriend, if none thorw error
            const existingRequest = await FriendRequest.findOne({
                $or: [
                    { receiver: userId, sender: blockFrinedId },
                    { receiver: blockFrinedId, sender: userId },
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
            const blockFriendSocketId = userSocketMap[blockFrinedId];
            if(blockFriendSocketId) {
                io.to(blockFriendSocketId).emit('Blocked', existingRequest)
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

    UnblockFriend: async (req, res) => {
        //get the userId and Id of the friend to be unblocked
        const userId = req.id;
        const unBlockFriendId = req.params.unBlockFriendId;

       try {
         // get the existing friend request and check if it is blocked
         const existingRequest = await FriendRequest.findOne({
             $or: [
                 {sender: userId, receiver: unBlockFriendId},
                 {receiver: userId, sender: unBlockFriendId}
             ],
             status: 'blocked'
         });
         if(!existingRequest) { // if not blocked throw
             return res.status(404).json({
                 message: 'No such request found'
             })
         }
 
         // if blocked, turn to accepted
         existingRequest.status = 'accepted';
 
         // save the doc
         await existingRequest.save();
 
         // notify the other party
         const unBlockFriendSocketId = userSocketMap[unBlockFriendId];
         if(unBlockFriendSocketId) {
             io.to(unBlockFriendSocketId).emit('Unblocked', existingRequest);
         }
 
         // return response
         return res.status(200).json({
             message: 'Unblocked successfully',
             existingRequest
         })
       } catch (error) {
            return res.status(500).json({
                message: error.message
            });
       }
    },
 
}