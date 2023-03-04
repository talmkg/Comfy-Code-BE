import mongoose from "mongoose";
const { Schema, model } = mongoose;

const badgesSchema = new Schema({
  identifier: { type: String, required: true },
  icon: { type: String, required: true },
  title: { type: String, required: true },
});

const badgesModel = mongoose.model("Badges", badgesSchema);
export default badgesModel;
