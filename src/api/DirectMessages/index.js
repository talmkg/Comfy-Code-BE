import express from "express";
import createHttpError from "http-errors";
import directMessagesModel from "./model.js";
import usersModel from "../users/model.js";
import { jwtMiddleware } from "../utils/auth/jwt.js";

const directMessagesRouter = express.Router();

directMessagesRouter.get("/:chatid", jwtMiddleware, async (req, res, next) => {
  try {
    const directMessages = await directMessagesModel.find({
      chat: req.params.chatid,
    });
    
    if (directMessages) {
      res.send(directMessages);
    } else {
      res.send("This user don't have any directMessages yet.");
    }
  } catch (err) {
    next(err);
  }
});

//done
directMessagesRouter.post("/", jwtMiddleware, async (req, res, next) => {
  try {
    const newdirectMessage = new directMessagesModel({
      ...req.body,
      chat: req.body.chat,
      from: req.user._id,
    });
    const { _id } = await newdirectMessage.save();

    res.status(201).send({ _id });
  } catch (err) {
    next(err);
  }
});

directMessagesRouter.delete("/:directMessageid", async (req, res, next) => {
  try {
    const deleteddirectMessage = await directMessagesModel.findByIdAndDelete(
      req.params.directMessageid
    );
    if (deleteddirectMessage) {
      res.status(204).send();
    } else {
      next(
        createHttpError(
          404,
          `directMessage with id ${req.params.directMessageid} not found.`
        )
      );
    }
  } catch (err) {
    next(err);
  }
});

export default directMessagesRouter;
