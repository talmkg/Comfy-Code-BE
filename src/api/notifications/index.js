import express from "express";
import createHttpError from "http-errors";
import notificationsModel from "./model.js";
import usersModel from "../users/model.js";
import { jwtMiddleware } from "../utils/auth/jwt.js";

const notificationsRouter = express.Router();
notificationsRouter.get("/me", jwtMiddleware, async (req, res, next) => {
  try {
    const notifications = await notificationsModel
      .find({
        to: req.user._id,
      })
      .populate({
        path: "from",
        model: "Users",
        select: "name surname username pfp bio background",
      })
      .populate({
        path: "to",
        model: "Users",
        select: "name surname username pfp bio background",
      });
    if (notifications) {
      res.send(notifications);
    } else {
      res.send("This user don't have any notifications yet.");
    }
  } catch (err) {
    next(err);
  }
});

notificationsRouter.get("/:userid", async (req, res, next) => {
  try {
    const notifications = await notificationsModel.find({
      to: req.params.userid,
    });

    if (notifications) {
      res.send(notifications);
    } else {
      res.send("This user don't have any notifications yet.");
    }
  } catch (err) {
    next(err);
  }
});

//done
notificationsRouter.post("/:userid", async (req, res, next) => {
  try {
    const newNotification = new notificationsModel({
      ...req.body,
      to: req.params.userid,
    });
    const { _id } = await newNotification.save();

    res.status(201).send({ _id });
  } catch (err) {
    next(err);
  }
});

notificationsRouter.delete("/:notificationid", async (req, res, next) => {
  try {
    const deletednotification = await notificationsModel.findByIdAndDelete(
      req.params.notificationid
    );
    if (deletednotification) {
      res.status(204).send();
    } else {
      next(
        createHttpError(
          404,
          `notification with id ${req.params.notificationid} not found.`
        )
      );
    }
  } catch (err) {
    next(err);
  }
});

export default notificationsRouter;
