const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  registerPatient,
  registerDoctor,
  registerOtherRoles,
  login,
  getMe,
  switchRole,
} = require("../controllers/authController");

// Log route accesses
router.post(
  "/register/patient",
  (req, res, next) => {
    console.log("[AuthRoutes] Register patient route accessed");
    next();
  },
  registerPatient
);

router.post(
  "/register/doctor",
  (req, res, next) => {
    console.log("[AuthRoutes] Register doctor route accessed");
    next();
  },
  registerDoctor
);

router.post(
  "/register/staff",
  (req, res, next) => {
    console.log("[AuthRoutes] Register custom route accessed");
    next();
  },
  registerOtherRoles
);

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

router.post(
  "/switch-role",
  protect,
  (req, res, next) => {
    console.log("[AuthRoutes] Switch role route accessed");
    next();
  },
  switchRole
);

module.exports = router;
