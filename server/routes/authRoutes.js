const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { login, getMe } = require("../controllers/authController");

router.post(
  "/login",
  (req, res, next) => {
    console.log(
      "[AuthRoutes] Login route accessed with identifier:",
      req.body.identifier
    );
    next();
  },
  login
);

router.get(
  "/me",
  protect,
  (req, res, next) => {
    console.log(
      "[AuthRoutes] Accessing current user info for userId:",
      req.user.id
    );
    next();
  },
  getMe
);

module.exports = router;
