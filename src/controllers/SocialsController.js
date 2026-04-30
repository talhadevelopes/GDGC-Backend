import { success } from "zod";
import Socials from "../models/Socials.js";



const extractLeetcodeUser= (url)=>
{
    const regex = /leetcode\.com\/(?:u\/)?([a-zA-Z0-9_-]+)\/?/;
    const match = url.match(regex);
    return match ? match[1] : null;    
}


//FUCTION TO VERIFY LEETCODE IDS 
const verifyLeetcodeUrl = async(leetusername)=>{
    try{
            const res = await fetch(`https://alfa-leetcode-api.onrender.com/${leetusername}/profile`);
            const data = await res.json();

            if (!data || data.status==="error"){
                return false;
            }
            return true;
        }
        catch{
            return false;
        }
};

const processLeetcode = async (url) => {
    if (!url) return "";

    const extracted = extractLeetcodeUser(url);

    if (!extracted) {
        throw new Error("Invalid LeetCode URL");
    }

    const isValid = await verifyLeetcodeUrl(extracted);

    if (!isValid) {
        throw new Error("LeetCode user does not exist");
    }

    return extracted;
};


export const updateSocials = async(req,res)=> {
    try{
        const userId= req.id;
        let socials = await Socials.findOne({ user: userId });
        // const user = await User.findById(userId).select("name");
        if (socials) {
            //update
            // socials.name = user.name; // to show name idk why nvm 
            if (req.body.linkedin !== undefined) socials.linkedin = req.body.linkedin;
            if (req.body.github !== undefined) socials.github = req.body.github;
            if (req.body.instagram !== undefined) socials.instagram = req.body.instagram;
            if (req.body.twitter !== undefined) socials.twitter = req.body.twitter;

            if (req.body.leetcode !== undefined) {
    try {
        socials.leetcode = await processLeetcode(req.body.leetcode);
    } catch (err) {
        return res.status(400).json({
            success: false,
            message: err.message
        });
    }
}
        //     if (req.body.leetcode !== undefined) {
        //         const leetusername = extractLeetcodeUser(req.body.leetcode);

        //         if (!leetusername) {
        //             return res.status(400).json({
        //             success: false,
        //             message: "Invalid LeetCode URL"
        //         });
        //     }

        //     const isValid = await verifyLeetcodeUrl(leetusername);

        //     if (!isValid) {
        //         return res.status(400).json({
        //         success: false,
        //         message: "LeetCode user does not exist"
        //     });
        // }
        // socials.leetcode = leetusername;
        // }

            await socials.save();

            return res.json({
                success: true,
                message: "Socials updated",
                data: socials
            });
        }

        //ONLY FOR LEETCODE VERIFICATION AND UGHHH ANYWAYS
        // let leetcodeusername="";
        // if(req.body.leetcode){
        //     const extracted= extractLeetcodeUser(req.body.leetcode);
        //     if(!extracted){
        //         return res.status(400).json({
        //             success: false,
        //             message: "Invalid url for leetcode"
        //         })

        //     }
        //     const isValid = await verifyLeetcodeUrl(extracted);
        //     if(!isValid){
        //         return res.status(400).json({
        //             success: false,
        //             message: "Invalid url for leetcode"
        //         })
        //     }
        //     leetcodeusername = extracted;
        // }
        let leetcodeusername = "";
        if (req.body.leetcode) {
            try {
                leetcodeusername = await processLeetcode(req.body.leetcode);
            } catch (err) {
                return res.status(400).json({
                    success: false,
                    message: err.message
                });
            }
        }

        //create
        socials = new Socials({
            user: userId,
            // name: user.name,
            linkedin: req.body.linkedin || "",
            github: req.body.github || "",
            instagram: req.body.instagram || "",
            twitter: req.body.twitter || "",
            leetcode: leetcodeusername

        });
        await socials.save();

        res.json({
            success:true,
            message:"socials created",
            data:socials
        });
    }


    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};


//read for team only
export const getMySocials = async(req,res)=>{
    try{
        const socials=await Socials.findOne({user:req.id})
        res.json({
            success:true,
            data:socials
        });

    }
    //500=server error
    catch(e){
        res.status(500).json({
            success:false,
            message:e.message
        });
    }
};



// FOR PUBLIC SIGHT:-
export const getAllSocials = async (req, res) => {
    try {
        const socials = await Socials.find().populate("user", "name"); // takes only name and email from user modell

        res.json({
            success: true,
            data: socials
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};
