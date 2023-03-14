import mongoose from "mongoose";

const { Schema, model } = mongoose;

const groupsSchema = new Schema(
  {
    type: { type: String, required: true, default: "Group" },
    title: { type: String, required: true },
    description: { type: String, required: true },
    leader: [{ type: Schema.Types.ObjectId, ref: "Users", required: true }],
    team: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: "Users",
          required: true,
        },
      ],
    },
    hashtags: [{ type: Object, required: false }],
    imageUrl: { type: String, required: false },
    language: { type: String, required: false },
    githubRepoLink: { type: String, required: false },
    privacySetting: {
      type: String,
      enum: ["public", "private"],
      required: true,
    },
    teamSize: { type: Number, required: true },
    invitedUsers: [
      {
        type: Schema.Types.ObjectId,
        ref: "Users",
        required: false,
        default: [],
      },
    ],
  },

  {
    timestamps: true,
  }
);

const groupModel = mongoose.model("Groups", groupsSchema);
export default groupModel;
