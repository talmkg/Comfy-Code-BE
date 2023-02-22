import express from "express";
import usersModel from "./model.js";
import createHttpError from "http-errors";
import Groups from "../groups/model.js";
import q2m from "query-to-mongo";

import { jwtMiddleware } from "../utils/auth/jwt.js";
import notificationsModel from "./notifications/model.js";
const usersRouter = express.Router();

// GET
usersRouter.get("/", async (req, res, next) => {
  try {
    const mongoQuery = q2m(req.query);
    const total = await usersModel.countDocuments(mongoQuery.criteria);
    const users = await usersModel
      .find(mongoQuery.criteria, mongoQuery.options.fields)
      .sort({ createdAt: -1 })
      .skip(mongoQuery.options.skip)
      .limit(mongoQuery.options.limit);

    res.status(200).send({
      links: mongoQuery.links(total),
      total,
      totalPages: Math.ceil(total / mongoQuery.options.limit),
      users,
    });
  } catch (error) {
    next(error);
  }
});
//LOGIN
usersRouter.get("/login", async (req, res, next) => {
  try {
    const user = await usersModel.find({
      username: req.query.username,
      password: req.query.password,
    });
    if (user.length > 0) {
      res.send(user);
    } else {
      res.sendStatus(404);
    }
  } catch (error) {
    res.sendStatus(404);
    next(error);
  }
});
// GET BY ID
usersRouter.get("/:userId", async (req, res, next) => {
  try {
    const user = await usersModel.findById(req.params.userId);

    if (user) {
      res.send(user);
    } else {
      next(createHttpError(404, `user with id ${req.params.userId} not found`));
    }
  } catch (error) {
    next(error);
  }
});
//GET LOGINNED USER'S GROUPS
usersRouter.get("/profile/groups", jwtMiddleware, async (req, res, next) => {
  try {
    const leaderOf = await Groups.find({
      leader: req.user._id.toString(),
    });
    const memberOf = await Groups.find({
      team: req.user._id.toString(),
    })
      .populate({
        path: "team",
        model: "Users",
        select: "name surname username pfp bio background",
      })
      .populate({
        path: "leader",
        model: "Users",
        select: "name surname username pfp",
      });
    const data = {
      leaderOf: leaderOf,
      memberOf: memberOf,
    };
    res.status(200).send(data);
  } catch (error) {
    next(error);
  }
});
//GET LOGINNED USER'S PROFILE DATA
usersRouter.get("/me/profile", jwtMiddleware, async (req, res, next) => {
  try {
    let me = await usersModel
      .find({ _id: req.user._id.toString() })
      .populate({
        path: "follows",
        model: "Users",
        select: "name surname username pfp bio background",
      })
      .populate({
        path: "followers",
        model: "Users",
        select: "name surname username pfp bio background",
      });

    res.status(200).send(me);
  } catch (error) {
    next(error);
  }
});
//GET SOMEONES GROUPS  -------------------------------------------------- REWORKED
usersRouter.get("/:userId/groups", async (req, res, next) => {
  try {
    const groups = await Groups.find({
      team: req.params.userId,
    })
      .populate({
        path: "team",
        model: "Users",
        select: "name surname username pfp bio background",
      })
      .populate({
        path: "leader",
        model: "Users",
        select: "name surname username pfp",
      });
    res.status(200).send(groups);
  } catch (error) {
    next(error);
  }
});
// PUT
usersRouter.put("/:userId", async (req, res, next) => {
  try {
    const updatedUser = await usersModel.findByIdAndUpdate(
      req.params.userId,
      req.body,
      { new: true, runValidators: true }
    );

    if (updatedUser) {
      res.send(updatedUser);
    } else {
      next(createHttpError(404, `user with id ${req.params.userId} not found`));
    }
  } catch (error) {
    next(error);
  }
});
// DELETE
usersRouter.delete("/:userId", async (req, res, next) => {
  try {
    const deletedUser = await usersModel.findByIdAndDelete(req.params.userId);
    //WORKS
    const deletedNotificationsTwo = await notificationsModel.deleteMany({
      //WORKS
      from: req.params.userId,
    });
    const deletedGroups = await Groups.deleteMany({
      //WORKS
      leader: [req.params.userId],
    });
    //now we have to delete our id from user's follows/followers
    //
    //
    //
    if (deletedNotificationsTwo || deletedGroups || deletedUser) {
      res.status(204).send();
    } else {
      next(createHttpError(404, `user with id ${req.params.userId} not found`));
    }
  } catch (error) {
    next(error);
  }
});
// ------ FOLLOWERS ------
//FOLLOW SOMEONE --- DONE ✔️                changes follows of main user and followers of the user we followed
usersRouter.put("/follow/:userId", jwtMiddleware, async (req, res, next) => {
  try {
    let userToFollow = await usersModel.findById(req.params.userId);
    let mainUsersFollows = req.user.follows;

    if (userToFollow._id.toString() === req.user._id.toString()) {
      res.status(400).send("You can't follow yourself.");
    } else {
      if (mainUsersFollows.includes(userToFollow._id)) {
        res.status(400).send("You are already following this user.");
        console.log("DUPLICATE");
      } else {
        mainUsersFollows = mainUsersFollows.concat(userToFollow._id);
        const data = {
          follows: mainUsersFollows,
        };
        //-------------------------
        const dataofAnotherUser = {
          followers: userToFollow.followers.concat(req.user._id),
        };
        const updatedFollowersOfAnotherUser =
          await usersModel.findByIdAndUpdate(
            userToFollow._id,
            dataofAnotherUser,
            {
              new: true,
              runValidators: true,
            }
          );
        console.log(
          "Followers of another user changed:",
          updatedFollowersOfAnotherUser
        );
        //-------------------------
        const updatedFollows = await usersModel.findByIdAndUpdate(
          req.user._id,
          data,
          { new: true, runValidators: true }
        );

        if (updatedFollows) {
          const newNotification = new notificationsModel({
            type: "follow",
            text: `${req.user.name} followed you!`,
            from: req.user._id,
            parentUser: req.params.userId,
          });
          const { _id } = await newNotification.save();
          res.send(updatedFollows);
        } else {
          next(
            createHttpError(
              404,
              `group with id ${req.params.groupId} not found`
            )
          );
        }
      }
    }
  } catch (error) {
    next(error);
  }
});
//UNFOLLOW SOMEONE --- DONE ✔️              deletes one of our follows and one of followers of the user we were following
usersRouter.put("/unfollow/:userId", jwtMiddleware, async (req, res, next) => {
  try {
    let userToUnfollow = await usersModel.findById(req.params.userId); //✔️
    let mainUser = req.user;
    if (mainUser.follows.includes(userToUnfollow._id)) {
      function everythingButUser(value) {
        return value.toString() !== userToUnfollow._id.toString();
      }
      const follows = mainUser.follows.filter(everythingButUser);
      const data = {
        follows: follows,
      };
      //---------------------------------
      function everythingButMainUser(value) {
        return value.toString() !== mainUser._id.toString();
      }
      const dataofAnotherUser = {
        followers: userToUnfollow.followers.filter(everythingButMainUser),
      };
      const updatedFollowersOfAnotherUser = await usersModel.findByIdAndUpdate(
        userToUnfollow._id,
        dataofAnotherUser,
        { new: true, runValidators: true }
      );
      //---------------------------------
      const updatedFollowsOfMainUser = await usersModel.findByIdAndUpdate(
        req.user._id,
        data,
        { new: true, runValidators: true }
      );
      if (updatedFollowsOfMainUser) {
        const newNotification = new notificationsModel({
          type: "unfollow",
          text: `${req.user.name} unfollowed you`,
          from: req.user._id,
          parentUser: req.params.userId,
        });
        const { _id } = await newNotification.save();
        res.send(updatedFollowsOfMainUser);
      } else {
        next(
          createHttpError(404, `group with id ${req.params.groupId} not found`)
        );
      }
    } else {
      res.status(400).send("You are not member of this group.");
    }
  } catch (error) {
    next(error);
  }
});
export default usersRouter;
