export const codeforces_mail = ({
  name,
  startTimeSeconds,
  durationSeconds,
  id,
}) => {
  const startTime = new Date(startTimeSeconds * 1000); // Multiply by 1000 to convert to ms

  const formattedStart = startTime.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const hours = Math.floor(durationSeconds / 3600);
  const minutes = Math.floor((durationSeconds % 3600) / 60);

  const formattedDuration = `${hours}h ${minutes}m`;

  const link = `https://codeforces.com/contests/${id}`;
  return `<DOCTYPE html>
    <html>
    <body>
    <div style="font-family: 'Segoe UI', sans-serif; background: rgba(255,255,255,0.9); padding: 20px; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); color: #36404A;">
  <h2 style="color: #546373;">⚔️ Codeforces Contest Reminder</h2>
  <p>Hi <strong>{Coder}</strong>,</p>
  <p>The <strong>${name}</strong> on Codeforces is starting soon!</p>

  <p style="margin: 12px 0;">
    📆 <strong>Start Time :</strong> ${formattedStart}<br>
    🕐 <strong>Duration :</strong> ${formattedDuration}<br>
    🔗 <strong>Contest Link:</strong> <a href="${link}" style="color: #ADCCED;">Join Here</a>
  </p>

  <p>Don’t forget to register if needed. All the best 💯!</p>
  <p style="font-size: 14px; color: #6D8196;">— Team CodePing</p>
</div>


</body></html>`;
};
