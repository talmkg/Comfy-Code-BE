import messageModel from "../api/GeneralChat/model.js";
import notificationsModel from "../api/notifications/model.js";

let onlineUsers = [];

export const newConnectionHandler = (newClient) => {
  console.log("NEW CONNECTION:", newClient.id);
  newClient.emit("welcome", { message: `Hello ${newClient.id}` });
  newClient.on("setUsername", (payload) => {
    onlineUsers.push({
      _id: payload._id,
      username: payload.username,
      socketId: newClient.id,
    });
    newClient.emit("loggedIn", onlineUsers);
    newClient.broadcast.emit("updateOnlineUsersList", onlineUsers);
  });

  newClient.on("sendMessage", (message) => {
    console.log(message);
    const saveToMongo = async () => {
      const data = {
        username: message.username,
        pfp: message.pfp,
        user_id: message.user_id,
        text: message.text,
      };
      const newmessage = new messageModel(data);
      const { _id } = await newmessage.save();
      console.log(_id);
    };

    newClient.broadcast.emit("newMessage", message);
    saveToMongo();
  });
  // newClient.on("sendNotification", (notification) => {
  //   console.log(notification);
  //   const saveToMongo = async () => {
  //     const newnotification = new notificationsModel(notification);
  //     const { _id } = await newnotification.save();
  //     console.log(_id);
  //   };
  //   newClient.broadcast.emit("newNotification", notification);
  //   saveToMongo();
  // });

  //
  //
  //

  newClient.on("notification", (props) => {
    const { from, text, to, from_mongo, to_mongo } = props;

    console.log(
      "notification -------------------------------------------------",
      props
    );
    newClient.to(to).emit("notification", {
      text,
      to: to,
      from: from_mongo,
      createdAt: new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
    });
    const saveToMongo = async () => {
      const data = {
        from: from_mongo._id,
        to: to_mongo,
        text: text,
      };
      const newNotification = new notificationsModel(data);
      const { _id } = await newNotification.save();
      console.log(_id);
    };
    saveToMongo();
  });

  //
  //
  //
  newClient.on("requestChatHistory", () => {
    console.log("Starting to process chat history...");
    let chatHistory;
    const findMessages = async () => {
      chatHistory = await messageModel.find().limit(10).sort({ $natural: -1 });
      const reversed = chatHistory.reverse();

      newClient.emit("chatHistory", reversed);
    };
    findMessages();
  });

  newClient.on("disconnect", () => {
    onlineUsers = onlineUsers.filter((user) => user.socketId !== newClient.id);
    newClient.broadcast.emit("updateOnlineUsersList", onlineUsers);
  });
};
