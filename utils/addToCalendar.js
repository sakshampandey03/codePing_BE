
import {google} from 'googleapis';
import dotenv from 'dotenv'
import crypto from 'crypto'

// const path = require('path');

dotenv.config({path : '../.env'});



// Parse the service account JSON from env
// console.log(process.env.GCAL_SERVICE_ACCOUNT_JSON_BASE64);

const base64 = process.env.GCAL_SERVICE_ACCOUNT_JSON_BASE64

// console.log(base64)
const json = Buffer.from(base64, 'base64').toString('utf8');
const credentials = JSON.parse(json);
// console.log(credentials)
const CALENDAR_ID = {
    'codechef' : "d82b3450c8db8365f571aaad11581322f8d2829d6847daf7c372f9c10d1e0636@group.calendar.google.com",
    'codeforces' : "cf7707831730082fbe94086929a310053dd2fd7ff74e8425c73d1b6baf842d05@group.calendar.google.com",
    'leetcode' : "34e4ad605647a2a4f9a07ecb5cebca3c4cbfb5fa74f3fbb1976970cf86bd6213@group.calendar.google.com"
}
const DEFAULT_TZ = 'Asia/Kolkata';

const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ["https://www.googleapis.com/auth/calendar"],
});

function getCalendarClient() {
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/calendar'], // or '.../calendar.events'
  });
  return google.calendar({ version: 'v3', auth });
}

// function makeEventId(summary, startIso){
//     const base = `${summary}::${startIso}`;
//     const hash = crypto.createHash('sha1').update(base).digest('hex')
//     return `contest-${hash}`
// }


function generateEventId(prefix) {
  return (
    prefix +
    "-" +
    crypto.randomBytes(8).toString("hex").toLowerCase()
  ).replace(/[^a-z0-9-_]/g, "");
}

// usage:




export async function addContestEvent(platform, summary, description = '', url, startISO, endISO) {
  const calendar = getCalendarClient();

  const tz = DEFAULT_TZ;
  if (!summary || !startISO || !endISO) {
    throw new Error('Missing required fields: summary, startISO, endISO');
  }

//    const eventId = generateEventId("contest");
  const body = {
    // id: eventId, // makes the insert idempotent
    summary,
    description: [description, url].filter(Boolean).join('\n'),
    location : "",
    start: { dateTime: startISO, timeZone: tz },
    end: { dateTime: endISO, timeZone: tz },
    // Optional reminders:
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'popup', minutes: 30 },
        { method: 'popup', minutes: 5 },
      ],
    },
  };

  try {
 
    const insertRes = await calendar.events.insert({
      calendarId: CALENDAR_ID[platform.toLowerCase()],
    //   calendarId : "primary",
      requestBody: body,
    });
    console.log(insertRes.data)
    return insertRes.data;

  } catch (err) {

    if (err?.code === 409) {
      const patchRes = await calendar.events.patch({
        calendarId:  CALENDAR_ID[platform.toLowerCase()],
        // calendarId : "primary",
        eventId,
        requestBody: body,
      });
      return patchRes.data;
    }
    throw err;
  }
}


// addContestEvent('leetcode', "LeetCode Weekly Contest 420", "4 problems in 90 mins 🚀", "leetcode.com",  "2025-09-03T11:00:00+05:30", "2025-09-03T12:30:00+05:30");