import express from "express";
import { generateJwt } from "../utils/auth/jwt.js";
import usersModel from "../users/model.js";
const authenticationRouter = express.Router();
authenticationRouter.post("/login", async (req, res, next) => {
  try {
    // findByCredentials() = a function in authors/schema.js which finds a user by email and compares the hashed value of password from request and the stored hashed value of the password.
    console.log(req.body);
    const { username, password } = req.body;

    if (!username || !password) {
      const error = new Error("Missing credentials.");
      error.status = 401;
      throw error;
    }
    const user = await usersModel.findByCredentials(username, password);

    if (!user) {
      res.status(401);
    }

    const token = await generateJwt({ id: user._id });
    res.status(200).send({ token });
  } catch (error) {
    next(error);
  }
});

// create  user
authenticationRouter.post("/register", async (req, res, next) => {
  try {
    if (!req.body.password) {
      res.send(500).send("Please enter password.");
    } else {
      const user = await new usersModel(req.body).save();
      const token = await generateJwt({ id: user._id });
      delete user._doc.password;

      res.send({ user, token });
    }
  } catch (error) {
    res.send(500).send({ message: error.message });
  }
});
export default authenticationRouter;
