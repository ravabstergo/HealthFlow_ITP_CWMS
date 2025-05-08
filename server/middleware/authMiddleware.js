const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Role = require("../models/Role");
const {
  getPermissionsFromCache,
  setPermissionsInCache,
} = require("../utils/cacheUtil");

exports.protect = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ message: "Not authorized to access this route" });
    }

    const token = authHeader.split(" ")[1];

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded?.userId || !decoded?.activeRoleId) {
      return res.status(401).json({ message: "Invalid token" });
    }

    // Get user with populated role details
    const user = await User.findById(decoded.userId)
      .populate({
        path: "roles.role",
        select: "name permissions isSystem createdBy",
        populate: {
          path: "createdBy",
          select: "_id name",
        },
      })
      .populate("roles.assignedBy", "_id name");

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // Find active role
    const activeRole = user.roles.find(
      (r) => r.role._id.toString() === decoded.activeRoleId
    );
    if (!activeRole) {
      return res.status(401).json({ message: "Active role not found" });
    }

    // Get permissions from cache or set them if not found
    let permissions = getPermissionsFromCache(activeRole.role._id);
    if (!permissions) {
      permissions = activeRole.role.permissions;
      setPermissionsInCache(activeRole.role._id, permissions);
    }

    // Set base user info
    req.user = {
      id: user._id, // Ensure ID is a string
      name: user.name,
      activeRole: {
        id: activeRole.role._id,
        name: activeRole.role.name,
        permissions: permissions,
      },
    };

    // Handle data access context based on role type
    if (activeRole.role.name === "sys_doctor") {
      // If user is a doctor, they access their own data
      req.dataAccess = {
        doctorId: user._id,
        accessType: "direct",
      };
    } else if (!activeRole.role.isSystem) {
      // For custom roles, check who created/assigned the role
      const creatingDoctor = activeRole.role.createdBy;
      if (!creatingDoctor) {
        return res.status(403).json({
          message: "Invalid role configuration - no creating doctor found",
        });
      }

      // Set up delegated access context
      req.dataAccess = {
        doctorId: creatingDoctor._id,
        accessType: "delegated",
        delegatedBy: creatingDoctor.name,
      };
    }

    next();
  } catch (error) {
    console.error("[AuthMiddleware] Error:", error);
    res.status(401).json({ message: "Not authorized to access this route" });
  }
};

exports.checkPermission = (entity, action, scope = "all") => {
  return (req, res, next) => {
    const permissions = req.user?.activeRole?.permissions;
    if (!permissions) {
      return res.status(403).json({
        message: "No permissions available",
      });
    }

    const hasPermission = permissions.some(
      (p) =>
        p.entity === entity &&
        p.action === action &&
        (p.scope === scope || p.scope === "all")
    );

    if (!hasPermission) {
      return res.status(403).json({
        message: `You do not have permission to ${action} ${entity}`,
      });
    }

    // Check if the action requires doctor context
    const requiresDoctorContext =
      ["view", "create", "update", "delete"].includes(action) &&
      ["patient", "appointment", "prescription"].includes(entity);

    if (requiresDoctorContext && !req.dataAccess?.doctorId) {
      return res.status(403).json({
        message: "This action requires doctor context",
      });
    }

    next();
  };
};
