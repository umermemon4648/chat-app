const express = require("express");
const chat = require("../controllers/chatController");
const isAuthenticated = require("../middleware/auth");
const router = express.Router();

//post
router.route("/create/:userId").post(isAuthenticated, chat.createChat);
router.route("/createGroup").post(isAuthenticated, chat.createGroupChat);
//get
router.route("/fetch").get(isAuthenticated, chat.fetchChats);
//put
router
  .route("/addMembers/:chatId")
  .put(isAuthenticated, chat.addMemberToGroupChat);
router
  .route("/removeMembers/:chatId")
  .put(isAuthenticated, chat.removeMemberFromGroupChat);
router.route("/renameGroup/:chatId").put(isAuthenticated, chat.renameGroupChat);

module.exports = router;
