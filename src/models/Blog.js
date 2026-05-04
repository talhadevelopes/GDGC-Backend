import mongoose from "mongoose"
const blogSchema = new mongoose.Schema({
   title:{
    type:String,
    required:true,
   },
   banner:{
    type:String
   },content : {
    type:[]
   },
   author:{
    type:mongoose.Schema.Types.ObjectId,
    required:true,
    ref:'User'
   },
   activity:{
    total_upvotes:{
        type:Number,
        default:0
    },liked_by:{
        type:[mongoose.Schema.Types.ObjectId],
        ref:'User'
    },
    total_comments:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Comment',
        
    }]
   },
   validated:{
    type:Boolean,
    default:false
   }
},{timestamps:true});
export default mongoose.model('Blog', blogSchema);