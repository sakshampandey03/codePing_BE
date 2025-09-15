import { Preferences } from "../../models/preferences.js";
import { getUpcomingLeetCodeContests } from "../../utils/check_leetcode_contest.js";
import { leetcode_mail } from "../../mail_templates/leetcode_contest.js";
import { mailSender } from "../../utils/mail_sender.js";
import { addContestEvent } from "../../utils/addToCalendar.js";


function getDateAtIST(dateStr, hour) {

  const baseIST = new Date(
    new Date(dateStr).toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
  );
  baseIST.setHours(hour, 0, 0, 0);

  return new Date(baseIST.getTime() - baseIST.getTimezoneOffset() * 60000).toISOString();
}

export const runLeetcodeNotifier = async (req, res) => {
  try {
   
    const contests = getUpcomingLeetCodeContests(2);
    if (!contests || !contests.length) {
      console.log("No upcoming LeetCode contests found.");
      return res.status(200).json({
        success: true,
        message: "No upcoming contests found",
      });
    }

    const prefs = await Preferences.find({ leetcode_contests: true })
      .populate("user", "email")
      .exec();
    const emails = prefs.map((p) => p.user?.email).filter(Boolean);

    if (!emails.length) {
      console.log("No subscribed users for LeetCode reminders.");
      return res.status(200).json({
        success: true,
        message: "No subscribed users found",
        contests,
      });
    }

    for (const contest of contests) {
      console.log("Processing contest:", contest);

      const startISO = getDateAtIST(contest.date, contest.startHour);
      const endISO = getDateAtIST(contest.date, contest.endHour);

      // Add to calendar
      addContestEvent("leetcode", contest.contestName, "", contest.link, startISO, endISO);

      // Send emails
      for (const email of emails) {
        const body = leetcode_mail(contest);
        await mailSender(email, `Reminder: ${contest.contestName}`, body);
        console.log(`LeetCode reminder sent to ${email}`);
      }
    }

    return res.status(200).json({
      success: true,
      message: `LeetCode reminders sent for ${contests.length} contests`,
      contests,
    });
  } catch (error) {
    console.error("Error in LeetCode reminders:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to send LeetCode reminders",
    });
  }
};
