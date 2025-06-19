import express from 'express'
import dotenv from 'dotenv'
import { dbconnect } from './db_config.js'
import CookieParser from 'cookie-parser'
import cors from 'cors'
import { router } from './routes/Routes.js'




dotenv.config()
dbconnect()
const PORT = 3000
const app = express()

app.use(CookieParser());
app.use(cors({
    origin: "https://codeping-v1.vercel.app",
    credentials: true,
}))

app.use(express.json())

app.use("/api/v1", router)


app.get("/", (req, res) =>{
    return res.json({
        sucsess : true,
        message : "your server is up and running",
    })
})
app.listen(PORT, ()=>{
    console.log("your server is running at port ", PORT)
})
