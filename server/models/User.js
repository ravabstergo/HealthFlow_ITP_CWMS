//User.js model
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    nic: { type: String, default: undefined },
    email: { type: String, default: undefined },
    mobile: { type: String, required: true },
    password: { type: String, required: true },
    roles: [
      {
        role: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Role",
          required: true,
        },
        assignedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: false, // Not required for self-registered roles (e.g., admin, patient)
        },
      },
    ],
    lastActiveRole: { type: mongoose.Schema.Types.ObjectId, ref: "Role" },
    // Subdocument for Doctor
    doctorInfo: {
      specialization: { type: String },
      licenseNumber: { type: String },
      // Subscription: { type: Schema.Types.ObjectId, ref: "Subscription" },
    },
  },
  { timestamps: true }
);

userSchema.index(
  { email: 1 },
  {
    unique: true,
    sparse: true,
    partialFilterExpression: { email: { $exists: true, $ne: null } },
  }
);

userSchema.index(
  { nic: 1 },
  {
    unique: true,
    sparse: true,
    partialFilterExpression: { nic: { $exists: true, $ne: null } },
  }
);

const User = mongoose.model("User", userSchema);

module.exports = User;