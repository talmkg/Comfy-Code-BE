import messageModel from "./GeneralChat/model.js";

let onlineUsers = [];

export const newConnectionHandler = (newClient) => {
  console.log("NEW CONNECTION:", newClient.id);
  newClient.emit("welcome", { message: `Hello ${newClient.id}` });
  newClient.on("setUsername", (payload) => {
    onlineUsers.push({ username: payload.username, socketId: newClient.id });
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
    // const checkIfDeleteIsNeeded = async () => {
    //   const chatHistory = await messageModel.countDocuments(); //already gives us a number
    //   if (chatHistory > 15) {
    //     const lastmessage = await messageModel.findOne({
    //       $query: {},
    //       $orderby: { $natural: -1 },
    //     });
    //     await messageModel.findByIdAndDelete(lastmessage._id);
    //   } else {
    // saveToMongo();
    //   }
    // };
    // checkIfDeleteIsNeeded();
  });
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
