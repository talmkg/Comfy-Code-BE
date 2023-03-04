import express from "express";
import createHttpError from "http-errors";
import postsModel from "./model.js";
import usersModel from "../users/model.js";
import { jwtMiddleware } from "../utils/auth/jwt.js";

const postsRouter = express.Router();

postsRouter.get("/:userid", async (req, res, next) => {
  try {
    const posts = await postsModel.find({
      to: req.params.userid,
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
//will work for now
postsRouter.post("/:userid", async (req, res, next) => {
  try {
    const newPost = new postsModel(req.body);
    const { _id } = await newPost.save();
    res.status(201).send({ _id });
  } catch (err) {
    next(err);
  }
});

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
