const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const messageSchema = new Schema(
  {
    chat: { type: Schema.Types.ObjectId, ref: "Chat" },
    content: { type: String, require: true, trim: true },
    sender: { type: Schema.Types.ObjectId, ref: "User" },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);
const message = mongoose.model("Message", messageSchema);
module.exports = message;
