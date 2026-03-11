import Blog from "../models/Blog.js";
import Comment from "../models/Comment.js";
import User from "../models/User.js";

export const BlogController = {
    getBlog:async(req,res)=>{
        const {_id} = req.body;
        const foundBlog = await Blog.findOne({_id})
        if (foundBlog) {
            return res.json(foundBlog)
        }
        return res.json({success:false})
    },
    getBlogs:async(req,res)=>{
        let blogsForFrontend = []
        let LikedArray = []
        let currentUserName = ""
        User.findById(req.id).select("name").then(user=>{
            currentUserName = user.name;
        }).catch(err=>{
            console.log("Error in fetching user name for blogs page "+err.message)
        })
        
       
       try {
          const blogs = await Blog.find()
  .sort({ "activity.total_upvotes": -1 })
  .populate({
    path: 'activity.total_comments',
    populate: { path: 'commentedBy', select: 'name' }
  })
  .lean();
  console.log("blogs fetched from db", blogs)
  blogsForFrontend = blogs.map(blog => ({
  ...blog,
  comments: blog.activity.total_comments,   // rename to 'comments'
  activity: {
    ...blog.activity,
    total_comments: blog.activity.total_comments?.length || 0 // set count to array length
  }
}));
            LikedArray = await Blog.find({ "activity.liked_by": req.id }).select("-author -activity.total_upvotes -activity.liked_by -__v -createdAt -updatedAt -title -des -banner -content")
           

       } catch (error) {
        return res.json({message:"Error in fetching blogs "+error.message})
       }
        return res.json({BlogArray:blogsForFrontend,LikedArray,Name:currentUserName})
    },
    upVoteBlog : async(req,res)=>{
        const {_id} = req.body;
        const userId = req.id;
        let alreadyLiked = await Blog.findOne({_id,"activity.liked_by":userId})
        if (alreadyLiked) {
            return res.json({"message":"You have already upvoted this blog"})
        }
        const blog =await Blog.findByIdAndUpdate(_id,{ $inc: { 'activity.total_upvotes': 1 }, $addToSet: { 'activity.liked_by': userId } },   
);
        return res.json({"message":"upVoted successfully"})
    },
    downVoteBlog: async(req,res)=>{
         const {_id} = req.body;
        await Blog.findByIdAndUpdate(_id,{ $inc: { 'activity.total_upvotes': -1 } , $pull: { 'activity.liked_by': req.id } }
);
        return res.json({"message":"downVoted successfully"})
    }
,
    publishBlog:async(req,res)=>{
        const {blog:{title,des,banner,content}} = req.body; //state from frontend
        console.log("req came from frontend",title,des,banner,content)
        if (!title || !des || !banner || !content) {
            return res.json({"message":"Please provide all the details"}).status(500)
        }
        const toBePublished = new Blog({
            title,des,banner,author:req.id,content
        })
        try {
            await toBePublished.save()
        } catch (error) {
            return res.json({"message":"Error in publishing blog "+error.message})
        }
        return res.json({"message":"Blog successfully uploaded",blog:toBePublished})
    },
    deleteBlog: async(req,res)=>{
        const {_id} = req.body;
        const blog = await Blog.findById(_id)
        if (blog.author == req.id) {
            await Blog.findByIdAndDelete(_id)
            return res.json({"message":"Blog deleted successfully"})
        }else{
            return res.json({"message":"unauthorized request"})
        }
    },
    addComment: async(req,res)=>{
        const {_id,text,isReply,replyTo,level} = req.body; //_id is blog id
            const blog = await Blog.findById(_id)
            if (!blog) {
                return res.json({"message":"Blog not found"})
            }   
            const comment = new Comment({
                blogId:_id,
                text,
                commentedBy:req.id, 
                isReply,
                replyTo:isReply?replyTo:null,
                level
            })
            try {
                await Blog.findByIdAndUpdate(_id, {
                $push: { 'activity.total_comments': comment._id }
                });
                await comment.save()
                let commentsending = {
                    _id:comment._id,
                    text:comment.text,
                    commentedBy:await User.findById(req.id).select("name"),
                    isReply:comment.isReply,
                    replyTo:comment.replyTo,
                    createdAt:comment.createdAt,
                    level:comment.level
                }
                return res.json({"message":"Comment added successfully", comment: commentsending })
            } catch (error) {
                return res.json({"message":"Error in adding comment "+error.message})
            }
    },
    removeComment: async(req,res)=>{
        const {_id} = req.body; //this is comment id
        const comment = await Comment.findByIdAndDelete(_id)
        if (!comment) {
            return res.json({"message":"Comment not found"})
        }
        return res.json({"message":"Comment deleted successfully"})
    },
   getComments: async(req,res)=>{
    const {_id} = req.body; //_id is blog id
    const comments = await Comment.find({blogId:_id}).populate('commentedBy','name').sort({createdAt:-1})
    return res.json({comments})
   },
   
}