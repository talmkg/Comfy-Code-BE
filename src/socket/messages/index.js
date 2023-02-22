import express from "express";
import messageModel from "./model.js";
import createHttpError from "http-errors";
import q2m from "query-to-mongo";

const messagesRouter = express.Router();
// POST
messagesRouter.post("/", async (req, res, next) => {
  try {
    const data = {
      ...req.body,
    };
    const newmessage = new messageModel(data);
    const { _id } = await newmessage.save();
    res.status(201).send({ _id });
  } catch (error) {
    next(error);
  }
});
// GET
messagesRouter.get("/", async (req, res, next) => {
  try {
    const mongoQuery = q2m(req.query);
    const total = await messageModel.countDocuments(mongoQuery.criteria);
    const messages = await messageModel
      .find(mongoQuery.criteria, mongoQuery.options.fields)
      .sort({ createdAt: -1 })
      .skip(mongoQuery.options.skip)
      .limit(mongoQuery.options.limit);
    res.status(200).send({
      links: mongoQuery.links(total),
      total,
      totalPages: Math.ceil(total / mongoQuery.options.limit),
      messages,
    });
  } catch (error) {
    next(error);
  }
});

export default messagesRouter;
