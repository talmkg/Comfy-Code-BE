import express from "express";
import { Octokit } from "octokit";
import usersModel from "../users/model.js";
import { generateJwt } from "../utils/auth/jwt.js";

const gitRouter = express.Router();
// POST
gitRouter.post("/", async (req, res, next) => {
  try {
  } catch (error) {
    next(error);
  }
});
// GET
gitRouter.get("/getAccessToken", async (req, res, next) => {
  try {
    console.log(req.query.code);
    const params =
      "?client_id=" +
      process.env.CLIENT_ID +
      "&client_secret=" +
      process.env.CLIENT_SECRET +
      "&code=" +
      req.query.code;
    console.log(
      "fetch: ",
      "https://github.com/login/oath/access_token" + params
    );
    await fetch("https://github.com/login/oauth/access_token" + params, {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
    })
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        console.log(data);
        res.json(data);
      });
  } catch (error) {
    next(error);
  }
});
gitRouter.get("/getUserData", async (req, res, next) => {
  try {
    // req.get("Authorization"); //BEARER TOKEN
    // await fetch("https://api.github.com/user", {
    //   method: "GET",
    //   headers: {
    //     Authorization: req.get("Authorization"),
    //   },
    // })
    //   .then((response) => {
    //     return response.json();
    //   })
    //   .then((data) => {
    //     res.json(data);
    //   });
    //
    //
    //
    const octokit = new Octokit({
      auth: req.get("Authorization"),
    });

    const user = await octokit.request("GET /user", {
      headers: {
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });
    if (user) {
      console.log("USER FROM OCTOKIT: ", user.data);
      res.send(user.data);
    }
  } catch (error) {
    next(error);
  }
});
gitRouter.get("/findByGitCredentials/:username", async (req, res, next) => {
  try {
    //we can find a user, but we also need to generate a token
    //for token we need email and password
    //we can get an email, but even I can't get the password cuz the BE is secured
    const user = await usersModel.find({
      github_username: req.params.username,
    });
    const token = await generateJwt({ id: user[0]._id });
    const data = {
      user: await user,
      token: await token,
    };
    if (user && token && data) {
      res.status(200).send(data);
    }
  } catch (error) {
    next(error);
  }
});
export default gitRouter;
