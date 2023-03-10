import mongoose from "mongoose";
const { Schema, model } = mongoose;

const directMessagesSchema = new Schema(
  {
    chat: {
      type: Schema.Types.ObjectId,
      ref: "Chats",
      required: true,
    },
    from: {
      type: Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },
    text: { type: String, required: true },
    to: {
      type: Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },
  },

  { timestamps: true }
);

// export default model("Users", userSchema);
const directMessagesModel = mongoose.model(
  "directMessages",
  directMessagesSchema
);
export default directMessagesModel;
