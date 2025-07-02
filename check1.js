const runCodechefNotifier = async (req, res) => {
  try {
    // check if today is wednesday
    const now = new Date();
const istNow = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
const day = istNow.getDay();

    console.log("today is ", day)
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
runCodechefNotifier();