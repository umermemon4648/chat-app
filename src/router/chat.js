const express = require("express");
const chat = require("../controllers/chatController");
const isAuthenticated = require("../middleware/auth");
const router = express.Router();

//post
router.route("/create/:userId").post(isAuthenticated, chat.createChat);

module.exports = router;
