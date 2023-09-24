const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const chatSchema = new Schema(
  {
    participants: [{ type: Schema.Types.ObjectId, ref: "User", require: true }],
    latestMessage: { type: Schema.Types.ObjectId, ref: "Message" },
    isGroupChat: { type: Boolean, default: false },
    groupName: { type: String, trim: true },
    groupAdmin: { type: Schema.Types.ObjectId, ref: "User" },
    unseenCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);
const chat = mongoose.model("Chat", chatSchema);
module.exports = chat;
