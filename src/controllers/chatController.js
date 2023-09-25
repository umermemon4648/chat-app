const Chat = require("../models/Chat/chat");
const SuccessHandler = require("../utils/SuccessHandler");
const ErrorHandler = require("../utils/ErrorHandler");
//register
const createChat = async (req, res) => {
  // #swagger.tags = ['chat']
  try {
    return SuccessHandler("Chat created successfully", 200, res);
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

module.exports = {
  createChat,
};
