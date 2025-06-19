import express from 'express'
import { getUser, login, logout } from '../auth.js';
import {updateData, getData, runLeetcodeNotifier, runCodechefNotifier, runCodeforcesNotifier, checkUserExists, submitFeedback } from '../controllers.js'
const router = express.Router();

router.post("/login", login)
router.post("/logout", logout)
router.get('/get_user', getUser)

// router.post("/add_data", addData)
router.post("/update_data", updateData)
router.get("/get_data", getData)
router.post("/verify_user", checkUserExists)

router.get("/leetcode", runLeetcodeNotifier);
router.get("/codechef", runCodechefNotifier);
router.get("/codeforces", runCodeforcesNotifier);

router.post("/feedback", submitFeedback)



export {router}