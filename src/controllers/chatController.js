const Chat = require("../models/Chat/chat");
const User = require("../models/User/user");
const Message = require("../models/Chat/message");
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
      return ErrorHandler("Invalid userId", 400, req, res);
    }
    // console.log(mongoose.Types.ObjectId.isValid(userId));
    // const userId = mongoose.Types.ObjectId(req.body.userId);
    // console.log(senderId);
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
const fetchChats = async (req, res) => {
  // #swagger.tags = ['chat']
  const currentUser = req.user._id;
  let chat = await Chat.find({
    participants: { $elemMatch: { $eq: currentUser } },
  })
    .populate({
      path: "participants",
      select: "name email profilePic",
    })
    .populate({
      path: "groupAdmin",
      select: "name email profilePic",
    })
    .populate({
      path: "latestMessage",
    })
    .sort({ updatedAt: -1 });
  // chat = await User.populate(isChatExist, {
  //   path: "latestMessage.sender",
  //   select: "name profilePic email",
  // });
  try {
    SuccessHandler({ message: "Feched Chat successfully", chat }, 200, res);
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
module.exports = {
  createChat,
  fetchChats,
  createGroupChat,
  addMemberToGroupChat,
  removeMemberFromGroupChat,
  renameGroupChat,
};
