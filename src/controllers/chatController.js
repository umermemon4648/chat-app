const Chat = require("../models/Chat/chat");
const User = require("../models/User/user");
const mongoose = require("mongoose");
const SuccessHandler = require("../utils/SuccessHandler");
const ErrorHandler = require("../utils/ErrorHandler");
//register
const createChat = async (req, res) => {
  // #swagger.tags = ['chat']
  try {
    const currentUser = req.user._id;
    // const { userId } = req.body;
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return ErrorHandler("Invalid userId", 500, req, res);
    }
    // console.log(mongoose.Types.ObjectId.isValid(userId));
    // const userId = mongoose.Types.ObjectId(req.body.userId);
    // console.log(senderId);s
    // console.log(mongoose.Types.ObjectId.isValid(userId));
    let isChatExist = await Chat.find({
      isGroupChat: false,
      $and: [
        { participants: { $elemMatch: { $eq: currentUser } } },
        { participants: { $elemMatch: { $eq: userId } } },
      ],
    })
      .populate("participants")
      .populate("latestMessage");

    console.log(isChatExist);
    isChatExist = await User.populate(isChatExist, {
      path: "latestMessage.sender",
      select: "name profilePic email",
    });
    if (isChatExist.length > 0) {
      res.send(isChatExist[0]);
    } else {
      // let chatData = {
      //   chatName: "sender",
      //   isGroupChat: false,
      //   participants: [currentUser, userId],
      // };
      const createChat = await Chat.create({
        chatName: "sender",
        isGroupChat: false,
        participants: [currentUser, userId],
      });
      const chat = await Chat.findOne({ _id: createChat._id })
        .populate("participants")
        .populate("latestMessage");
      return SuccessHandler(
        { message: "Chat created successfully", chat },
        200,
        res
      );
    }
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

module.exports = {
  createChat,
};
