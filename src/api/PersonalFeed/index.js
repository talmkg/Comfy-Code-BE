import express from "express";
import usersModel from "../users/model.js";
import groupModel from "../groups/model.js";
import { jwtMiddleware } from "../utils/auth/jwt.js";
import q2m from "query-to-mongo";
import postModel from "../posts/model.js";

const feedRouter = express.Router();
feedRouter.get("/:limit", jwtMiddleware, async (req, res, next) => {
  try {
    // const findAllPosts = async () => {
    //   let data = [];
    //   me.follows.forEach(async (id) => {
    //     const cleanID = id.toString();
    //     const findPostsOfMyFollows = async () => {
    //       let foundPost = await postModel.find({
    //         creator: cleanID,
    //       });
    //       console.log(foundPost);
    //       if (foundPost.length !== 0) {
    //         data = [...data, ...foundPost];
    //       } else {
    //         console.log("this user does not have any posts");
    //       }
    //     };
    //     const findMyPosts = async () => {
    //       const myPosts = await postModel.find({
    //         creator: req.user._id,
    //       });
    //       if (data) {
    //         data = [...data, ...myPosts];
    //       } else {
    //         console.log("error");
    //       }
    //     };

    //     await findPostsOfMyFollows();
    //     await findMyPosts();
    //   });
    // };
    // await findAllPosts();
    // res.send(data);
    const myID = { creator: req.user._id.toString() };
    let follows = [myID];
    const findFollowAndAppendMineID = () => {
      const data = req.user.follows.forEach((userid) => {
        follows = [...follows, { creator: userid._id.toString() }];
      });
    };
    findFollowAndAppendMineID();
    const dataOfFollows = await postModel
      .find({
        $or: follows.map((follow_id, i) => {
          return { creator: follow_id.creator };
        }),
      })

      .populate({
        path: "creator",
        model: "Users",
        select: "name surname username pfp bio background badges",
        populate: { path: "badges", model: "Badges", select: "icon title" },
      });

    if (dataOfFollows) {
      const allLatestGroups = await groupModel
        .find()
        .populate({
          path: "leader",
          model: "Users",
          select: "name surname username pfp bio background badges",
          populate: { path: "badges", model: "Badges", select: "icon title" },
        })
        .populate({
          path: "team",
          model: "Users",
          select: "name surname username pfp bio background badges",
        })
        .populate({
          path: "team",
          populate: { path: "badges", model: "Badges", select: "icon title" },
        });
      const dataToSend = dataOfFollows.concat(allLatestGroups);

      const sorted = dataToSend.sort((a, b) => {
        return b.createdAt - a.createdAt;
      });

      dataToSend;
      res.status(202).send(dataToSend.slice(0, req.params.limit));
    } else {
      console.log("error");
    }
  } catch (err) {
    next(err);
  }
});

export default feedRouter;
