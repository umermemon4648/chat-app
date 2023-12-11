const Chat = require("../models/Chat/chat");
const User = require("../models/User/user");
const Message = require("../models/Chat/message");
const mongoose = require("mongoose");
const SuccessHandler = require("../utils/SuccessHandler");
const ErrorHandler = require("../utils/ErrorHandler");

// ? Initiate chat
const createChat = async (req, res) => {
  // #swagger.tags = ['chat']
  try {
    const currentUser = req.user._id;
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return ErrorHandler("Invalid userId", 400, req, res);
    }
    let isChatExist = await Chat.find({
      isGroupChat: false,
      $and: [
        { participants: { $elemMatch: { $eq: currentUser } } },
        { participants: { $elemMatch: { $eq: userId } } },
      ],
    })
      .populate("participants")
      .populate("latestMessage");

    isChatExist = await User.populate(isChatExist, {
      path: "latestMessage.sender",
      select: "name profilePic email",
    });
    if (isChatExist.length > 0) {
      return ErrorHandler(`Chat with this user already exist`, 400, req, res);
    } else {
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

// ?  fetch User chats
const fetchChats = async (req, res) => {
  // #swagger.tags = ['chat']
  try {
    const searchFilter = req.body.search
      ? {
          participants: {
            $or: [
              {
                firstName: { $regex: req.body.search, $options: "i" },
              },
              {
                lastName: { $regex: req.body.search, $options: "i" },
              },
            ],
          },
        }
      : {};
    // _id: { $ne: req.user._id },

    let chats = await Chat.find({
      participants: { $in: req.user._id },
      // ...searchFilter,
    })
      .populate({
        path: "participants",
        select: "firstName lastName email profilePic",
      })
      .populate({
        path: "groupAdmin",
        select: "firstName lastName email profilePic",
      })
      .populate({
        path: "latestMessage",
      })
      .sort({ updatedAt: -1 });
    console.log(chats);
    let userChats = await Promise.all(
      chats.map(async (val) => {
        const unreadMessage = await Message.countDocuments({
          chat: val._id,
          isRead: false,
          sender: { $ne: req.user._id },
        });
        const latestMessage = val.latestMessage
          ? val.latestMessage.toObject()
          : null;

        return {
          ...val.toJSON(),
          latestMessage,
          unReadMessageCount: unreadMessage,
        };
      })
    );
    SuccessHandler(
      { message: "chat fetched successfully", chat: userChats },
      200,
      res
    );
  } catch (error) {
    ErrorHandler(error.message, 500, req, res);
  }
};

const createGroupChat = async (req, res) => {
  // #swagger.tags = ['chat']
  const currentUser = req.user._id;
  const { groupMembers, groupName } = req.body;

  try {
    let members = JSON.parse(groupMembers);
    members.push(currentUser);
    if (members.length < 2) {
      ErrorHandler(
        "More than 2 participants are required to form a group",
        400,
        req,
        res
      );
    }
    const groupChat = await Chat.create({
      isGroupChat: true,
      groupAdmin: currentUser,
      participants: members,
      groupName,
    });
    const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
      .populate({
        path: "participants",
        select: "name email profilePic",
      })
      .populate({
        path: "groupAdmin",
        select: "name email profilePic",
      });
    SuccessHandler({ message: "Group chat created", fullGroupChat }, 200, res);
  } catch (error) {
    ErrorHandler(error.message, 500, req, res);
  }
};
const addMemberToGroupChat = async (req, res) => {
  // #swagger.tags = ['chat']
  try {
    const currentUser = req.user._id;
    const { members } = req.body;
    const { chatId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(chatId)) {
      return ErrorHandler("Invalid chatId", 400, req, res);
    }
    const groupChat = await Chat.findOneAndUpdate(
      {
        _id: chatId,
        groupAdmin: currentUser,
      },
      {
        $push: { participants: members },
      },
      { new: true }
    )
      .populate({
        path: "participants",
        select: "name email profilePic",
      })
      .populate({
        path: "groupAdmin",
        select: "name email profilePic",
      });
    if (!groupChat) {
      ErrorHandler("Group not found or you are not an admin", 400, req, res);
    }
    SuccessHandler(
      { message: "Members added to the group", groupChat },
      200,
      res
    );
  } catch (error) {
    ErrorHandler(error.members, 500, req, res);
  }
};

const removeMemberFromGroupChat = async (req, res) => {
  // #swagger.tags = ['chat']
  try {
    const currentUser = req.user._id;
    const { members } = req.body;
    const { chatId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(chatId)) {
      return ErrorHandler("Invalid chatId", 400, req, res);
    }
    console.log(req.body);
    let isMatch = await Chat.findOne({
      _id: chatId,
      groupAdmin: currentUser,
    });
    console.log(isMatch);
    const groupChat = await Chat.findOneAndUpdate(
      {
        _id: chatId,
        groupAdmin: currentUser,
      },
      {
        $pull: { participants: { $in: members } },
      },
      { new: true }
    )
      .populate({
        path: "participants",
        select: "name email profilePic",
      })
      .populate({
        path: "groupAdmin",
        select: "name email profilePic",
      });
    if (!groupChat) {
      ErrorHandler("Group not found or you are not an admin", 400, req, res);
    }
    SuccessHandler(
      { message: "Members Remove from the group", groupChat },
      200,
      res
    );
  } catch (error) {
    ErrorHandler(error.members, 500, req, res);
  }
};
const renameGroupChat = async (req, res) => {
  // #swagger.tags = ['chat']
  try {
    const currentUser = req.user._id;
    const { groupName } = req.body;
    const { chatId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(chatId)) {
      return ErrorHandler("Invalid chatId", 400, req, res);
    }
    const groupChat = await Chat.findOneAndUpdate(
      {
        _id: chatId,
        groupAdmin: currentUser,
      },
      {
        $set: {
          groupName,
        },
      },
      { new: true }
    )
      .populate({
        path: "participants",
        select: "name email profilePic",
      })
      .populate({
        path: "groupAdmin",
        select: "name email profilePic",
      });
    if (!groupChat) {
      ErrorHandler("Group not found or you are not an admin", 400, req, res);
    }
    SuccessHandler(
      { message: "Group name has been successfully updated.", groupChat },
      200,
      res
    );
  } catch (error) {
    ErrorHandler(error.members, 500, req, res);
  }
};

// message
const sendMessage = async (req, res) => {
  // #swagger.tags = ['chat']
  try {
    const currentUser = req.user._id;
    const { message } = req.body;
    const { chatId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(chatId)) {
      return ErrorHandler("Invalid chatId", 400, req, res);
    }
    let newMessage = await Message.create({
      chat: chatId,
      content: message,
      sender: currentUser,
    });
    newMessage = await newMessage.populate({
      path: "sender",
      select: "name email profilePic",
    });
    newMessage = await newMessage.populate({
      path: "chat",
    });
    newMessage = await User.populate(newMessage, {
      path: "chat.participants",
      select: "name email profilePic",
    });
    await Chat.findByIdAndUpdate(chatId, {
      $set: { latestMessage: newMessage },
    });
    return SuccessHandler(
      { message: "Chat created successfully", message: newMessage },
      200,
      res
    );
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};
const fetchAllMessages = async (req, res) => {
  // #swagger.tags = ['chat']
  try {
    const { chatId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(chatId)) {
      return ErrorHandler("Invalid chatId", 400, req, res);
    }
    const isChatExist = await Chat.find({
      chat: chatId,
      participants: { $in: req.user._id },
    });
    if (!isChatExist) {
      return ErrorHandler("Chat not found", 404, req, res);
    }

    const allMessages = await Message.find({ chat: chatId })
      .populate({
        path: "sender",
        select: "name email profilePic",
      })
      .populate({
        path: "chat",
      });
    const messages = await Promise.all(
      allMessages.map(async (val) => {
        const isSender = val.sender._id.equals(req.user._id);
        const isRead = val.isRead || isSender;
        console.log(isRead);

        if (!isSender) {
          console.log(val._id);
          await Message.findByIdAndUpdate(
            val._id,
            { $set: { isRead: true } },
            { new: true }
          );
        }

        return {
          ...val.toObject(),
          isSender,
        };
      })
    );

    return SuccessHandler(
      { message: "Messages fetched successfully", messages: messages },
      200,
      res
    );
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

module.exports = {
  createChat,
  fetchChats,
  createGroupChat,
  addMemberToGroupChat,
  removeMemberFromGroupChat,
  renameGroupChat,
  sendMessage,
  fetchAllMessages,
};
