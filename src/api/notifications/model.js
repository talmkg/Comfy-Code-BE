import mongoose from "mongoose";
import bcrypt from "bcrypt";
import groupModel from "../groups/model.js";
const { Schema, model } = mongoose;

const notificationsSchema = new Schema(
  {
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
  },

  { timestamps: true }
);

// userSchema.pre("deleteOne", function (next) {
//   const userId = this.getQuery()["_id"];
//   mongoose
//     .model("Notifications")
//     .deleteMany({ from: userId }, function (err, result) {
//       if (err) {
//         console.log(`[error] ${err}`);
//         next(err);
//       } else {
//         console.log("success");
//         next();
//       }
//     });
//   mongoose
//     .model("Groups")
//     .deleteMany({ leader: [{ userId }] }, function (err, result) {
//       if (err) {
//         console.log(`[error] ${err}`);
//         next(err);
//       } else {
//         console.log("success");
//         next();
//       }
//     });
// });

// export default model("Users", userSchema);
const notificationsModel = mongoose.model("notifications", notificationsSchema);
export default notificationsModel;
