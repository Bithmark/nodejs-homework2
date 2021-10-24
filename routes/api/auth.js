const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const path = require("path");
const { nanoid } = require("nanoid");
const fs = require("fs/promises");
const { joiSchema } = require("../../models/users.js");
const { User, uploadMiddleware } = require("../../models/index.js");
const { Conflict, NotFound, BadRequest } = require("http-errors");
const jwt = require("jsonwebtoken");
const authenticate = require("../../models/authenticate.js");
const Jimp = require("jimp");
const gravatar = require("gravatar");
const sendEmail = require("../../helpers/sendEmail");
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
    const verifyToken = nanoid();
    const userAvatar = gravatar.url(email, { s: "200", r: "pg", d: "retro" });
    const result = await User.create({
      email,
      password: hashPasword,
      avatarURL: userAvatar,
      verifyToken,
    });
    try {
      const emailVerify = {
        to: email,
        subject: "Сonfirmation of registration",
        html: `<a href='http://localhost:3000/api/users/verify/${verifyToken}' target='_blank'>Confirm email</a>`,
      };
      await sendEmail(emailVerify);
      console.log(emailVerify)
    } catch (error) {
      console.log(error.message);
    }
    res.status(201).json({
      status: "success",
      code: 201,
      message: "Success register",
      data: { email, userAvatar, verifyToken },
    });
  } catch (error) {
    next(error);
  }
});

router.get("/verify/:verifyToken", async (req, res) => {
  try {
    const { verifyToken } = req.params;
    const user = User.findOne({ verifyToken });
    console.log(user)
    if (!user) {
      throw new NotFound("User not found");
    }
    await User.findByIdAndUpdate(user._id, { verifyToken: null, verify: true });
    res.json({
      status: "success",
      code: 200,
      message: "Email verify success",
    });
  } catch (error) {
    console.log(error)
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }, "_id email password verify");
    if (!user) {
      throw new NotFound(`Email ${email} not found`);
    }
    if (!bcrypt.compareSync(password, user.password)) {
      throw new BadRequest("Invalid password");
    }
    if (!user.verify) {
      throw new BadRequest("Email not verify");
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

const uploadDir = path.join(__dirname, "../../", "public/avatars");

router.patch(
  "/avatar",
  authenticate,
  uploadMiddleware.single("avatar"),
  async (req, res, next) => {
    const { path: tempStorage, originalname } = req.file;
    try {
      const { id } = req.user;
      const user = await User.findOne({ id });
      const [extention] = originalname.split(".").reverse();
      const newFileName = `user_new-ava_${user.id}.${extention}`;
      Jimp.read(tempStorage, (err, image) => {
        if (err) throw err;
        image.resize(250, 250).write(newFileName);
      });
      const resultStorage = path.join(uploadDir, newFileName);
      await fs.rename(tempStorage, resultStorage);
      const photo = path.join("/avatars", newFileName);
      await User.findByIdAndUpdate(
        id,
        {
          avatarURL: photo,
        },
        {
          new: true,
        }
      );
      res.json({
        message: "success",
        code: 200,
        avatarURL: photo,
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
