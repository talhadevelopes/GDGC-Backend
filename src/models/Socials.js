import mongoose from "mongoose";

const socialsSchema= new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required: true,
        unique: true
    },
    linkedin:{
        type: String,
        default:""
    },
    github:{
        type: String,
        default:""
    },
    
    instagram:{
        type: String,
        default:""
    },
    twitter:{
        type: String,
        default:""
    }
}, {timestamps: true}
);


export default mongoose.model("Socials",socialsSchema);