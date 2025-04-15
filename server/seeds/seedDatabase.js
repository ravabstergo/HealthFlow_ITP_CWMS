// seeds/seedDatabase.js
const mongoose = require("mongoose");
const Role = require("../models/Role");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");

dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected...");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

// Seed roles
const seedRoles = async () => {
  try {
    // Define roles and permissions
    const roles = [
      {
        name: "sys_admin",
        permissions: [
          { entity: "user", action: "view", scope: "all" },
          { entity: "user", action: "delete", scope: "all" },
          { entity: "user", action: "update", scope: "own" },
          { entity: "role", action: "create", scope: "all" },
          { entity: "role", action: "view", scope: "all" },
          { entity: "role", action: "delete", scope: "all" },
        ],
        isSystem: true,
      },
      {
        name: "sys_patient",
        permissions: [
          { entity: "user", action: "view", scope: "own" },
          { entity: "user", action: "delete", scope: "own" },
          { entity: "user", action: "update", scope: "own" },
          { entity: "record", action: "view", scope: "own" },
        ],
        isSystem: true,
      },
      {
        name: "sys_doctor",
        permissions: [
          { entity: "user", action: "view", scope: "own" },
          { entity: "user", action: "delete", scope: "own" },
          { entity: "user", action: "update", scope: "own" },
          { entity: "role", action: "create", scope: "own" },
          { entity: "role", action: "view", scope: "own" },
          { entity: "role", action: "delete", scope: "own" },
          { entity: "record", action: "create", scope: "own" },
          { entity: "record", action: "update", scope: "own" },
          { entity: "record", action: "delete", scope: "own" },
          { entity: "record", action: "view", scope: "own" },
        ],
        isSystem: true,
      },
    ];
    // Clear existing roles
    await Role.deleteMany({});
    console.log("Existing roles cleared.");

    // Insert new roles
    await Role.insertMany(roles);
    console.log("System roles seeded successfully.");
  } catch (error) {
    console.error("Error seeding roles:", error.message);
  } finally {
    mongoose.connection.close();
  }
};
const seedUsers = async () => {
  try {
    // Find roles by name
    const sysAdminRole = await Role.findOne({ name: "sys_admin" });
    const sysDoctorRole = await Role.findOne({ name: "sys_doctor" });
    const sysPatientRole = await Role.findOne({ name: "sys_patient" });

    if (!sysAdminRole || !sysDoctorRole || !sysPatientRole) {
      throw new Error("Required roles not found. Please seed roles first.");
    }

    // Clear existing users
    await User.deleteMany({});
    console.log("Existing users cleared.");

    try {
      const db = mongoose.connection.db;
      const usersCollection = db.collection("users");

      await usersCollection
        .dropIndex("nic_1")
        .catch((err) =>
          console.log("nic_1 index not found or already dropped.")
        );
      await usersCollection
        .dropIndex("email_1")
        .catch((err) =>
          console.log("email_1 index not found or already dropped.")
        );
      console.log("Indexes dropped successfully");
    } catch (err) {
      console.error("Error dropping indexes:", err);
    }
    // Hash passwords
    const hashedPassword = await bcrypt.hash("password123", 10);

    // Create admin user
    const adminUser = new User({
      name: "Admin",
      email: "admin@example.com",
      mobile: "1234567890",
      password: hashedPassword,
      roles: [{ role: sysAdminRole._id }],
      lastActiveRole: sysAdminRole._id,
    });

    // Create doctor users
    const doctorUsers = [
      new User({
        name: "John Doe",
        email: "doctor1@example.com",
        mobile: "1234567891",
        password: hashedPassword,
        roles: [{ role: sysDoctorRole._id }],
        lastActiveRole: sysDoctorRole._id,
        doctorInfo: {
          specialization: "Cardiology",
          licenseNumber: "DOC12345",
        },
      }),
      new User({
        name: "Jane Smith",
        email: "doctor2@example.com",
        mobile: "1234567892",
        password: hashedPassword,
        roles: [{ role: sysDoctorRole._id }],
        lastActiveRole: sysDoctorRole._id,
        doctorInfo: {
          specialization: "Neurology",
          licenseNumber: "DOC67890",
        },
      }),
    ];

    // Create patient users
    const patientUsers = [
      new User({
        name: "Patient One",
        email: "patient1@example.com",
        mobile: "1234567893",
        password: hashedPassword,
        roles: [{ role: sysPatientRole._id }],
        lastActiveRole: sysPatientRole._id,
      }),
      new User({
        name: "Patient Two",
        nic: "123456789101",
        mobile: "1234567894",
        password: hashedPassword,
        roles: [{ role: sysPatientRole._id }],
        lastActiveRole: sysPatientRole._id,
      }),
    ];

    // Save all users to the database
    await adminUser.save();
    console.log("Admin user seeded successfully.");

    await User.insertMany(doctorUsers);
    console.log("Doctor users seeded successfully.");

    await User.insertMany(patientUsers);
    console.log("Patient users seeded successfully.");
  } catch (error) {
    console.error("Error seeding users:", error.message);
  } finally {
    mongoose.connection.close();
  }
};

// Run the seed script
const runSeeder = async () => {
  await connectDB();
  await seedRoles();
  await connectDB();
  await seedUsers();
};

runSeeder();
