import mongoose from "mongoose";

const { Schema, model } = mongoose;

const messagesSchema = new Schema({
  sender: { type: String, required: true },
  text: { type: String, required: true },
  createdAt: { type: String, required: false },
});

export default model("Messages", messagesSchema);
