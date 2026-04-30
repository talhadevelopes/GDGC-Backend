import cron from 'node-cron';
import Socials from '../models/Socials.js';
import LeetCode from '../models/LeetCode.js';


// import mongoose from "mongoose";

// mongoose.connect("mongodb+srv://hsamiuddin405_db_user:wDHR1SEWUtsJexnr@cluster0.jo3gqsq.mongodb.net/")
// .then(() => console.log("DB connected"))
// .catch(err => console.log(err));


const extractLeetcodeUser= (url)=>
{
    const regex = /leetcode\.com\/(?:u\/)?([a-zA-Z0-9_-]+)\/?/;
    const match = url.match(regex);
    return match ? match[1] : null;    
}



const fetchLeetcodeData=async() => {

// first get the leetcode profiels from the socials doc :--
const users = await Socials.find({
    leetcode: {$ne: ""}//$ne is for leetode field not eq to "" empty 
});
for (let x of users){
    // const username = x.leetcode;
    // const username = extractLeetcodeUser(x.leetcode);
    const username = x.leetcode;
try{
const res = await fetch(`https://alfa-leetcode-api.onrender.com/${username}/profile`);
const data = await res.json();

//case where this dont work:--

if(!data || data.status=="error")
{
    console.log("Invalid userr",username);
    continue;
}
//for stupid contest rating
let contestRating = 0;

try {
    const contestRes = await fetch(
        `https://alfa-leetcode-api.onrender.com/${username}/contest`
    );
    const contestData = await contestRes.json();

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
    {user: x.user},
    {
        user: x.user,
        username : username,
        totalSolved: data.totalSolved,
        easySolved: data.easySolved,
        mediumSolved: data.mediumSolved,
        hardSolved: data.hardSolved,
        contestRating: contestRating
    },
    {upsert: true}
 );
// console.log("User:", username);
// console.log("Solved:", data.totalSolved);

}
catch(error){
    console.log("Error:",username);
};
};

};

// cron job logic (pandra ghante):-
cron.schedule("0 */15 * * *", () => {
    console.log("Running every 2 mins...");
    fetchLeetcodeData();
});


// fetchLeetcodeData();