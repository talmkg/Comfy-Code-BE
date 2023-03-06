import mongoose from "mongoose";
import bcrypt from "bcrypt";
import groupModel from "../groups/model.js";
const { Schema, model } = mongoose;

const postSchema = new Schema(
  {
    type: { type: String, required: true, default: "Post" },
    creator: { type: String, required: true },
    text: { type: String, required: true },
    images: [{ type: String, required: false }],
  },
  { timestamps: true }
);

const postModel = mongoose.model("Posts", postSchema);
export default postModel;
