import atob from "atob";
import usersModel from "../../users/schema.js";

const basicMiddleware = async (req, res, next) => {
  console.log(req.headers);

  const encodedCredentials = req.headers.authorization.replace("Basic ", "");
  console.log(encodedCredentials);

  const [email, password] = atob(encodedCredentials).split(":");

  console.log({ email, password });

  const user = await usersModel.findByCredentials(email, password);

  req.user = user;

  next();
};

export default basicMiddleware;
