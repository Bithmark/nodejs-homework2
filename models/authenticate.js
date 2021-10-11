const jwt = require("jsonwebtoken");

const { User } = require("./users");

const { SECRET_KEY } = process.env;

async function authenticate(req, res, next) {
  const { authorization } = req.headers;
  if (!authorization) {
    res.status(401).json({
      status: "error",
      code: 401,
      message: "Not authorized",
    });
    return;
  }
  const [bearer, token] = authorization.split(" ");
  if (bearer !== "Bearer") {
    res.status(401).json({
      status: "error",
      code: 401,
      message: "Not authorized",
    });
    return;
  }
  try {
    const { _id } = jwt.verify(token, SECRET_KEY);
    const user = await User.findById(_id);
    if (!user.token) {
      res.status(401).json({
        status: "error",
        code: 401,
        message: "Not authorized",
      });
      return;
    }
    req.user = user;
    console.log(req.user);
    next();
  } catch (error) {
    res.status(401).json({
      status: "error",
      code: 401,
      message: "Not authorized",
    });
    return;
  }
}

module.exports = authenticate;
