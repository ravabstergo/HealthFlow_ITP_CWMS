const { verifyToken } = require("../utils/jwt");
const Role = require("../models/Role");

const protect = async (req, res, next) => {
  try {
    console.log("[AuthMiddleware protect] Checking authentication...");

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log(
        "[AuthMiddleware protect] No authorization header or invalid token format"
      );
      return res.status(401).json({ message: "Not authorized, no token" });
    }

    const token = authHeader.split(" ")[1];

    // Verify JWT
    const decoded = verifyToken(token);
    if (!decoded) {
      console.log("[AuthMiddleware protect] Token verification failed");
      return res.status(401).json({ message: "Invalid token" });
    }

    req.user = {
      id: decoded.userId,
      activeRole: decoded.activeRoleId,
    };

    console.log("[AuthMiddleware protect] User authenticated:", req.user);
    next();
  } catch (error) {
    console.error(
      "[AuthMiddleware protect] Authentication error:",
      error.message
    );
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid token" });
    }
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired" });
    }
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const checkPermission = (entity, action, scope) => {
  return async (req, res, next) => {
    console.log("Checking permissions...");
    try {
      if (!req.user || !req.user.activeRole) {
        console.log("No active role found in request");
        return res
          .status(403)
          .json({ message: "No active role found in request" });
      }

      console.log("Fetching role with ID:", req.user.activeRole);
      const role = await Role.findById(req.user.activeRole).select(
        "permissions name"
      );

      if (!role || !role.permissions) {
        console.log("Role not found or no permissions assigned");
        return res
          .status(403)
          .json({ message: "No permissions assigned to this role" });
      }

      console.log("User permissions:", role.permissions);
      console.log("Required permission:", entity, action, scope);

      const hasPermission = role.permissions.some(
        (perm) =>
          perm.entity === entity &&
          perm.action === action &&
          (perm.scope === scope || perm.scope === "all")
      );

      if (!hasPermission) {
        console.log("User does not have permission for this action");
        return res
          .status(403)
          .json({ message: "You do not have permission for this action" });
      }

      console.log("Permission granted");
      req.permissions = role.permissions;
      req.roleName = role.name;

      next();
    } catch (error) {
      console.error("Error checking permissions:", error.message);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  };
};

module.exports = { protect, checkPermission };