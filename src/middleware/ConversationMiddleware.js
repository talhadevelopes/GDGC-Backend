import Conversation from "../models/Conversation.js";
import FriendRequest from "../models/FriendRequest.js";

export const ConversationMiddleware = async (req, res, next) => {
    // get user id form req.id, conversation id form params
    const userId = req.id;
    const conversationId = req.params.conversationId;

    // validate them
    if(!userId || !conversationId) {
        return res.status(400).json({
            message: 'sender or conversation info missing'
        });
    }
    try {
        
        // find the conversation and attach to req.conversation
        const conversation = await Conversation.findOne({
            _id: conversationId,
            participants: userId
        })
        if(!conversation) return res.status(404).json({ message: 'conversation not found' });
        req.conversation = conversation;

        // next
        next();
    } catch (error) {
        return res.status(500).json({
            message: error.message
        })
    }
};

export const BlockCheckerMiddleware = async (req, res, next) => {
    const conversation = req.conversation;
    if(conversation.blocked) return res.status(400).json({message: 'You are blocked from messaging'});
    next();
}