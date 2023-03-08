import express from "express";
import createHttpError from "http-errors";
import postsModel from "./model.js";
import usersModel from "../users/model.js";
import { jwtMiddleware } from "../utils/auth/jwt.js";
import {
  cloudinaryUpload,
  cloudinaryUploadPostImages,
} from "../utils/upload.js";
import postModel from "./model.js";
import q2m from "query-to-mongo";
const postsRouter = express.Router();

postsRouter.get("/me", jwtMiddleware, async (req, res, next) => {
  try {
    console.log(req.user._id);
    const posts = await postsModel
      .find({
        creator: req.user._id,
      })
      .sort({ createdAt: -1 })
      .populate({
        path: "creator",
        model: "Users",
        select: "name surname username badges pfp bio background",
      });
    if (posts) {
      res.send(posts);
    } else {
      res.send("This user don't have any posts yet.");
    }
  } catch (err) {
    next(err);
  }
});

postsRouter.get("/:userid", async (req, res, next) => {
  try {
    console.log("postsRouter/:userid");
    const posts = await postsModel
      .find({
        creator: req.params.userid,
      })
      .sort({ createdAt: -1 })
      .populate({
        path: "creator",
        model: "Users",
        select: "name surname username badges pfp bio background",
      });
    if (posts) {
      res.send(posts);
    } else {
      res.send("This user don't have any posts yet.");
    }
  } catch (err) {
    next(err);
  }
});

postsRouter.post(
  "/",

  jwtMiddleware,
  cloudinaryUploadPostImages,
  async (req, res, next) => {
    try {
      const userFromToken = req.user;
      console.log(req.body);
      if (req.body.postImage !== "undefined" || undefined) {
        console.log("uploading image...");
        const newPost = new postModel({
          type: "Post",
          text: req.body.text,
          images: [req?.file?.path],
          creator: userFromToken._id,
        });
        const { _id } = await newPost.save();
        res.status(201).send({ _id });
      } else {
        const newPost = new postsModel({
          text: req.body.text,
          creator: userFromToken._id,
        });
        const { _id } = await newPost.save();
        res.status(201).send({ _id });
      }
    } catch (err) {
      next(err);
    }
  }
);

postsRouter.delete("/:postid", async (req, res, next) => {
  try {
    const deletedpost = await postsModel.findByIdAndDelete(req.params.postid);
    if (deletedpost) {
      res.status(204).send();
    } else {
      next(
        createHttpError(404, `post with id ${req.params.postid} not found.`)
      );
    }
  } catch (err) {
    next(err);
  }
});

export default postsRouter;
