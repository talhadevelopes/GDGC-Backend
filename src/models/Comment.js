import mongoose from "mongoose";


const commentSchema = new mongoose.Schema({
    blogId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Blog',
        required: true
    },
    text: {
        type: String,
        required: true
    },
    commentedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    level: {
        type: Number,
        default: 0
    },
    isReply:Boolean,
    replyTo:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment',
        required: false
    }
},{timestamps:true});
export default mongoose.model('Comment', commentSchema);