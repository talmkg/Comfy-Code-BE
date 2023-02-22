import messageModel from "./messages/model.js";
import q2m from "query-to-mongo";

let onlineUsers = [];

// const messagesfrommongo = await messageModel.find().sort({ createdAt: -1 });

export const newConnectionHandler = (newClient) => {
  console.log("NEW CONNECTION:", newClient.id);

  newClient.emit("welcome", { message: `Hello ${newClient.id}` });

  newClient.on("setUsername", (payload) => {
    console.log(payload);
    onlineUsers.push({ username: payload.username, socketId: newClient.id });
    newClient.emit("loggedIn", onlineUsers);
    newClient.broadcast.emit("updateOnlineUsersList", onlineUsers);
  });
  newClient.on("requestAllMessages", async () => {
    const messages = await messageModel.find().sort({ createdAt: -1 }).limit(6);
    newClient.broadcast.emit("AllMessages", messages);
  });

  newClient.on("sendMessage", (message) => {
    console.log(message);
    const saveToMongo = async () => {
      const data = {
        sender: message.sender,
        text: message.text,
        createdAt: message.createdAt,
      };
      const newmessage = new messageModel(data);
      const { _id } = await newmessage.save();
      console.log("message is saved to mongo:", _id);
    };
    newClient.broadcast.emit("newMessage", message);
    saveToMongo();
  });

  newClient.on("disconnect", () => {
    onlineUsers = onlineUsers.filter((user) => user.socketId !== newClient.id);
    newClient.broadcast.emit("updateOnlineUsersList", onlineUsers);
  });
};
