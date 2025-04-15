const User = require("../models/User");
const bcrypt = require("bcryptjs");
const { generateAccessToken } = require("../utils/jwt");
const { getRolesAndActiveRole } = require("../utils/roleUtils");

// Login User
exports.login = async (req, res) => {
  const { identifier, password } = req.body;

  console.log(
    "[AuthController] Login request received. Identifier:",
    identifier
  );

  try {
    // Fetch user from the database based on email or NIC
    const user = await User.findOne({
      $or: [{ email: identifier }, { nic: identifier }],
    }).lean();

    if (!user) {
      console.log("[AuthController] Login failed: User not found");
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check if password matches
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      console.log("[AuthController] Login failed: Password mismatch");
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Fetch the user's roles and active role
    const { activeRole } = await getRolesAndActiveRole(user);

    if (!activeRole || !activeRole.role.permissions) {
      console.log(
        "[AuthController] Login failed: User role or permissions not found"
      );
      return res
        .status(403)
        .json({ message: "User role or permissions not found" });
    }

    console.log("[AuthController] Login successful for user:", user._id);
    const accessToken = generateAccessToken(user._id, activeRole.role._id);

    res.status(200).json({
      accessToken,
      user: {
        id: user._id,
        name: user.name,
      },
      activeRole: {
        id: activeRole.role._id,
        name: activeRole.role.name,
        permissions: activeRole.role.permissions,
      },
    });
  } catch (error) {
    console.error("[AuthController] Login error:", error);
    res
      .status(500)
      .json({ message: "Internal error", errorDetails: error.message });
  }
};

// Get currently authenticated user info
exports.getMe = async (req, res) => {
  const userId = req.user.id;

  console.log("[AuthController] Fetching user info for userId:", userId);

  try {
    const user = await User.findById(userId).lean();
    if (!user) {
      console.log("[AuthController] getMe failed: User not found");
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { activeRole } = await getRolesAndActiveRole(user);

    console.log("[AuthController] getMe successful for user:", user._id);

    res.status(200).json({
      user: { id: user._id, name: user.name },
      activeRole: {
        id: activeRole.role._id,
        name: activeRole.role.name,
        permissions: activeRole.role.permissions,
      },
    });
  } catch (error) {
    console.error("[AuthController] getMe error:", error);
    res
      .status(500)
      .json({ message: "Internal error", errorDetails: error.message });
  }
};
