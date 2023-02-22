import express from "express";
import createHttpError from "http-errors";
import usersModel from "../model.js";
import notificationsModel from "./model.js";
import q2m from "query-to-mongo";
import { jwtMiddleware } from "../../utils/auth/jwt.js";

const notificationsRouter = express.Router();

//notifications of a user who is doing a get request ( CHECKED VIA TOKEN )
notificationsRouter.get("/", jwtMiddleware, async (req, res, next) => {
  try {
    const mongoQuery = q2m(req.query);
    const total = await notificationsModel.countDocuments(mongoQuery.criteria);
    const notifications = await notificationsModel
      .find(
        {
          parentUser: req.user._id,
        },
        mongoQuery.criteria,
        mongoQuery.options.fields
      )
      .populate({
        path: "from",
        model: "Users",
        select: "username pfp name surname _id",
      })
      .sort({ createdAt: -1 })
      .skip(mongoQuery.options.skip)
      .limit(10);
    if (notifications) {
      res.status(200).send({
        notifications,
      });
    } else {
      res.send("No notifications for this user.");
    }
  } catch (err) {
    next(err);
  }
});
//posting a notification to a user (requires users id) (IDENTIFIES YOU VIA TOKEN)
notificationsRouter.post("/:userid", jwtMiddleware, async (req, res, next) => {
  try {
    const newNotification = new notificationsModel({
      ...req.body,
      from: req.user._id,
      parentUser: req.params.userid,
    });
    const { _id } = await newNotification.save();
    res.status(201).send({ _id });
  } catch (err) {
    next(err);
  }
});

export default notificationsRouter;
