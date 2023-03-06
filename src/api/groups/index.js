import express from "express";
import groupModel from "./model.js";
import createHttpError from "http-errors";
import q2m from "query-to-mongo";
import { cloudinaryUpload, parseFile } from "../utils/upload.js";
import { jwtMiddleware } from "../utils/auth/jwt.js";
import Users from "../users/model.js";
import usersModel from "../users/model.js";

const groupsRouter = express.Router();
// POST
groupsRouter.post("/", jwtMiddleware, async (req, res, next) => {
  try {
    const data = {
      ...req.body,
      leader: [req.user._id],
      team: [req.user._id],
    };
    const newgroup = new groupModel(data);
    const { _id } = await newgroup.save();
    //-------------------------
    //-------------------------
    res.status(201).send({ _id });
  } catch (error) {
    next(error);
  }
});
//cover
groupsRouter.put(
  "/:groupid/cover",
  cloudinaryUpload,
  async (req, res, next) => {
    try {
      console.log("uploading image...");
      const updatedgroup = await groupModel.findByIdAndUpdate(
        req.params.groupid,
        {
          ...req.body,
          imageUrl: req.file.path,
        }
      );
      console.log(req.file.path);
      if (updatedgroup) {
        res.status(201).send(updatedgroup);
      }
    } catch (err) {
      next(err);
    }
  }
);
// GET
groupsRouter.get("/", async (req, res, next) => {
  try {
    const mongoQuery = q2m(req.query);
    const total = await groupModel.countDocuments(mongoQuery.criteria);
    const groups = await groupModel
      .find(mongoQuery.criteria, mongoQuery.options.fields)
      .sort({ createdAt: -1 })
      .skip(mongoQuery.options.skip)
      .limit(mongoQuery.options.limit)
      .populate({
        path: "leader",
        model: "Users",
        select: "name surname username pfp bio background badges",
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

    // .populate({
    //   path: "hashtags",
    //   model: "Hashtags",
    //   select: "title",
    // });

    res.status(200).send({
      links: mongoQuery.links(total),
      total,
      totalPages: Math.ceil(total / mongoQuery.options.limit),
      groups,
    });
  } catch (error) {
    next(error);
  }
});
// GET BY ID
groupsRouter.get("/:groupId", async (req, res, next) => {
  try {
    const group = await groupModel.findById(req.params.groupId);

    if (group) {
      res.send(group);
    } else {
      next(
        createHttpError(404, `group with id ${req.params.groupId} not found`)
      );
    }
  } catch (error) {
    next(error);
  }
});
// PUT +VALIDATION OF A TOKEN +VALIDATION IF U ARE A LEADER ✔️
groupsRouter.put("/:groupId", jwtMiddleware, async (req, res, next) => {
  try {
    const group = await groupModel.findById(req.params.groupId);
    console.log(group);
    if (req.user._id.toString() === group.leader.toString()) {
      const updatedgroup = await groupModel.findByIdAndUpdate(
        req.params.groupId,
        req.body,
        { new: true, runValidators: true }
      );

      if (updatedgroup) {
        res.send(updatedgroup);
      } else {
        next(
          createHttpError(404, `group with id ${req.params.groupId} not found`)
        );
      }
    } else {
      res.status(403).send();
    }
  } catch (error) {
    next(error);
  }
});
//JOIN GROUP --- DONE ✔️
groupsRouter.put("/join/:groupId", jwtMiddleware, async (req, res, next) => {
  try {
    let groupSource = await groupModel.findById(req.params.groupId);
    let group = groupSource;
    if (group.team.includes(req.user._id)) {
      res.status(400).send("You are already member of this group.");
    } else {
      group = group.team.concat(req.user._id);
      const data = {
        team: group,
      };
      const updatedgroup = await groupModel.findByIdAndUpdate(
        req.params.groupId,
        data,
        { new: true, runValidators: true }
      );

      if (updatedgroup) {
        res.send(updatedgroup);
      } else {
        next(
          createHttpError(404, `group with id ${req.params.groupId} not found`)
        );
      }
    }
  } catch (error) {
    next(error);
  }
});

//INVITE TO A GROUP --- REWORK REQUIRED

//LEAVE GROUP --- DONE ✔️
groupsRouter.put("/leave/:groupId", jwtMiddleware, async (req, res, next) => {
  try {
    let group = await groupModel.findById(req.params.groupId);
    if (group.team.includes(req.user._id)) {
      function everythingButUser(value) {
        return value.toString() !== req.user._id.toString();
      }
      const team = group.team.filter(everythingButUser);
      const data = {
        team: team,
      };

      //if leader leaves -> disband, if not leader - empty place
      if (req.user._id.toString() === group.leader.toString()) {
        const deletedgroup = await groupModel.findByIdAndDelete(
          req.params.groupId
        );
        if (deletedgroup) {
          res.status(204).send();
        } else {
          next(
            createHttpError(
              404,
              `group with id ${req.params.groupId} not found`
            )
          );
        }
      } else {
        const updatedgroup = await groupModel.findByIdAndUpdate(
          req.params.groupId,
          data,
          { new: true, runValidators: true }
        );
        if (updatedgroup) {
          res.send(updatedgroup);
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

// DELETE +VALIDATION OF A TOKEN +VALIDATION IF U ARE A LEADER ✔️
groupsRouter.delete("/:groupId", jwtMiddleware, async (req, res, next) => {
  try {
    const group = await groupModel.findById(req.params.groupId);
    if (req.user._id.toString() === group.leader.toString()) {
      const deletedgroup = await groupModel.findByIdAndDelete(
        req.params.groupId
      );
      //-------------------------

      if (deletedgroup) {
        res.status(204).send();
      } else {
        next(
          createHttpError(404, `group with id ${req.params.groupId} not found`)
        );
      }
    } else {
      res.status(403).send();
      next(error);
    }
  } catch (error) {
    next(error);
  }
});

export default groupsRouter;
