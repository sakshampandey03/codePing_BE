import express from 'express'
import dotenv from 'dotenv'
import { dbconnect } from './db_config.js'
import CookieParser from 'cookieparser'
import cors from 'cors'
import {updateData, getData, addData, runLeetcodeNotifier, runCodechefNotifier, runCodeforcesNotifier, checkUserExists} from './controllers.js'

dotenv.config()
dbconnect()
const PORT = 3000
const app = express()
app.use(express.json())
// app.use(CookieParser());
app.use(cors({
    origin: "http://localhost:3000",
    credentials: true,
}))
app.post("/add_data", addData)
app.post("/update_data", updateData)
app.get("/get_data", getData)
app.get("/verify_user", checkUserExists)

app.get("/leetcode", runLeetcodeNotifier);
app.get("/codechef", runCodechefNotifier);
app.get("/codeforces", runCodeforcesNotifier);


app.get("/", (req, res) =>{
    return res.json({
        sucsess : true,
        message : "your server is up and running",
    })
})
app.listen(PORT, ()=>{
    console.log("your server is running at port ", PORT)
})
