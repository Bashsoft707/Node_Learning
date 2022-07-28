const express = require("express");
const { register, login, getMe } = require("../controllers/auth");
const router = express.Router();

const { protect, authorize } = require("../middleware/auth");

router.route("/register").post(register);

router.route("/login").post(login);

router.route("/me").get(protect, authorize("publisher", "admin"), getMe);

module.exports = router;