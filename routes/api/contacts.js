const express = require('express')
const router = express.Router()
const contactOperation = require("../../model/index.js");
const { contactsSchema } = require("../../Schema/index.js");

router.get("/", async (req, res, next) => {
  try {
    const contacts = await contactOperation.listContacts();
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
    const result = await contactOperation.getContactById(contactId);
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
    const { error } = contactsSchema.validate(req.body);
    if (error) {
      const err = new Error(error.message);
      err.status = 400;
      throw err;
    }
    const result = await contactOperation.addContact(req.body);
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
    const { error } = contactsSchema.validate(req.body);
    if (error) {
      const err = new Error(error.message);
      err.status = 400;
      throw err;
    }
    const { contactId } = req.params;
    const result = await contactOperation.updateContact(contactId, req.body);
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

router.delete("/:contactId", async (req, res, next) => {
  try {
    const { contactId } = req.params;
    const result = await contactOperation.removeContact(contactId);
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

module.exports = router
