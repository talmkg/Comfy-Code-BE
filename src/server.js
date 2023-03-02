import express from "express";
import listEndpoints from "express-list-endpoints";
import cors from "cors";
import {
  badRequestHandler,
  genericServerErrorHandler,
  notFoundHandler,
  unauthorizedHandler,
} from "./errorHandlers.js";
import usersRouter from "./api/users/index.js";
import { Server } from "socket.io";
import { createServer } from "http"; // CORE MODULE
import mongoose from "mongoose";
import groupsRouter from "./api/groups/index.js";
import authenticationRouter from "./api/authentication/index.js";
import generalChatRouter from "./api/GeneralChat/index.js";
import notificationsRouter from "./api/notifications/index.js";

import { newConnectionHandler } from "./socket/index.js";

const server = express();
const port = process.env.PORT || 3001;

const httpServer = createServer(server);
const io = new Server(httpServer); // this constructor is expecting to receive an HTTP-SERVER as parameter not an EXPRESS SERVER!!!
io.on("connection", newConnectionHandler); // "connection" is NOT a custom event! This is a socket.io event, triggered every time a new client connects!
server.use(express.json());
server.use(cors());

server.use("/groups", groupsRouter);
server.use("/users", usersRouter);
server.use("/auth", authenticationRouter);
server.use("/general-chat", generalChatRouter);
server.use("/notifications", notificationsRouter);
server.use(badRequestHandler);
server.use(unauthorizedHandler);
server.use(notFoundHandler);
server.use(genericServerErrorHandler);

mongoose.connect(process.env.MONGO_URL);
mongoose.connection.on("connected", () => {
  console.log("Successfully connected to Mongo!");
  httpServer.listen(port, () => {
    console.table(listEndpoints(server));
    console.log(`Server is running on port ${port}`);
  });
});
