import { Preferences } from "../../models/preferences.js";
import { getNextCodechefContest } from "../../utils/get_cc_details.js";
import { codechef_mail } from "../../mail_templates/codechef_contest.js";
import { mailSender } from "../../utils/mail_sender.js";
import { addContestEvent } from "../../utils/addToCalendar.js";

/**
 * Convert today's date and a given IST time into a UTC ISO string.
 * This avoids manual +05:30 labeling errors.
 */
function getTodayAtIST(hour, minute = 0) {
  const now = new Date();

  // Build an IST date for today at given hour/minute
  const istDate = new Date(
    new Date(
      now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
    ).setHours(hour, minute, 0, 0)
  );

  return new Date(istDate.getTime() - istDate.getTimezoneOffset() * 60000).toISOString();
}

export const runCodechefNotifier = async (req, res) => {
  try {
 
    const now = new Date();
    const istNow = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
    if (istNow.getDay() !== 3) {
      return res.status(200).json({ success: true, message: "no contest today" });
    }


    const contest = getNextCodechefContest();
    if (!contest) {
      return res.status(200).json({ success: true, message: "no upcoming contest found" });
    }

    
    const startISO = getTodayAtIST(20);      // 8:00 PM IST
    const endISO = getTodayAtIST(21, 30);    // 9:30 PM IST
    addContestEvent("codechef", contest.contestName, "", contest.link, startISO, endISO);

    const prefs = await Preferences.find({ codechef: true })
      .populate("user", "email")
      .exec();
    const emails = prefs.map((p) => p.user?.email).filter(Boolean);

    if (!emails.length) {
      console.log("No subscribed users for CodeChef reminders");
      return res.status(200).json({ success: true, message: "no subscribed users" });
    }

    for (const email of emails) {
      const body = codechef_mail(contest);
      await mailSender(email, "CodeChef Contest Today", body);
      console.log(`Email sent to ${email}`);
    }

    return res.status(200).json({ success: true, message: "CodeChef reminders sent successfully" });
  } catch (error) {
    console.error("Error in CodeChef reminders:", error);
    return res.status(500).json({ success: false, message: "Could not send CodeChef reminders" });
  }
};
