import mongoose from "mongoose";
import bcrypt from "bcrypt";
import groupModel from "../groups/model.js";
const { Schema, model } = mongoose;

const userSchema = new Schema(
  {
    name: { type: String, required: true },
    surname: { type: String, required: true },
    username: { type: String, required: true },
    password: { type: String, required: true },
    email: { type: String, required: true },
    location: { type: String, required: false },
    birthday: { type: String, required: false },
    pfp: {
      type: String,
      required: false,
      default:
        "https://res.cloudinary.com/dp3i1dce4/image/upload/v1674603395/blank-profile-picture-973460-2_mz4hn1.png",
    },
    background: {
      type: String,
      required: false,
      default:
        "https://res.cloudinary.com/dp3i1dce4/image/upload/v1675632413/ComfyCode/b3bcdc03f02ccce591232011481580f1_furhkz.jpg",
    },
    bio: { type: String, required: false, default: "" },
    follows: [
      {
        type: Schema.Types.ObjectId,
        ref: "Users",
        required: false,
      },
    ], //who am i following
    followers: [{ type: Schema.Types.ObjectId, ref: "Users", required: false }], //who follows me
  },

  { timestamps: true }
);

userSchema.pre("save", async function (done) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 12);
  }
  done();
});

userSchema.pre("deleteOne", function (next) {
  const userId = this.getQuery()["_id"];
  mongoose
    .model("Notifications")
    .deleteMany({ from: userId }, function (err, result) {
      if (err) {
        console.log(`[error] ${err}`);
        next(err);
      } else {
        console.log("success");
        next();
      }
    });
  mongoose
    .model("Groups")
    .deleteMany({ leader: [{ userId }] }, function (err, result) {
      if (err) {
        console.log(`[error] ${err}`);
        next(err);
      } else {
        console.log("success");
        next();
      }
    });
});

userSchema.methods.toJSON = function () {
  const userDocument = this;
  const user = userDocument.toObject();
  delete user.password;
  delete user.updatedAt;
  delete user.__v;
  return user;
};

userSchema.statics.findByCredentials = async function (email, password) {
  const user = await usersModel.findOne({ email });
  console.log(user);
  try {
    if (await bcrypt.compare(password, user.password)) return user;
  } catch {
    console.log("catch");
  }

  return null;
};
userSchema.statics.findAdditionalInfo = async function (user_id) {
  const groups = await groupModel.find({ leader: user_id });
  console.log(groups);
  if (groups) {
    return groups;
  }
};

// export default model("Users", userSchema);
const usersModel = mongoose.model("Users", userSchema);
export default usersModel;
