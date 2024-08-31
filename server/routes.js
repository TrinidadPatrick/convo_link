const {Router} = require("express");
const { createUser, verifyOTP, resendOtp } = require("./Controllers/userController");
const router = Router();

router.post("/createUser", createUser);
router.post("/verifyOtp", verifyOTP);
router.post("/resendOtp", resendOtp);

module.exports = router;