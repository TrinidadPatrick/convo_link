const {Router} = require("express");
const { createUser, verifyOTP, resendOtp, login, getUserProfile, forgotPassword, verifFpyOTP, resetPassword } = require("./Controllers/userController");
const { getPeopleRecommendations, requestFriendship, getFriendships, respondFriendship } = require("./Controllers/FriendshipController");
const router = Router();

// User route
router.post("/createUser", createUser);
router.post("/verifyOtp", verifyOTP);
router.post("/resendOtp", resendOtp);
router.post("/login", login);
router.get("/getUserProfile", getUserProfile);
router.post("/forgotPassword", forgotPassword);
router.post("/verifyFpyOTP", verifFpyOTP);
router.patch("/resetPassword", resetPassword);

// Friendship route
router.get("/getPeopleRecommendations", getPeopleRecommendations);
router.post("/requestFriendship", requestFriendship);
router.get("/getFriendships", getFriendships);
router.post("/respondFriendship", respondFriendship);

module.exports = router;