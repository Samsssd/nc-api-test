const express = require("express");
const { registerUser, loginUser, checkIfEmailIsUsed, checkIfUsernameIsUsed, changePassword } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");
const router = express.Router();

router
    .route("/register")
    .post(registerUser);

router
    .route("/login")
    .post(loginUser);

router
    .route("/password")
    .put(protect, changePassword);

router
    .route("/checkemail")
    .post(checkIfEmailIsUsed)

router
    .route("/checkusername")
    .post(checkIfUsernameIsUsed)

module.exports = router;
