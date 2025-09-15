import { Preferences } from "../../models/preferences.js";

import fetch from "node-fetch";

import { lc_potd_mail } from "../../mail_templates/lc_potd.js";


import { mailSender } from "../../utils/mail_sender.js";


export const checkUserExists = async (req, res) => {
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


export async function getRecentAcceptedSubmissions(username, limit = 15) {
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

import { getPOTDSlug } from "../../utils/get_potd_slug.js";
import { checkPOTDStatus } from "../../utils/check_potd_status.js";
import { lc_potd_mail } from "../../mail_templates/leetcode_potd.js";
import { mailSender } from "../../utils/mail_sender.js";

export const runLeetcodeNotifierPOTD = async (req, res) => {
  try {
    const slug = await getPOTDSlug();

    const prefs = await Preferences.find({ leetcode_username: { $ne: "" } })
      .populate("user", "email") 
      .exec();

    if (!prefs.length) {
      console.log("No users with linked LeetCode usernames.");
      return res.status(200).json({
        success: true,
        message: "No eligible users found.",
      });
    }

    for (const { leetcode_username, user } of prefs) {
      const email = user?.email;
      if (!email) {
        console.warn(`No email found for user with LeetCode username: ${leetcode_username}`);
        continue;
      }

      const status = await checkPOTDStatus(leetcode_username, slug);

      if (!status.solved) {
        console.log(`Sending email to ${leetcode_username} at ${email}`);
        const body = lc_potd_mail(slug, leetcode_username);
        await mailSender(email, "LeetCode Daily Challenge Reminder", body);
      } else {
        console.log(`${leetcode_username} already solved POTD ✅`);
      }
    }

    return res.status(200).json({
      success: true,
      message: "Successfully mailed the users.",
    });
  } catch (error) {
    console.error("Error in POTD notifier:", error);
    return res.status(500).json({
      success: false,
      message: "Could not send the mails.",
    });
  }
};
