const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const { joiSchema } = require("../../models/users.js");
const { User } = require("../../models/index.js");
const { Conflict, NotFound, BadRequest } = require("http-errors");
const jwt = require("jsonwebtoken");
const authenticate = require("../../models/authenticate.js");
const { SECRET_KEY } = process.env;

router.post("/signup", async (req, res, next) => {
  try {
    const { error } = joiSchema.validate(req.body);
    if (error) {
      const err = new Error(error.message);
      err.status = 400;
      throw err;
    }
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (user) {
      throw new Conflict("Allready signup");
    }
    const hashPasword = bcrypt.hashSync(password, bcrypt.genSaltSync(10));
    const newUser = { email, password: hashPasword };
    await User.create(newUser);
    res.status(201).json({
      status: "success",
      code: 201,
      message: "Success signup",
    });
  } catch (error) {
    next(error);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }, "_id email password");
    if (!user) {
      throw new NotFound(`Email ${email} not found`);
    }
    if (!bcrypt.compareSync(password, user.password)) {
      throw new BadRequest("Invalid password");
    }
    const { _id } = user;
    const payload = {
      _id,
    };
    const token = jwt.sign(payload, SECRET_KEY);
    await User.findByIdAndUpdate(_id, { token });
    res.json({
      status: "success",
      code: 200,
      data: {
        token,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.get("/logout", authenticate, async (req, res, next) => {
  try {
    const { _id } = req.user;
    await User.findByIdAndUpdate(_id, { token: null });
    res.json({
      status: "success",
      code: 200,
      message: "Success logout",
    });
  } catch (error) {
    next(error);
  }
});


module.exports = router;
