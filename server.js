import express from 'express'
import dotenv from 'dotenv'
import { dbconnect } from './db_config.js'
import CookieParser from 'cookie-parser'
import cors from 'cors'
import { router } from './routes/Routes.js'

import { getStats } from './controllers/stats.js'


dotenv.config()
dbconnect()
const PORT = 3000
const app = express()

app.use(CookieParser());

const allowedOrigins = [
  "http://localhost:5173",          // Vite dev
  "http://localhost:3000",          // CRA or React dev
  "https://codeping-v1.vercel.app"  // Production
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // Postman/curl
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error("Not allowed by CORS: " + origin));
  },
  credentials: true,
}));

// ✅ Public stats route (open access)
app.get("/api/v1/stats",
  cors({ origin: "*", credentials: false }),
  getStats
);


app.use(express.json())

app.use("/api/v1", router)


app.get("/", (req, res) =>{
    return res.json({
        sucsess : true,
        message : "your server is up and running",
    })
})
app.get("/ping", (req, res) => {
  console.log("Ping received at", new Date().toISOString());
  res.status(200).send("Pong! Backend is awake.");
});


app.listen(PORT, ()=>{
    console.log("your server is running at port ", PORT)
})
