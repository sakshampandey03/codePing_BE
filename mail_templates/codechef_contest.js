export const codechef_mail = ({contestName, link, date}) => {

  return `<!DOCTYPE html>
<html>
  <body>
    <div style="font-family: 'Segoe UI', sans-serif; background: rgba(255,255,255,0.9); padding: 20px; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); color: #36404A;">
      <h2 style="color: #546373;">🚀 Upcoming CodeChef Contest</h2>

      <p>Don't miss the upcoming <strong>${contestName}</strong> contest!</p>

      <p style="margin: 12px 0;">
        🗓️ <strong>Date:</strong> ${date}<br>
        ⏰ <strong>Time:</strong> 08:00 PM<br>
        🔗 <strong>Link:</strong> <a href="${link}" style="color: #ADCCED;">View Contest</a>
      </p>

      <p>Get ready to code and climb the leaderboard! 🏆</p>
      <p style="font-size: 14px; color: #6D8196;">— Team CodePing</p>
    </div>
  </body>
</html>`;
};

