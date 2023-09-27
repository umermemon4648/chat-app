const Chat = require("../models/Chat/chat");
const User = require("../models/User/user");
const Message = require("../models/Chat/message");
const mongoose = require("mongoose");
const SuccessHandler = require("../utils/SuccessHandler");
const ErrorHandler = require("../utils/ErrorHandler");

const sendMessage = async (req, res) => {
  // #swagger.tags = ['message']
  try {
    const currentUser = req.user._id;
    const { message } = req.body;
    const { chatId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(chatId)) {
      return ErrorHandler("Invalid chatId", 400, req, res);
    }
    let newMessage = {
      chat: chatId,
      content: message,
      sender: currentUser,
    };
    let createmessage = await Message.create(newMessage);
    createmessage = await createmessage.populate({
      path: "sender",
      select: "name email profilePic",
    });
    createmessage = await createmessage.populate({
      path: "chat",
      // select: "name email profilePic",
    });
    createmessage = await User.populate(createmessage, {
      path: "chat.participants",
      select: "name email profilePic",
    });
    await Chat.findByIdAndUpdate(chatId, {
      $set: { latestMessage: createmessage },
    });
    return SuccessHandler(
      { message: "Chat created successfully", createmessage },
      200,
      res
    );
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};
const fetchAllMessages = async (req, res) => {
  // #swagger.tags = ['message']
  try {
    const currentUser = req.user._id;
    const { chatId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(chatId)) {
      return ErrorHandler("Invalid chatId", 400, req, res);
    }

    const allMessages = await Message.find({ chat: chatId })
      .populate({
        path: "sender",
        select: "name email profilePic",
      })
      .populate({
        path: "chat",
        // select: "name email profilePic",
      });

    return SuccessHandler(
      { message: "Messages fetched successfully", allMessages },
      200,
      res
    );
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

module.exports = {
  sendMessage,
  fetchAllMessages,
};
