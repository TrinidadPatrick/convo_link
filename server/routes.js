const { Router } = require("express");
const { createUser, verifyOTP, resendOtp, login, getUserProfile, forgotPassword, verifFpyOTP, resetPassword, logout, updateAddress, changeEmail, verifyChangeEmailOTP, changePassword, changeProfileImage, updateBio, updateHobbies } = require("./Controllers/userController");
const { getPeopleRecommendations, requestFriendship, getFriendships, respondFriendship, getPeopleRecommendations_v2, getFriendRequests, getFriends } = require("./Controllers/FriendshipController");
const { getConversations, sendMessage, getConversationList, readConversation } = require("./Controllers/ConversationController");
const { keepAlive } = require("./Controllers/KeepAliveController");
const router = Router();

router.get("/keepAlive", keepAlive)

// User route
router.post("/createUser", createUser);
router.post("/verifyOtp", verifyOTP);
router.post("/resendOtp", resendOtp);
router.post("/login", login);
router.get("/getUserProfile", getUserProfile);
router.post("/forgotPassword", forgotPassword);
router.post("/verifyFpyOTP", verifFpyOTP);
router.patch("/resetPassword", resetPassword);
router.post("/logout", logout);
router.patch("/updateAddress", updateAddress)
router.patch("/changeEmail", changeEmail)
router.patch("/verifyChangeEmailOTP", verifyChangeEmailOTP)
router.patch("/changePassword", changePassword)
router.patch("/changeProfileImage", changeProfileImage)
router.patch("/updateBio", updateBio)
router.patch("/updateHobbies", updateHobbies)


// Friendship route
router.get("/getPeopleRecommendations", getPeopleRecommendations);
router.get("/getPeopleRecommendations_v2", getPeopleRecommendations_v2);
router.get("/getFriendRequests", getFriendRequests);
router.get("/getFriends", getFriends);
router.post("/requestFriendship", requestFriendship);
router.get("/getFriendships", getFriendships);
router.post("/respondFriendship", respondFriendship);

// Conversation Route
router.get("/getConversations", getConversations);
router.post("/sendMessage", sendMessage);
router.get("/getConversationList", getConversationList);
router.patch("/readConversation", readConversation);

module.exports = router;