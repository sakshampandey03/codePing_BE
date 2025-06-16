export const lc_potd_mail = (slug, username) => {
    const dt = new Date()
    const date_string = dt.toString()
    const date = date_string.replace(/\s\d{2}:.*/, '');
  return   `<DOCTYPE html>
    <html>
    <body>
    <div style="font-family: 'Segoe UI', sans-serif; background: rgba(255,255,255,0.8); padding: 20px; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); color: #36404A;">
  <h2 style="color: #546373;">🔔 LeetCode Daily Problem Reminder</h2>
  <p>Hi <strong>${username}</strong>,</p>
  <p>Just a friendly reminder to solve today's LeetCode <strong>Problem of the Day</strong>!</p>

  <p style="margin: 12px 0;">
    📅 <strong>Date:</strong> ${date}<br>
    🧠 <strong>Problem:</strong> <a href="https://leetcode.com/problems/${slug}" style="color: #ADCCED;">Click here to solve</a>
  </p>

  <p>Keep your streak alive 💪 and don’t forget to submit before 5:30 AM IST!</p>
  <p style="font-size: 14px; color: #6D8196;">— Team CodePing</p>
</div>
</body></html>`;
};
