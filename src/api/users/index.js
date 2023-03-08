import express from "express";
import usersModel from "./model.js";
import createHttpError from "http-errors";
import Groups from "../groups/model.js";
import q2m from "query-to-mongo";

import { jwtMiddleware } from "../utils/auth/jwt.js";
import {
  cloudinaryUpload,
  cloudinaryUploadBackground,
  cloudinaryUploadPFP,
} from "../utils/upload.js";
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
      .limit(mongoQuery.options.limit)
      .populate({
        path: "follows",
        model: "Users",
        select: "name surname username",
      })
      .populate({
        path: "followers",
        model: "Users",
        select: "name surname username",
      });

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
    console.log("fetching by id...");
    const user = await usersModel.findById(req.params.userId).populate({
      path: "badges",
      model: "Badges",
      select: "title icon",
    });

    if (user) {
      res.send(user);
    } else {
      next(createHttpError(404, `user with id ${req.params.userId} not found`));
    }
  } catch (error) {
    next(error);
  }
});
//GET LOGINNED USER'S GROUPS  WITHOUT POPULATING
usersRouter.get("/profile/groups/", jwtMiddleware, async (req, res, next) => {
  try {
    const memberOf = await Groups.find({
      team: req.user._id.toString(),
    });
    res.status(200).send(memberOf);
  } catch (error) {
    next(error);
  }
});
//GET LOGINNED USER'S PROFILE DATA
usersRouter.get("/me/profile", jwtMiddleware, async (req, res, next) => {
  try {
    let user = await usersModel
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
      })
      .populate({
        path: "badges",
        model: "Badges",
        select: "icon title",
      });
    res.status(200).send(user);
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
    // const deletedNotificationsTwo = await notificationsModel.deleteMany({
    //   //WORKS
    //   from: req.params.userId,
    // });
    const deletedGroups = await Groups.deleteMany({
      //WORKS
      leader: [req.params.userId],
    });
    //now we have to delete our id from user's follows/followers
    //
    //
    //
    if (deletedUser) {
      res.status(204).send();
    } else {
      next(createHttpError(404, `user with id ${req.params.userId} not found`));
    }
  } catch (error) {
    next(error);
  }
});
// ------ FOLLOWERS ------
//FOLLOW SOMEONE --- DONE ✔️    ---REWORKED 3/6/2023 1. adds a follow in yours model, and a follower in requested model. Of course, before each request it creates a SET to delete all possible duplicates.
usersRouter.put("/follow/:userId", jwtMiddleware, async (req, res, next) => {
  try {
    let userToFollow = await usersModel.findById(req.params.userId);
    let user = await usersModel.findById(req.user._id);
    const followsObjectId = [...user.follows, userToFollow._id];
    const cleanDataFollows = followsObjectId.map((id) => {
      return id.toString();
    });
    const follows = [...new Set(cleanDataFollows)];
    console.log("uniqArray follows:", follows);
    const updatedFollows = await usersModel.findByIdAndUpdate(
      user._id,
      { follows: follows },
      {
        new: true,
        runValidators: true,
      }
    );
    console.log("half done");
    //update them
    const followersObjectId = [...userToFollow.followers, user._id];

    const cleanDataFollowers = followersObjectId.map((id) => {
      return id.toString();
    });
    const followers = [...new Set(cleanDataFollowers)];
    console.log("uniqArray followers :", followers);
    const updatedFollowers = await usersModel.findByIdAndUpdate(
      user._id,
      { followers: followers },
      {
        new: true,
        runValidators: true,
      }
    );

    if (updatedFollows && updatedFollowers) {
      res.status(200).send("You followed them <3");
    }
  } catch (error) {
    next(error);
  }
});
//UNFOLLOW SOMEONE --- DONE ✔️  ---NOT ACTUALLY REWORKED BUT FOUND NO BUGS THERE (MIGHT COME BACK) 3/6/2023
usersRouter.put("/unfollow/:userId", jwtMiddleware, async (req, res, next) => {
  try {
    let userToUnfollow = await usersModel.findById(req.params.userId); //✔️
    let mainUser = await usersModel.findById(req.user._id);
    if (mainUser.follows.includes(userToUnfollow._id)) {
      function everythingButUser(value) {
        return value.toString() !== userToUnfollow._id.toString();
      }
      let follows = mainUser.follows.filter(everythingButUser);
      console.log(follows);
      // follows = [...new Set(follows)];
      const updatedFollowsOfMainUser = await usersModel.findByIdAndUpdate(
        req.user._id,
        { follows: follows }
      );
      //---------------------------------
      function everythingButMainUser(value) {
        return value.toString() !== mainUser._id.toString();
      }
      const dataofAnotherUser = {
        followers: userToUnfollow.followers.filter(everythingButMainUser),
      };
      const updatedFollowersOfAnotherUser = await usersModel.findByIdAndUpdate(
        userToUnfollow._id,
        dataofAnotherUser
      );
      //---------------------------------

      if (updatedFollowsOfMainUser && updatedFollowersOfAnotherUser) {
        res.status(200).send("You unfollowed them <3");
      } else {
        res.status(400).send("error?");
      }
    } else {
      res.status(400).send("You are not following that user.");
    }
  } catch (error) {
    console.log("error");
    next(error);
  }
});
//update pfp
usersRouter.put("/:userId/pfp", cloudinaryUploadPFP, async (req, res, next) => {
  try {
    console.log("uploading image...");
    const updatedUser = await usersModel.findByIdAndUpdate(req.params.userId, {
      ...req.body,
      pfp: req.file.path,
    });

    if (updatedUser) {
      res.status(201).send(updatedUser);
    }
  } catch (err) {
    next(err);
  }
});
usersRouter.put(
  "/background",
  jwtMiddleware,
  cloudinaryUploadBackground,
  async (req, res, next) => {
    try {
      console.log("uploading image...");
      const updatedUser = await usersModel.findByIdAndUpdate(req.user._id, {
        ...req.body,
        pfp: req.file.path,
      });
      console.log(req.file.path);
      if (updatedUser) {
        res.status(201).send(updatedUser);
      }
    } catch (err) {
      next(err);
    }
  }
);
export default usersRouter;
