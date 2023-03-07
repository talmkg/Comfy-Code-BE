import express from "express";
import createHttpError from "http-errors";
import repliesModel from "./model.js";
import { jwtMiddleware } from "../utils/auth/jwt.js";
import {
  cloudinaryUploadReplyImages,
  cloudinaryUploadreplyImages,
} from "../utils/upload.js";
import replyModel from "./model.js";
import q2m from "query-to-mongo";
const repliesRouter = express.Router();

repliesRouter.get("/:userid", async (req, res, next) => {
  try {
    const replies = await repliesModel
      .find({
        creator: req.params.userid,
      })
      .sort({ createdAt: -1 })
      .populate({
        path: "creator",
        model: "Users",
        select: "name surname username pfp bio background",
      })
      .populate({
        path: "post",
        model: "Posts",
        select: "creator text images",
      });
    if (replies) {
      res.send(replies);
    } else {
      res.send("This user don't have any replies yet.");
    }
  } catch (err) {
    next(err);
  }
});

repliesRouter.post(
  "/",

  jwtMiddleware,
  cloudinaryUploadReplyImages,
  async (req, res, next) => {
    try {
      const postID = req.body.postID;
      console.log(postID);
      const userFromToken = req.user;
      console.log(req.body);
      if (req.body.replyImage !== "undefined" || undefined) {
        const newReply = new replyModel({
          type: "reply",
          // post
          replier: req.user._id,
          text: req.body.text,
          images: [req?.file?.path],
          creator: userFromToken._id,
        });
        const { _id } = await newReply.save();
        res.status(201).send({ _id });
      } else {
        const newReply = new repliesModel({
          // post
          replier: req.user._id,
          text: req.body.text,
          creator: userFromToken._id,
        });
        const { _id } = await newReply.save();
        res.status(201).send({ _id });
      }
    } catch (err) {
      next(err);
    }
  }
);

repliesRouter.delete("/:replyid", async (req, res, next) => {
  try {
    const deletedreply = await repliesModel.findByIdAndDelete(
      req.params.replyid
    );
    if (deletedreply) {
      res.status(204).send();
    } else {
      next(
        createHttpError(404, `reply with id ${req.params.replyid} not found.`)
      );
    }
  } catch (err) {
    next(err);
  }
});

export default repliesRouter;
