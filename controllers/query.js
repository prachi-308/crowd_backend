const db = require("../models");
const Joi = require("joi");
const winston = require("winston");
const { body, validationResult } = require("express-validator");

// Define the schema for query validation
const querySchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Please enter a valid email address.",
    "any.required": "Email is required.",
  }),
  message: Joi.string().required().messages({
    "any.required": "Message is required.",
  }),
});

// Configure winston logger
const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: "error.log", level: "error" }),
    new winston.transports.Console({ format: winston.format.simple() }),
  ],
});

const create = [
  // Validate and sanitize inputs
  body("email").isEmail().withMessage("Please enter a valid email address."),
  body("message").notEmpty().withMessage("Message is required."),

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const query = { ...req.body };

    try {
      const newQuery = await db.Query.create(query);
      res.status(200).json(newQuery);
    } catch (err) {
      logger.error("Server error: ", err);
      return res.status(500).json({
        message: "Something went wrong while sending the query. Please try again!",
      });
    }
  },
];

const showAll = async (req, res) => {
  try {
    const allQuery = await db.Query.find({});
    res.status(200).json(allQuery);
  } catch (err) {
    logger.error("Server error: ", err);
    return res.status(500).json({
      message: "Something went wrong when trying to get all the queries",
    });
  }
};

const deleteQuery = async (req, res) => {
  try {
    if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      db.Query.findByIdAndRemove(req.params.id, (err, success) => {
        if (err) {
          logger.error("Server error: ", err);
          return res.status(500).json({
            message: "Something went wrong while deleting this query. Try again.",
          });
        }

        return res.status(200).json({
          message: "Successfully deleted the query.",
        });
      });
    } else {
      res.status(404).json({
        message: "No query exists.",
      });
    }
  } catch (err) {
    logger.error("Server error: ", err);
    return res.status(500).json({
      message: "Something went wrong while deleting this query. Try again.",
    });
  }
};

module.exports = {
  create,
  showAll,
  deleteQuery,
};