const router = require("express").Router();
const auth = require("./auth");
const chat = require("./chat");
const message = require("./message");

router.use("/auth", auth);
router.use("/chat", chat);
router.use("/message", message);

module.exports = router;
