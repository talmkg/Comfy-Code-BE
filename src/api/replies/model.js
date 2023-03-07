import mongoose from "mongoose";
const { Schema, model } = mongoose;

const replieschema = new Schema(
  {
    type: { type: String, required: true, default: "Reply" },
    post: [{ type: Schema.Types.ObjectId, ref: "Posts", required: false }],
    creator: { type: String, required: true },
    replier: { type: String, required: true },
    text: { type: String, required: true },
    images: [{ type: String, required: false }],
  },
  { timestamps: true }
);

const repliesModel = mongoose.model("Replies", replieschema);
export default repliesModel;
