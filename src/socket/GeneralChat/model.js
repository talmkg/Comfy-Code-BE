import mongoose from "mongoose";

const { Schema, model } = mongoose;

const messagesSchema = new Schema(
  {
    username: { type: String, required: true },
    user_id: { type: String, required: true },
    text: { type: String, required: true },
    pfp: { type: String, required: false },
  },
  { timestamps: true }
);

export default model("Messages", messagesSchema);
