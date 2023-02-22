import mongoose from "mongoose";
const { Schema, model } = mongoose;

const notificationsSchema = new Schema(
  {
    type: { type: String, required: true },
    from: {
      type: Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },
    parentUser: {
      type: Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },
    text: { type: String, required: true },
    group: { type: String, required: false }, //if invite
  },

  { timestamps: true }
);
notificationsSchema.methods.toJSON = function () {
  const NotificationDocument = this;
  const notification = NotificationDocument.toObject();
  delete notification.updatedAt;
  delete notification.__v;
  delete notification._id;
  delete notification.parentUser;
  return notification;
};
const notificationsModel = mongoose.model("Notifications", notificationsSchema);
export default notificationsModel;
