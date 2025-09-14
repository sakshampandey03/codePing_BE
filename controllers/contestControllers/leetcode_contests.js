import { Preferences } from "../../models/preferences.js";
import { getUpcomingLeetCodeContests } from "../../utils/check_leetcode_contest.js";
import { leetcode_mail } from "../../mail_templates/leetcode_contest.js";
import { mailSender } from "../../utils/mail_sender.js";
import { addContestEvent } from "../../utils/addToCalendar.js";

function getDateAtIST(dateStr, hour) {
  const [day, month, year] = new Date(dateStr).toLocaleDateString("en-GB", { timeZone: "Asia/Kolkata" }).split("/");
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}T${String(hour).padStart(2, "0")}:00:00+05:30`;
}

export const runLeetcodeNotifier = async (req, res) => {
  try {
    const contests = getUpcomingLeetCodeContests(2); // get next two weekly and biweekly
    const users = await Preferences.find({ leetcode_contests: true });

    for (const contest of contests) {
        console.log(contest)
      const startISO = getDateAtIST(contest.date, contest.startHour);
      const endISO = getDateAtIST(contest.date, contest.endHour);

      // Add calendar event
      addContestEvent("leetcode", contest.contestName, "", contest.link, startISO, endISO);

      // Send emails
      for (const { email } of users) {
        const body = leetcode_mail(contest);
        await mailSender(email, `Reminder: ${contest.contestName}`, body);
      }
        // const body = leetcode_mail(contest);
        // await mailSender("kumarsaksham224@gmail.com", `Reminder: ${contest.contestName}`, body);
        
    }

    return res.status(200).json({
      success: true,
      message: `LeetCode reminders sent for ${contests.length} contests`,
      contests,
    });
  } catch (error) {
    console.error("Error in LeetCode reminders", error);
    return res.status(500).json({
      success: false,
      message: "Failed to send LeetCode reminders",
    });
  }
};
// runLeetCodeNotifier();