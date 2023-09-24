const express = require("express");
const chat = require("../controllers/chatController");
const isAuthenticated = require("../middleware/auth");
const router = express.Router();

//get
// router.route("/logout").get(auth.logout);

module.exports = router;
