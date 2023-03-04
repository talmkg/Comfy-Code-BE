import express from "express";
import createHttpError from "http-errors";
import badgesModel from "./model.js";
import usersModel from "../users/model.js";

const badgesRouter = express.Router();

badgesRouter.get("/", async (req, res, next) => {
  try {
    const badges = await badgesModel.find();
    if (badges) {
      res.send(badges);
    } else {
      res.send("This user don't have any badges yet.");
    }
  } catch (err) {
    next(err);
  }
});

badgesRouter.post("/", async (req, res, next) => {
  try {
    const newbadge = new badgesModel(req.body);
    const { _id } = await newbadge.save();
    res.status(201).send({ _id });
  } catch (err) {
    next(err);
  }
});

badgesRouter.put("/:badgeid", async (req, res, next) => {
  try {
    const editeddbadge = await badgesModel.findByIdAndUpdate(
      req.params.badgeid,
      { ...req.body }
    );
    res.status(203).send({ editeddbadge });
  } catch (err) {
    next(err);
  }
});

badgesRouter.delete("/:badgeid", async (req, res, next) => {
  try {
    const deletedbadge = await badgesModel.findByIdAndDelete(
      req.params.badgeid
    );
    if (deletedbadge) {
      res.status(204).send();
    } else {
      next(
        createHttpError(404, `badge with id ${req.params.badgeid} not found.`)
      );
    }
  } catch (err) {
    next(err);
  }
});

export default badgesRouter;
