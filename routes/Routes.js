import express from "express";
import { getUser, login, logout } from "../controllers/auth.js";
import {
  updatePreferences,
  getPreferences,
  runLeetcodeNotifierPOTD,
  runCodechefNotifier,
  runCodeforcesNotifier,
  checkUserExists,
  submitFeedback,
  getHandles,
  updateHandles,
  getUserByEmail,
  runLeetcodeNotifier
} from "../controllers/index.js";
import { getStats, updateStats } from "../controllers/stats.js";


import { updateCohort } from "../controllers/cohortControllers.js";

const router = express.Router();

router.post("/login", login);
router.post("/logout", logout);
router.get("/get_user", getUser);

router.get("/getuserbymail", getUserByEmail);

router.post("/update_data", updatePreferences);
router.get("/get_data", getPreferences);
router.post("/verify_user", checkUserExists);
router.get("/gethandles", getHandles)
router.post("/updatehandles", updateHandles);

router.get("/leetcodepotd", runLeetcodeNotifierPOTD);
router.get("/codechef", runCodechefNotifier);
router.get("/codeforces", runCodeforcesNotifier);
router.get("/leetcode", runLeetcodeNotifier);

router.post("/feedback", submitFeedback);

router.get("/stats", getStats);
router.post("/update_stats", updateStats);


router.get("/update/:label", updateCohort);

export { router };
