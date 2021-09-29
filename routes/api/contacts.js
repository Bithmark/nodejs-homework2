const express = require("express");
const router = express.Router();
const { Contact } = require("../../models/index.js");
const {
  joiSchema,
  updateFavoriteJoiSchema,
} = require("../../models/contacts.js");

router.get("/", async (req, res, next) => {
  try {
    const contacts = await Contact.find({}, "_id name email phone favorite");
    res.json({
      status: "success",
      code: 200,
      data: {
        results: contacts,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.get("/:contactId", async (req, res, next) => {
  try {
    const { contactId } = req.params;
    const result = await Contact.findById(
      contactId,
      "_id name email phone favorite"
    );
    if (!result) {
      res
        .status(404)
        .send({ error: `Contact by id=${contactId} is not found` });
    }
    res.json({
      status: "success",
      code: 200,
      data: {
        result,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { error } = joiSchema.validate(req.body);
    if (error) {
      const err = new Error(error.message);
      err.status = 400;
      throw err;
    }
    const result = await Contact.create(req.body);
    res.status(201).json({
      status: "success",
      code: 201,
      data: {
        result,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.put("/:contactId", async (req, res, next) => {
  try {
    const { error } = joiSchema.validate(req.body);
    if (error) {
      const err = new Error(error.message);
      err.status = 400;
      throw err;
    }
    const { contactId } = req.params;
    const result = await Contact.findByIdAndUpdate(contactId, req.body, {
      new: true,
    });
    if (!result) {
      res
        .status(404)
        .send({ error: `Contact by id=${contactId} is not found` });
    }
    res.json({
      status: "success",
      code: 200,
      data: {
        result,
      },
    });
  } catch (error) {
    next(error);
  }
});
router.patch("/:contactId/favorite", async (req, res, next) => {
  try {
    const { error } = updateFavoriteJoiSchema.validate(req.body);
    if (error) {
      const err = new Error(error.message);
      err.status = 400;
      throw err;
    }
    const { contactId } = req.params;
    const { favorite } = req.body;
    const result = await Contact.findByIdAndUpdate(
      contactId,
      { favorite },
      {
        new: true,
      }
    );
    if (!favorite) {
      const errorFavorite = new Error("Missing field favorite");
      errorFavorite.status = 400;
      throw errorFavorite;
    }
    if (!result) {
      res.status(404).send({ error: `Not found` });
    }
    res.json({
      status: "success",
      code: 200,
      data: {
        result,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.delete("/:contactId", async (req, res, next) => {
  try {
    const { contactId } = req.params;
    const result = await Contact.findByIdAndDelete(contactId);
    if (!result) {
      res
        .status(404)
        .send({ error: `Contact by id=${contactId} is not found` });
    }
    res.json({
      status: "success",
      code: 200,
      message: "Success remove",
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
