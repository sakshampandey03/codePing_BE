import { Preferences } from "../../models/preferences.js";

import { getNextCodechefContest } from "../../utils/get_cc_details.js";

import { codechef_mail } from "../../mail_templates/codechef_contest.js";

import { mailSender } from "../../utils/mail_sender.js";

import { addContestEvent } from "../../utils/addToCalendar.js";

function getTodayAtIST(hour, minute = 0) {
  const now = new Date();

  const pad = (n) => String(n).padStart(2, "0");
  const yyyy = now.getFullYear();
  const mm = pad(now.getMonth() + 1);
  const dd = pad(now.getDate());
  const HH = pad(hour);
  const MM = pad(minute);
  const SS = "00";

  return `${yyyy}-${mm}-${dd}T${HH}:${MM}:${SS}+05:30`;
}

export const runCodechefNotifier = async (req, res) => {
  try {
    // check if today is wednesday
    const now = new Date();
    const istNow = new Date(
      now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
    );
    const day = istNow.getDay();

    if (day != 3)
      return res.status(200).json({
        success: true,
        message: "no contest today",
      });
    const contest = getNextCodechefContest();
    const startISO = getTodayAtIST(20);
    const endISO = getTodayAtIST(21, 30);
    addContestEvent(
      "codechef",
      contest.contestName,
      "",
      contest.link,
      startISO,
      endISO
    );
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
