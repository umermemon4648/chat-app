const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const chatSchema = new Schema(
  {
    participants: [{ type: Schema.Types.ObjectId, ref: "User", require: true }],
    latestMessage: { type: Schema.Types.ObjectId, ref: "Message" },
    isGroupChat: { type: Boolean, default: false },
    chatName: { type: String, trim: true },
    groupName: { type: String, trim: true },
    groupAdmin: { type: Schema.Types.ObjectId, ref: "User" },
    unseenCount: { type: Number, default: 0 },
    groupIcon: {
      type: String,
      // default:
      //   "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT9KehZ0Xz2eEw6uQZDN7YcxdzRfLNfyDs-Hg&usqp=CAU",
    },
  },
  { timestamps: true }
);
const chat = mongoose.model("Chat", chatSchema);
module.exports = chat;
