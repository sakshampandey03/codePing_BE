export const leetcode_mail = ({ contestName, link, date, time = "08:00 AM" }) => {
  return `<!DOCTYPE html>
<html>
  <body>
    <div style="
      font-family: 'Segoe UI', sans-serif; 
      background: rgba(255,255,255,0.9); 
      padding: 20px; 
      border-radius: 16px; 
      box-shadow: 0 4px 20px rgba(0,0,0,0.1); 
      color: #36404A;
    ">
      <h2 style="color: #546373;">🔥 Upcoming LeetCode Contest</h2>

      <p>Sharpen your skills in <strong>${contestName}</strong>!</p>

      <p style="margin: 12px 0;">
        🗓️ <strong>Date:</strong> ${date}<br>
        ⏰ <strong>Time:</strong> ${time}<br>
        🔗 <strong>Link:</strong> 
        <a href="${link}" style="color: #ADCCED; text-decoration: none;">Join Contest</a>
      </p>

      <p>Warm up your algorithms and get ready to compete with coders worldwide! 🚀</p>
      <p style="font-size: 14px; color: #6D8196;">— Team CodePing</p>
    </div>
  </body>
</html>`;
};
