const { Schema, model } = require("mongoose");
const Joi = require("joi");

const contactSchema = Schema(
  {
    name: {
      type: String,
      require: [true, "Set name for contact"],
      minlenght: 4,
    },
    email: {
      type: String,
      require: [true, "Set email for contact"],
      minlenght: 6,
    },
    phone: {
      type: String,
      require: [true, "Set phone for contact"],
      minlenght: 8,
    },
    favorite: {
      type: Boolean,
      default: false,
    },
  },
  { versionKey: false, timestamps: true }
);

const joiSchema = Joi.object({
  name: Joi.string().min(4).required(),
  email: Joi.string().min(6).required(),
  phone: Joi.string().min(8).required(),
  favorite: Joi.boolean(),
});

const updateFavoriteJoiSchema = Joi.object({
  favorite: Joi.boolean().required(),
});

const Contact = model("contact", contactSchema);

module.exports = {
  joiSchema,
  Contact,
  updateFavoriteJoiSchema,
};
