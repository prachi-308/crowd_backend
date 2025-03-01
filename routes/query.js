const express = require("express");
const router = express.Router();
const ctrl = require("../controllers");
const mw = require("../middleware");
const rateLimit = require("express-rate-limit");

// Define rate limiting rules
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
});

router.post("/create", limiter, ctrl.query.create);
router.get("/all", mw.auth.verify, ctrl.query.showAll);
router.delete("/:id/delete", mw.auth.verify, ctrl.query.deleteQuery);

module.exports = router;