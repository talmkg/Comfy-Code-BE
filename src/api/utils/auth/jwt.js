import jwt from "jsonwebtoken";
import usersModel from "../../users/model.js";

export function generateJwt(payload) {
  return new Promise(function (resolve, reject) {
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "1 day" },
      (err, token) => {
        if (err) reject(err);
        else resolve(token);
      }
    );
  });
}

export function verifyJwt(token) {
  console.log(token);
  return new Promise(function (resolve, reject) {
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) reject(err);
      else resolve(decoded);
    });
  });
}

export async function jwtMiddleware(req, res, next) {
  try {
    if (!req.headers.authorization) {
      const error = new Error("No auth headers.");
      error.status = 401;
      next(error);
    } else {
      const token = req.headers.authorization.replace("Bearer ", "");

      const decoded = await verifyJwt(token);

      const user = await usersModel.findById(decoded.id);

      req.user = user;

      next();
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
}
