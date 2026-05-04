import BuildWeekForm from "../models/BuildWeekForm.js"
import User from "../models/User.js"
import Socials from "../models/Socials.js"
import {z} from "zod"
import {nanoid } from 'nanoid';
import nodemailer from 'nodemailer';
import bcrypt from "bcryptjs";
export const BuildWeekController ={
    submitForm: async(req,res)=>{
    try {
        console.log("bye")
        const requiredBody = z.object({
            name:z.string(),
            email:z.email(),
            college:z.string(),
            roll_no:z.string(),
            phone_no:z.string(),
            domain1:z.string(),
            domain2:z.string(),
            github:z.string(),
            leetcode:z.string()
        })
        const parsedBody = requiredBody.safeParse(req.body);
        console.log("hi")
        if(!parsedBody.success){
            return res.status(404).json({
                message:parsedBody.error
            })
        }
        const {name,email,college,roll_no,phone_no,domain1,domain2,github,leetcode} = re
        let userId 
        let responseMessage
        const user = await User.findOne({email});
        if(user){
            if(await BuildWeekForm.findOne({user:user._id})){
                return res.status(401).json({
                    message:"The User has Already filled the form"
                })
            }
               
            userId = user._id;
            responseMessage = "Form submitted successfully"
        }
        else{
            const password = nanoid();
            const salt = await bcrypt.genSalt(10);
            const hash = await bcrypt.hash(password, salt);
    
            const guestUser = new User({
                name,
                email,
                password: hash,
                guest: true,
                qr_id: 'NA'
            });
            
    
            await guestUser.save();
    
            const transporter = nodemailer.createTransport({
                host: "smtp-relay.brevo.com",
                port: 587,
                secure: false,
                auth: {
                    user: process.env.BREVO_USER,
                    pass: process.env.BREVO_PASS,
                }
            });
    
            await transporter.sendMail({
                from: "GDGC MJCET <gdgc.noreply@gmail.com>",
                to: email,
                subject: "Password for GDGC account",
                html: `<h1>Hello from the Web Dev Team</h1>Thank you for Signing up, Here is your password : <b>${password}</b>...`
            });
            
            userId=guestUser._id;
            responseMessage = "Form submitted and account created. Check your email for the credentials"
                    
        }
         await BuildWeekForm.create({
                    user:userId,
                    college,
                    roll_no,
                    phone_no,
                    domain1,
                    domain2,
                })
                if((github.startswith("https://github.com/"))){
                    await Socials.updateOne({user:userId},{github})
                }
                if((leetcode.startswith("https://leetcode.com/"))){
                    await Socials.updateOne({user:userId},{leetcode})
                }
                 res.status(200).json({
                    message:responseMessage
                })
    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }

    }
}