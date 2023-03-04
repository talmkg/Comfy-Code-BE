import mongoose from "mongoose";
import bcrypt from "bcrypt";
import groupModel from "../groups/model.js";
const { Schema, model } = mongoose;

const postSchema = new Schema(
  {
    text: { type: String, required: true },
    image: { type: String, required: false },
  },
  { timestamps: true }
);

const postModel = mongoose.model("Posts", postSchema);
export default postModel;
