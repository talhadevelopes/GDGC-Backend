import cron from "node-cron";
import Socials from "../models/Socials.js";
import LeetCode from "../models/LeetCode.js";

const extractLeetcodeUser = (url) => {
  const regex = /leetcode\.com\/(?:u\/)?([a-zA-Z0-9_-]+)\/?/;
  const match = url.match(regex);
  return match ? match[1] : null;
};

const fetchLeetcodeData = async () => {
  // first get the leetcode profiels from the socials doc :--
  const users = await Socials.find({
    leetcode: { $exists: true, $ne: "" }, //$ne is for leetode field not eq to "" empty
  });
  for (let x of users) {
    const raw = x.leetcode;

    const username = raw.includes("leetcode.com")
      ? extractLeetcodeUser(raw)
      : raw;

    if (!username) {
      console.log("Invalid username:", raw);
      continue;
    }
    try {
      const res = await fetch(
        `https://alfa-leetcode-api.onrender.com/${username}/profile`,
      );
      if (!res.ok) {
        console.log("Profile API failed:", username);
        continue;
      }

      const data = await res.json();
      //case where this dont work:--

      if (!data || data.status == "error") {
        console.log("Invalid userr", username);
        continue;
      }

      let activityStatus = "⛔";
      let lastActiveDate = null;
      if (data.recentSubmissions && data.recentSubmissions.length > 0) {
        const last = data.recentSubmissions[0];
        const dateObj = new Date(Number(last.timestamp) * 1000);
        dateObj.setHours(0, 0, 0, 0);
        lastActiveDate = dateObj;

        const diffDays =
          (Date.now() - lastActiveDate.getTime()) / (1000 * 60 * 60 * 24);

        if (diffDays === 0) activityStatus = "🔥";
        else if (diffDays === 1) activityStatus = "💪";
        else if (diffDays <= 2) activityStatus = "💀";
      }

      let contestData;
      //for stupid contest rating
      let contestRating = 0;

      try {
        const contestRes = await fetch(
          `https://alfa-leetcode-api.onrender.com/${username}/contest`,
        );
        // const contestData = await contestRes.json();
        if (!contestRes.ok) {
          console.log("Contest API failed:", username);
        } else {
          contestData = await contestRes.json();
        }

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
      } catch {
        console.log("Contest fetch failed for", username);
      }

      //store data in the db:
      await LeetCode.findOneAndUpdate(
        { user: x.user },
        {
          user: x.user,
          username: username,
          totalSolved: data.totalSolved,
          easySolved: data.easySolved,
          mediumSolved: data.mediumSolved,
          hardSolved: data.hardSolved,
          contestRating: contestRating,
          lastActiveDate: lastActiveDate ? new Date(lastActiveDate) : null,
          activityStatus: activityStatus,
        },
        { upsert: true },
      );
      //  console.log("Done:", username, activityStatus);
    } catch (error) {
      console.log("Error:", error.message);
    }
  }
};

// cron job logic (pandra ghante):-
cron.schedule("0 */15 * * *", () => {
  console.log("Running----..");
  fetchLeetcodeData();
});

// fetchLeetcodeData();
