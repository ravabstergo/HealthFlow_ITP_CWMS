const User = require("../models/User");
const Role = require("../models/Role"); // Import Role model
const bcrypt = require("bcryptjs");
const { generateAccessToken } = require("../utils/jwt");
const { getRolesAndActiveRole } = require("../utils/roleUtils");
const {
  removePermissionsFromCache,
  setPermissionsInCache,
} = require("../utils/cacheUtil");
const PreRegisteredUser = require("../models/PreRegisteredUser");

// Login User (unchanged - keeping as is)
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
    setPermissionsInCache(activeRole.role._id, activeRole.role.permissions);

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

// Get currently authenticated user info - UPDATED
exports.getMe = async (req, res) => {
  const userId = req.user.id;

  console.log("[AuthController] Fetching user info for userId:", userId);

  try {
    const user = await User.findById(userId).lean();
    if (!user) {
      console.log("[AuthController] getMe failed: User not found");
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { populatedRoles, activeRole } = await getRolesAndActiveRole(user);

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

// Register Patient - UPDATED
exports.registerPatient = async (req, res) => {
  console.log("[AuthController] Register patient request received");

  try {
    const { name, email, nic, mobile, password } = req.body;

    // Validate required fields
    if (!email && !nic) {
      console.log("[AuthController] Registration failed: Missing email or NIC");
      return res
        .status(400)
        .json({ message: "Either email or NIC is required." });
    }

    if (!name || !mobile || !password) {
      console.log(
        "[AuthController] Registration failed: Missing required fields"
      );
      return res.status(400).json({ message: "Missing required fields." });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [...(email ? [{ email }] : []), ...(nic ? [{ nic }] : [])],
    });

    if (existingUser) {
      console.log("[AuthController] Registration failed: User already exists");
      return res.status(400).json({ message: "You already have an account." });
    }

    // Find patient role
    const patientRole = await Role.findOne({ name: "sys_patient" });
    if (!patientRole) {
      console.log(
        "[AuthController] Registration failed: Patient role not found"
      );
      return res.status(500).json({ message: "Patient role not found." });
    }

    console.log("[AuthController] Patient role found. Creating user...");

    // Create user
    const user = new User({
      name,
      email: email || undefined,
      nic: nic || undefined,
      mobile,
      password: await bcrypt.hash(password, 10),
      roles: [{ role: patientRole._id }],
      lastActiveRole: patientRole._id,
    });

    await user.save();
    console.log(
      "[AuthController] Patient registration successful for user:",
      user._id
    );

    // Generate access token and set permissions in cache
    const accessToken = generateAccessToken(user._id, patientRole._id);
    setPermissionsInCache(patientRole._id, patientRole.permissions);

    res.status(201).json({
      accessToken,
      user: { id: user._id, name: user.name },
      activeRole: {
        id: patientRole._id,
        name: patientRole.name,
        permissions: patientRole.permissions,
      },
    });
  } catch (error) {
    console.error("[AuthController] Patient registration error:", error);
    res.status(500).json({
      message: "Internal error",
      errorDetails: error.message,
    });
  }
};

// Register Doctor - UPDATED
exports.registerDoctor = async (req, res) => {
  console.log("[AuthController] Register doctor request received");

  try {
    const { name, email, nic, mobile, password, doctorInfo } = req.body;

    // Validate required fields - doctors must have email
    if (!name || !mobile || !password || !email) {
      console.log(
        "[AuthController] Doctor registration failed: Missing required fields"
      );
      return res.status(400).json({ message: "Missing required fields." });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log(
        "[AuthController] Doctor registration failed: Email already registered"
      );
      return res.status(400).json({ message: "Email already registered." });
    }

    // Find doctor role
    const doctorRole = await Role.findOne({ name: "sys_doctor" });
    if (!doctorRole) {
      console.log(
        "[AuthController] Doctor registration failed: Doctor role not found"
      );
      return res.status(500).json({ message: "Doctor role not found." });
    }

    console.log("[AuthController] Doctor role found. Creating user...");

    // Create user
    const user = new User({
      name,
      email,
      nic: nic || undefined,
      mobile,
      password: await bcrypt.hash(password, 10),
      roles: [{ role: doctorRole._id }],
      lastActiveRole: doctorRole._id,
      doctorInfo,
    });

    await user.save();
    console.log(
      "[AuthController] Doctor registration successful for user:",
      user._id
    );

    // Generate access token and set permissions in cache
    const accessToken = generateAccessToken(user._id, doctorRole._id);
    setPermissionsInCache(doctorRole._id, doctorRole.permissions);

    res.status(201).json({
      accessToken,
      user: { id: user._id, name: user.name },
      activeRole: {
        id: doctorRole._id,
        name: doctorRole.name,
        permissions: doctorRole.permissions,
      },
    });
  } catch (error) {
    console.error("[AuthController] Doctor registration error:", error);
    res.status(500).json({
      message: "Internal error",
      errorDetails: error.message,
    });
  }
};

// Register Other Roles (Staff) - UPDATED
exports.registerOtherRoles = async (req, res) => {
  console.log("[AuthController] Register staff request received");

  try {
    const { name, email, nic, mobile, password } = req.body;

    // Validate required fields - staff must have email
    if (!name || !mobile || !password || !email) {
      console.log(
        "[AuthController] Staff registration failed: Missing required fields"
      );
      return res.status(400).json({ message: "Missing required fields." });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log(
        "[AuthController] Staff registration failed: Email already registered"
      );
      return res.status(400).json({ message: "Email already registered." });
    }

    // Fetch pre-registered roles for the email
    const preregRoles = await PreRegisteredUser.find({
      email,
      isRegistered: false,
    }).populate("role assignedBy");

    if (!preregRoles.length) {
      console.log(
        "[AuthController] Staff registration failed: Not pre-registered"
      );
      return res
        .status(400)
        .json({ message: "You are not pre-registered to join the system." });
    }

    // Map roles to the User.roles format
    const userRoles = preregRoles.map((entry) => ({
      role: entry.role._id,
      assignedBy: entry.assignedBy ? entry.assignedBy._id : null,
    }));

    const activeRole = preregRoles[0].role;
    console.log(
      "[AuthController] Pre-registered roles found. Creating user..."
    );

    // Create the user
    const user = new User({
      name,
      email,
      nic: nic || undefined,
      mobile,
      password: await bcrypt.hash(password, 10),
      roles: userRoles,
      lastActiveRole: activeRole._id,
    });

    await user.save();
    console.log(
      "[AuthController] Staff registration successful for user:",
      user._id
    );

    // Update pre-registered roles as registered instead of deleting
    await PreRegisteredUser.updateMany(
      { email },
      {
        isRegistered: true,
        registeredUserId: user._id,
      }
    );
    console.log(
      "[AuthController] Updated pre-registered entries for email:",
      email
    );

    // Cache permissions and generate access token
    setPermissionsInCache(activeRole._id, activeRole.permissions);
    const accessToken = generateAccessToken(user._id, activeRole._id);

    res.status(201).json({
      accessToken,
      user: { id: user._id, name: user.name },
      activeRole: {
        id: activeRole._id,
        name: activeRole.name,
        permissions: activeRole.permissions,
      },
    });
  } catch (error) {
    console.error("[AuthController] Staff registration error:", error);
    res.status(500).json({
      message: "Internal error",
      errorDetails: error.message,
    });
  }
};

exports.switchRole = async (req, res) => {
  const userId = req.user.id;
  const { roleId } = req.body;

  console.log("[AuthController] Switch role request received", {
    userId,
    roleId,
  });

  try {
    const user = await User.findById(userId).lean();
    if (!user) {
      console.log("[AuthController] Switch role failed: User not found");
      return res.status(401).json({ message: "User not found" });
    }

    // Check if user has this role
    const hasRole = user.roles.some((r) => r.role.toString() === roleId);
    if (!hasRole) {
      console.log(
        "[AuthController] Switch role failed: User does not have this role"
      );
      return res
        .status(403)
        .json({ message: "You do not have access to this role" });
    }

    // Update user's active role
    await User.findByIdAndUpdate(userId, { lastActiveRole: roleId });

    // Get the role details
    const role = await Role.findById(roleId);
    if (!role) {
      console.log("[AuthController] Switch role failed: Role not found");
      return res.status(404).json({ message: "Role not found" });
    }

    // Set new permissions in cache and generate new token
    setPermissionsInCache(roleId, role.permissions);
    const accessToken = generateAccessToken(userId, roleId);

    res.status(200).json({
      accessToken,
      activeRole: {
        id: role._id,
        name: role.name,
        permissions: role.permissions,
      },
    });
  } catch (error) {
    console.error("[AuthController] Switch role error:", error);
    res.status(500).json({
      message: "Internal error",
      errorDetails: error.message,
    });}}

// Get all users with the 'doctor' role
exports.getAllDoctors = async (req, res) => {
  console.log("[AuthController] getAllDoctors called");
  try {
    // Find the Role ID for 'doctor'
    console.log("[AuthController] Finding doctor role");
    const doctorRole = await Role.findOne({ name: "sys_doctor" }); // Changed from 'doctor' to 'sys_doctor'
    if (!doctorRole) {
      console.log("[AuthController] Doctor role not found");
      return res.status(404).json({ message: "Doctor role definition not found" });
    }
    console.log("[AuthController] Found doctor role:", doctorRole._id);

    // Find users who have the doctor role - using same query as the appointmentController
    console.log("[AuthController] Finding users with doctor role");
    const doctors = await User.find({ 
      'roles.role': doctorRole._id 
    })
    .select('name email mobile doctorInfo')  // Select only needed fields
    .populate('roles.role', 'name')
    .lean(); 

    console.log(`[AuthController] Found ${doctors.length} doctors:`, doctors);
    
    if (!doctors || doctors.length === 0) {
      return res.status(404).json({ message: 'No doctors found in the system' });
    }

    res.status(200).json(doctors);
  } catch (error) {
    console.error("[AuthController] Error fetching doctors:", error);
    res
      .status(500)
      .json({ message: "Internal error", errorDetails: error.message });

  }
};
