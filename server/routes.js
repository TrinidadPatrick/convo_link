const {Router} = require("express");
const { createUser, verifyOTP, resendOtp, login, getUserProfile, forgotPassword, verifFpyOTP, resetPassword, logout } = require("./Controllers/userController");
const { getPeopleRecommendations, requestFriendship, getFriendships, respondFriendship, getPeopleRecommendations_v2, getFriendRequests, getFriends } = require("./Controllers/FriendshipController");
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
router.get("/logout", logout);

// Friendship route
router.get("/getPeopleRecommendations", getPeopleRecommendations);
router.get("/getPeopleRecommendations_v2", getPeopleRecommendations_v2);
router.get("/getFriendRequests", getFriendRequests);
router.get("/getFriends", getFriends);
router.post("/requestFriendship", requestFriendship);
router.get("/getFriendships", getFriendships);
router.post("/respondFriendship", respondFriendship);

module.exports = router;