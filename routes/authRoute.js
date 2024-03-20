const express = require("express");
const { registerUser, loginUser } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");
const router = express.Router();

router
    .route("/register")
    .post(registerUser);

router
    .route("/login")
    .post(protect, loginUser);

module.exports = router;
