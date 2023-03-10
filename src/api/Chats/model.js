import mongoose from "mongoose";
import bcrypt from "bcrypt";
import groupModel from "../groups/model.js";
const { Schema, model } = mongoose;

const chatSchema = new Schema(
  {
    type: { type: String, required: true, default: "private" },
    users: [{ type: Schema.Types.ObjectId, ref: "Users", required: true }],
  },
  { timestamps: true }
);

const chatModel = mongoose.model("Chats", chatSchema);
export default chatModel;
