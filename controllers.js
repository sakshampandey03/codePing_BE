import { Preferences } from "./models/preferences.js";

import fetch from "node-fetch";
import { getUpcomingCodeforcesContest } from "./utils/check_cf_contest.js";
import { getNextCodechefContest } from "./utils/get_cc_details.js";

import { codeforces_mail } from "./mail_templates/codeforces_contest.js";
import { lc_potd_mail } from "./mail_templates/lc_potd.js";
import { codechef_mail } from "./mail_templates/codechef_contest.js";

import { mailSender } from "./utils/mail_sender.js";
import { Feedback } from "./models/feedback.js";

const getTodaysUTCReset = () => {
  const now = new Date();
  return (
    new Date(
      Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate(),
        0,
        0,
        0
      )
    ).getTime() / 1000
  );
};

const checkUserExists = async (req, res) => {
  const { username } = req.body;
  if (!username) {
    return res.status(400).json({
      success: false,
      message: "Username is required",
    });
  }

  try {
    const result = await fetch("https://leetcode.com/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `
          query getUserProfile($username: String!) {
            matchedUser(username: $username) {
              username
              profile {
                realName
                userAvatar
              }
            }
          }
        `,
        variables: { username },
      }),
    });

    const data = await result.json();
    const exists = !!data?.data?.matchedUser;

    if (exists) {
      return res.status(200).json({
        success: true,
        message: "Username verified",
      });
    } else {
      return res.status(200).json({
        success: false,
        message: "Invalid username",
      });
    }
  } catch (error) {
    console.error("Error verifying user:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong during verification",
    });
  }
};

async function getRecentAcceptedSubmissions(username, limit = 15) {
  try {
    const res = await fetch("https://leetcode.com/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `
        query recentAcSubmissions($username: String!, $limit: Int!) {
          recentAcSubmissionList(username: $username, limit: $limit) {
            titleSlug
            timestamp
          }
        }
      `,
        variables: { username, limit },
        operationName: "recentAcSubmissions",
      }),
    });

    const data = await res.json();
    // console.log("recentAcSubmissionList",data)
    return data.data?.recentAcSubmissionList || [];
  } catch (error) {
    console.log("error while getting recent Accepted solutions", error);
  }
}

const updateData = async (req, res) => {
  try {
    const { email, leetcode_username, codechef, codeforces } = req.body;

    if (
      !email ||
      typeof leetcode_username !== "string" ||
      typeof codechef !== "boolean" ||
      typeof codeforces !== "boolean"
    ) {
      return res.status(400).json({
        message: "Missing or invalid data",
        success: false,
      });
    }

    let existing_user = await Preferences.findOne({ email });

    if (existing_user) {
      existing_user.leetcode_username = leetcode_username;
      existing_user.codechef = codechef;
      existing_user.codeforces = codeforces;
      await existing_user.save();

      return res.status(200).json({
        success: true,
        message: "Preferences updated successfully",
      });
    } else {
      const new_user = await Preferences.create({
        email,
        leetcode_username,
        codechef,
        codeforces,
      });

      return res.status(200).json({
        success: true,
        message: "Preferences created successfully",
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Error while updating preferences",
    });
  }
};

const getData = async (req, res) => {
  try {
    const email = req.query.email;
    // console.log("email received is    ", email)
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const userDetails = await Preferences.findOne({ email });

    if (!userDetails) {
      // Return default preferences if user is new
      return res.status(200).json({
        success: true,
        message: "User preferences not found, returning defaults",
        userDetails: {
          email,
          leetcode_username: "",
          codechef: false,
          codeforces: false,
        },
      });
    }

    return res.status(200).json({
      success: true,
      message: "User details fetched successfully",
      userDetails,
    });
  } catch (error) {
    console.error("Error in getData:", error);
    return res.status(500).json({
      success: false,
      message: "Error while fetching the profile",
    });
  }
};

async function getPOTDSlug() {
  const res = await fetch("https://leetcode.com/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: `
        query {
          activeDailyCodingChallengeQuestion {
            question {
              titleSlug
            }
          }
        }
      `,
    }),
  });

  const data = await res.json();
  return data.data?.activeDailyCodingChallengeQuestion?.question?.titleSlug;
}
async function checkPOTDStatus(username, potdSlug) {
  const resetTime = getTodaysUTCReset();
  let offset = 0;
  const batchSize = 15;

  while (true) {
    const submissions = await getRecentAcceptedSubmissions(
      username,
      batchSize + offset
    );

    if (!submissions.length) break;

    for (const sub of submissions) {
      if (sub.timestamp < resetTime) return { solved: false };
      console.log(sub.titleSlug);
      if (sub.titleSlug === potdSlug)
        return { solved: true, time: sub.timestamp };
    }

    if (submissions[submissions.length - 1].timestamp < resetTime) break;

    offset += batchSize;
  }

  return { solved: false };
}
const runLeetcodeNotifier = async (req, res) => {
  try {
    const slug = await getPOTDSlug();
    const users = await Preferences.find({ leetcode_username: { $ne: "" } });

    for (const { leetcode_username, email } of users) {
      const res = await checkPOTDStatus(leetcode_username, slug);
      if (!res.solved) {
        console.log(`Sending email to ${leetcode_username}, on ${email}`);
        const body = lc_potd_mail(slug, leetcode_username);
        // console.log(slug)
        await mailSender(email, "LeetCode Daily Challenge Reminder ", body);
      } else {
        console.log(`${leetcode_username} already solved POTD ✅`);
      }
    }
    return res.status(200).json({
      success: true,
      message: "successfully mailed the users",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "could not send the mails",
    });
  }
};

const runCodechefNotifier = async (req, res) => {
  try {
    // check if today is wednesday
    const now = new Date();
const istNow = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
const day = istNow.getDay();

    if (day != 3) return res.status(200).json({
        success:true,
        message:"no contest today"
      });
    const contest = getNextCodechefContest();

    const users = await Preferences.find({ codechef: true });

    for (const { email } of users) {
      const body = codechef_mail(contest);
      await mailSender(email, "CodeChef Contest Today ", body);
      // console.log("email sent to ", email, "\n", body)
    }
    return res.status(200).json({
      success: true,
      message: "codechef reminders sent successfully",
    });
  } catch (error) {
    console.log("error in codechef reminders ", error);
    return res.status(500).json({
      success: true,
      message: "successfully sent codechef reminders",
    });
  }
};
// runCodechefNotifier();
function isTodayIST(unixSeconds) {
  const istNow = new Date().toLocaleDateString("en-IN", {
    timeZone: "Asia/Kolkata",
  });
  const contestDate = new Date(unixSeconds * 1000).toLocaleDateString("en-IN", {
    timeZone: "Asia/Kolkata",
  });
  return istNow === contestDate;
}

const runCodeforcesNotifier = async (req, res) => {
  try {
    
    const contest = await getUpcomingCodeforcesContest();
    if (!contest || !isTodayIST(contest.startTimeSeconds)) {
      console.log("No Codeforces contest today");
      return res.status(200).json({
        success:true,
        message:"no contest today"
      });
    }
    // console.log(contest)
    const users = await Preferences.find({ codeforces: true });

    for (const { email } of users) {
      const body = codeforces_mail(contest);
      await mailSender(email, "Codeforces Contest Today!", body);
      console.log(`Email sent to ${email} with body \n ${body}`);
    }
    return res.status(200).json({
      success: true,
      message: "successfully sent codeforces reminders",
    });
  } catch (error) {
    console.log("error in sending codeforces contest reminders ", error);
    return res.status(500).json({
      success: false,
      message: "could not send codeforces reminders",
    });
  }
};

const submitFeedback = async (req, res) =>{
  try {
    const {name, email, subject, message} = req.body;
    if(!name || !message || !email){
      return res.status(400).json({
        success:false,
        message:"incomplete data at feedback"
      })
    }
    await Feedback.create({
      name, email, subject, message
    })
    return res.status(200).json({
      success:true,
      message:"feedback saved successfully"
    })
  } catch (error) {
    console.log("error in submitting feedback", error);
    return res.status(500).json({
      success: false,
      message: "could not send submit Feedback",
    });
  }
}


export {
  updateData,
  getData,
  runCodechefNotifier,
  runLeetcodeNotifier,
  runCodeforcesNotifier,
  checkUserExists,
  submitFeedback
};
