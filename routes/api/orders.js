const express = require("express");
const router = express.Router();
const { joiSchema } = require("../../models/order.js");
const { Order } = require("../../models/index.js");
const authenticate = require("../../models/authenticate.js");

router.post("/", authenticate, async (req, res) => {
  try {
    const { error } = joiSchema.validate(req.body);
    if (error) {
      const err = new Error(error.message);
      err.status = 400;
      throw err;
    }
    const newOder = { ...req.body, owner: req.user._id };
    const result = await Order.create(newOder);
    res.status(201).json({
      status: "success",
      code: 201,
      data: {
        result,
      },
    });
  } catch (error) {
    console.log(error);
  }
});

router.get("/", authenticate, async (req, res) => {
  try {
    const { _id } = req.user;
    const result = await Order.find({ owner: _id }, "_id content owner");
    res.status(201).json({
      status: "success",
      code: 201,
      data: {
        result,
      },
    });
  } catch (error) {
    console.log(error);
  }
});

router.get("/all", async (req, res) => {
  try {
    const result = await Order.find({}, "_id content owner");
    res.status(201).json({
      status: "success",
      code: 201,
      data: {
        result,
      },
    });
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
