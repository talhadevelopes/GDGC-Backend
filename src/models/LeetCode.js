import mongoose from "mongoose";


const leetcodeSchema = new mongoose.Schema({
    user: {
        type:mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true ,
        unique: true
    },
    username: {
        type: String,
        required: true
    },

    totalSolved:{ 
        type: Number,
        default: 0
    },
    easySolved:{ 
        type: Number,
        default: 0
    },
    mediumSolved:{ 
        type: Number,
        default: 0
    },
    hardSolved:{ 
        type: Number,
        default: 0
    },
    contestRating: {
        type: Number
    }


},{
    timestamps: true
});

export default mongoose.model("LeetCode",leetcodeSchema);