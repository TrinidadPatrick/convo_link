const {Router} = require("express");
const { testApi } = require("./Controllers/userController");
const router = Router();

router.get("/", testApi);

module.exports = router;