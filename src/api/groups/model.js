import mongoose from "mongoose";

const { Schema, model } = mongoose;

const groupsSchema = new Schema(
  {
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
      validate: [arrayLimit, "Team exceeds the limit of 5"],
    },
    hashtags: [{ type: Object, required: false }],
    // team: [{ type: Schema.Types.ObjectId, ref: "Users", required: true }],
    //not required
    imageUrl: { type: String, required: false },
  },

  {
    timestamps: true,
  }
);

function arrayLimit(val) {
  return val.length <= 5;
}

export default model("Groups", groupsSchema);
