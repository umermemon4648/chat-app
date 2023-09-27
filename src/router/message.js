const express = require("express");
const message = require("../controllers/messageController");
const isAuthenticated = require("../middleware/auth");
const router = express.Router();

//post
router.route("/send/:chatId").post(isAuthenticated, message.sendMessage);
//get
router.route("/all/:chatId").get(isAuthenticated, message.fetchAllMessages);

module.exports = router;
