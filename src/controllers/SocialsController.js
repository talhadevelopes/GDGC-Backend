import { success } from "zod";
import Socials from "../models/Socials.js";
import LeetCode from "../models/LeetCode.js";

const extractLeetcodeUser = (url) => {
  const regex = /leetcode\.com\/(?:u\/)?([a-zA-Z0-9_-]+)\/?/;
  const match = url.match(regex);
  return match ? match[1] : null;
};

//FUCTION TO VERIFY LEETCODE IDS
const verifyLeetcodeUrl = async (leetusername) => {
  try {
    const res = await fetch(
      `https://alfa-leetcode-api.onrender.com/${leetusername}`,
    );
    const data = await res.json();
    if (data.errors?.length) {
      return false;
    }
    return true;
  } 
  catch(err) {
    console.log(err.message);
    return true;
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
  // console.log("URL:", url);
  // console.log("Extracted:", extracted);
  // console.log("Valid:", isValid);

  return extracted;
};

export const updateSocials = async (req, res) => {
  try {
    const userId = req.id;
    let socials = await Socials.findOne({ user: userId });
    // const user = await User.findById(userId).select("name");
    if (socials) {
      //update
      // socials.name = user.name; // to show name idk why nvm
      if (req.body.linkedin !== undefined) socials.linkedin = req.body.linkedin;
      if (req.body.github !== undefined) socials.github = req.body.github;
      if (req.body.instagram !== undefined)
        socials.instagram = req.body.instagram;
      if (req.body.twitter !== undefined) socials.twitter = req.body.twitter;

      let username = null;
      if (req.body.leetcode) {
        //!== undefined)
        
        try {
          // socials.leetcode = await processLeetcode(req.body.leetcode);
           username = await processLeetcode(req.body.leetcode);
          // store FULL URL in socials
          socials.leetcode = req.body.leetcode;

        } catch (err) {
          return res.status(400).json({
            success: false,
            message: err.message,
          });
        }
      }
      await socials.save();
      //logic for saving leetcode username in leetcode docc and also storing data for the first timei in the leaderboard bf cron
      if (username) {
        try {
          // const username = socials.leetcode;
          const res = await fetch(
            `https://alfa-leetcode-api.onrender.com/${username}/profile`,
          );
          if (!res.ok) throw new Error("LeetCode API failed");
          const data = await res.json();
          if (data && data.status !== "error") {
            let contestRating = 0;
            try {
              const contestres = await fetch(
                `https://alfa-leetcode-api.onrender.com/${username}/contest`,
              );
              const contestData = await contestres.json();
              if (
                contestData?.contestParticipation &&
                contestData.contestParticipation.length > 0
              ) {
                const latestContest =
                  contestData.contestParticipation[
                    contestData.contestParticipation.length - 1
                  ];
                contestRating = latestContest.rating || 0;
              }
            } catch {}

            await LeetCode.findOneAndUpdate(
              { user: userId },
              {
                user: userId,
                username: username,
                totalSolved: data.totalSolved,
                easySolved: data.easySolved,
                mediumSolved: data.mediumSolved,
                hardSolved: data.hardSolved,
                contestRating: contestRating,
              },
              { upsert: true },
            );
          }
        } catch (e) {
          console.log("Immediate fetch failed", e.message);
        }
      }

      return res.json({
        success: true,
        message: "Socials updated",
        data: socials,
      });
    }
    let leetcodeusername = "";
    if (req.body.leetcode) {
      try {
        leetcodeusername = await processLeetcode(req.body.leetcode);
      } catch (err) {
        return res.status(400).json({
          success: false,
          message: err.message,
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
      leetcode: req.body.leetcode || "",
    });
    await socials.save();
    //FOR WHILE CREATINGGGGGG ADDING DATA TO THE LEETCODE DOC (stupid) insatnt leaderboard entry for immediate creation not after cron jobb

    if (leetcodeusername) {
  try {
    const res = await fetch(
      `https://alfa-leetcode-api.onrender.com/${leetcodeusername}/profile`
    );

    if (!res.ok) throw new Error("LeetCode API failed");

    const data = await res.json();

    let contestRating = 0;

    try {
      const contestres = await fetch(
        `https://alfa-leetcode-api.onrender.com/${leetcodeusername}/contest`
      );
      const contestData = await contestres.json();

      if (contestData?.contestParticipation?.length > 0) {
        const latestContest = contestData.contestParticipation.at(-1);
        contestRating = latestContest.rating || 0;
      }
    } catch {}

    await LeetCode.findOneAndUpdate(
      { user: userId },
      {
        user: userId,
        username: leetcodeusername,
        totalSolved: data.totalSolved,
        easySolved: data.easySolved,
        mediumSolved: data.mediumSolved,
        hardSolved: data.hardSolved,
        contestRating,
      },
      { upsert: true }
    );
  } catch (e) {
    console.log("Immediate fetch failed", e.message);
  }
}

    res.json({
      success: true,
      message: "socials created",
      data: socials,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

//read for team only
export const getMySocials = async (req, res) => {
  try {
    const socials = await Socials.findOne({ user: req.id });
    res.json({
      success: true,
      data: socials,
    });
  } catch (e) {
    //500=server error
    res.status(500).json({
      success: false,
      message: e.message,
    });
  }
};

// FOR PUBLIC SIGHT:-
export const getAllSocials = async (req, res) => {
  try {
    const socials = await Socials.find().populate("user", "name"); // takes only name and email from user modell

    res.json({
      success: true,
      data: socials,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
