import { Preferences } from "../../models/preferences.js";

import { getUpcomingCodeforcesContest } from "../../utils/check_cf_contest.js";

import { codeforces_mail } from "../../mail_templates/codeforces_contest.js";

import { mailSender } from "../../utils/mail_sender.js";
import { addContestEvent } from "../../utils/addToCalendar.js";

function isTodayIST(unixSeconds) {
  const istNow = new Date().toLocaleDateString("en-IN", {
    timeZone: "Asia/Kolkata",
  });
  const contestDate = new Date(unixSeconds * 1000).toLocaleDateString("en-IN", {
    timeZone: "Asia/Kolkata",
  });
  return istNow === contestDate;
}
// function contestToISO(startTimeSeconds, durationSeconds) {
//   const start = new Date(startTimeSeconds * 1000); // convert sec → ms
//   const end = new Date((startTimeSeconds + durationSeconds) * 1000);

//   // helper to format with +05:30
//   const formatIST = (date) => {
//     const pad = (n) => String(n).padStart(2, "0");

//     const yyyy = date.getFullYear();
//     const mm = pad(date.getMonth() + 1);
//     const dd = pad(date.getDate());
//     const HH = pad(date.getHours());
//     const MM = pad(date.getMinutes());
//     const SS = pad(date.getSeconds());

//     return `${yyyy}-${mm}-${dd}T${HH}:${MM}:${SS}+05:30`;
//   };

//   return {
//     start: formatIST(start),
//     end: formatIST(end),
//   };
// }
function contestToISO(startTimeSeconds, durationSeconds) {
  const start = new Date(startTimeSeconds * 1000).toISOString(); // UTC
  const end = new Date(
    (startTimeSeconds + durationSeconds) * 1000
  ).toISOString();
  return { start, end };
}

export const runCodeforcesNotifier = async (req, res) => {
  try {
    const contest = await getUpcomingCodeforcesContest();
    if (!contest || !isTodayIST(contest.startTimeSeconds)) {
      console.log("No Codeforces contest today");
      return res.status(200).json({
        success: true,
        message: "no contest today",
      });
    }
    // console.log(contest)
    const prefs = await Preferences.find({ codeforces: true })
      .populate("user", "email")
      .exec();
    const emailList = prefs.map((p) => p.user?.email).filter(Boolean);
    const { name, startTimeSeconds, durationSeconds, id } = contest;
    const hours = Math.floor(durationSeconds / 3600);
    const minutes = Math.floor((durationSeconds % 3600) / 60);
    const link = `https://codeforces.com/contests/${id}`;
    const { start, end } = contestToISO(startTimeSeconds, durationSeconds);
    addContestEvent(
      "codeforces",
      name,
      `duration : ${hours} hr ${minutes} mins`,
      link,
      start,
      end
    );
    for (const email of emailList) {
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
