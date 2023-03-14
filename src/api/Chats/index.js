import express from "express";
import createHttpError from "http-errors";
import chatModel from "./model.js";
import usersModel from "../users/model.js";
import { jwtMiddleware } from "../utils/auth/jwt.js";

import q2m from "query-to-mongo";
import directMessagesModel from "../DirectMessages/model.js";
const chatsRouter = express.Router();

chatsRouter.get("/me", jwtMiddleware, async (req, res, next) => {
  try {
    const chats = await chatModel
      .find({
        users: req.user._id,
      })
      .sort({ createdAt: -1 })
      .populate({
        path: "users",
        model: "Users",
        select: "name surname pfp badges username",
      });
    if (chats) {
      const updatedData = await Promise.all(
        chats.map((chat) => {
          return new Promise(async (resolve, reject) => {
            directMessagesModel
              .find({
                chat: chat._id,
              })
              .then((messages) => {
                // const data = [chat].concat({ messages: messages });
                const data = { chat, messages };
                resolve(data);
              })
              .catch(reject);
          });
        })
      );
      if (updatedData) {
        res.send(updatedData);
      }
    } else {
      res.send("This user don't have any chats yet.");
    }
  } catch (err) {
    next(err);
  }
});

chatsRouter.get("/:userid", async (req, res, next) => {
  try {
    console.log("chatsRouter/:userid");
    const chats = await chatModel
      .find({
        users: req.params.userid,
      })
      .sort({ createdAt: -1 })
      .populate({
        path: "users",
        model: "Users",
        select: "name surname",
      });
    if (chats) {
      res.send(chats);
    } else {
      res.send("This user don't have any chats yet.");
    }
  } catch (err) {
    next(err);
  }
});

chatsRouter.post("/", jwtMiddleware, async (req, res, next) => {
  try {
    const newchat = new chatModel({
      users: req.body.users,
    });
    const { _id } = await newchat.save();
    res.status(201).send({ _id });
  } catch (err) {
    next(err);
  }
});

chatsRouter.delete("/:chatid", async (req, res, next) => {
  try {
    const deletedchat = await chatModel.findByIdAndDelete(req.params.chatid);
    if (deletedchat) {
      res.status(204).send();
    } else {
      next(
        createHttpError(404, `chat with id ${req.params.chatid} not found.`)
      );
    }
  } catch (err) {
    next(err);
  }
});

export default chatsRouter;
