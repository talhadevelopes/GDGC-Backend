import Socials from "../models/Socials.js";

export const updateSocials = async(req,res)=> {
    try{
        const userId= req.id;
        let socials = await Socials.findOne({ user: userId });
        if (socials) {
            //update
            if (req.body.linkedin !== undefined) socials.linkedin = req.body.linkedin;
            if (req.body.github !== undefined) socials.github = req.body.github;
            if (req.body.instagram !== undefined) socials.instagram = req.body.instagram;
            if (req.body.twitter !== undefined) socials.twitter = req.body.twitter;
            if (req.body.leetcode !== undefined) socials.leetcode = req.body.leetcode;

            await socials.save();

            return res.json({
                success: true,
                message: "Socials updated",
                data: socials
            });
        }
        //create
        socials = new Socials({
            user: userId,
            linkedin: req.body.linkedin || "",
            github: req.body.github || "",
            instagram: req.body.instagram || "",
            twitter: req.body.twitter || "",
            leetcode: req.body.leetcode || ""
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
