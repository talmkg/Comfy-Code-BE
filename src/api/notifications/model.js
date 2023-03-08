import mongoose from "mongoose";
import bcrypt from "bcrypt";
import groupModel from "../groups/model.js";
const { Schema, model } = mongoose;

const notificationsSchema = new Schema(
  {
    type: { type: String, required: true },
    to: {
      type: Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },
    from: {
      type: Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },
    text: { type: String, required: true },
    groupID: { type: String, required: false },
  },

  { timestamps: true }
);

// export default model("Users", userSchema);
const notificationsModel = mongoose.model("notifications", notificationsSchema);
export default notificationsModel;
