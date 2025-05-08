import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../../context/AuthContext";
import AuthService from "../../services/AuthService";
import PreRegistrationService from "../../services/PreRegistrationService";
import Button from "../ui/button";
import Input from "../ui/input";
import "./Registration.css";

const StaffRegistration = () => {
  // State for email verification step
  const [emailVerified, setEmailVerified] = useState(false);
  const [emailVerifying, setEmailVerifying] = useState(false);

  // Form fields
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");

  // UI state
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuthContext();

  // Verify if email has pre-registrations
  const handleVerifyEmail = async (e) => {
    e.preventDefault();
    setError(null);

    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }

    setEmailVerifying(true);

    try {
      // Call API to check if this email has pre-registrations
      const response = await PreRegistrationService.checkEmailPreRegistration(
        email
      );

      if (response.hasPreRegistration) {
        setEmailVerified(true);
      } else {
        setError(
          "This email is not pre-registered to join the system. Please contact an administrator."
        );
      }
    } catch (error) {
      setError(
        error.message || "Failed to verify email access. Please try again."
      );
    } finally {
      setEmailVerifying(false);
    }
  };

  // Handle the full registration form submission
  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);

    // Validate form
    const errorMessage = validateStaffForm({ name, email, mobile, password });
    if (errorMessage) {
      setError(errorMessage);
      return;
    }

    setLoading(true);

    // Prepare data to send
    const formData = {
      name,
      email,
      mobile,
      password,
      role: "staff", // Adding explicit role
    };

    try {
      // Register the staff member using AuthService
      await AuthService.registerStaff(formData);

      // Registration successful, now login
      try {
        await login(email, password);
        navigate("/account");
      } catch (loginError) {
        console.error("Login after registration failed:", loginError);
        // If login fails after registration, redirect to login page
        setError(
          "Registration successful. Please log in with your credentials."
        );
        setTimeout(() => navigate("/login"), 2000);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Validation function for staff registration
  const validateStaffForm = ({ name, email, mobile, password }) => {
    if (!name) return "Name is required";
    if (!email) return "Email is required";
    if (!mobile || !mobile.match(/^\d{10}$/))
      return "Mobile number must be 10 digits";
    if (!password || password.length < 6)
      return "Password must be at least 6 characters";
    return null; // No errors
  };

  return (
    <div className="registration">
      <h2 className="registration__title">Register as Staff</h2>

      {error && <div className="registration__error">{error}</div>}

      {!emailVerified ? (
        // Email verification step
        <form onSubmit={handleVerifyEmail} className="registration__form">
          <div className="registration__field">
            <label className="registration__label">Email</label>
            <Input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="registration__actions">
            <Button
              type="submit"
              variant="primary"
              disabled={emailVerifying}
              className="registration__submit-btn"
            >
              {emailVerifying ? "Verifying..." : "Verify Email"}
            </Button>

            <Button
              type="button"
              variant="text"
              onClick={() => navigate("/login")}
              className="registration__link-btn"
            >
              Have an account? Login here
            </Button>
          </div>
        </form>
      ) : (
        // Full registration form after email is verified
        <form onSubmit={handleRegister} className="registration__form">
          <div className="registration__field">
            <label className="registration__label">Email</label>
            <Input
              type="email"
              name="email"
              value={email}
              disabled={true}
              className="registration__input--verified"
            />
            <span className="registration__verified-badge">Verified</span>
          </div>

          <div className="registration__field">
            <label className="registration__label">Name</label>
            <Input
              type="text"
              name="name"
              placeholder="Enter name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="registration__field">
            <label className="registration__label">Mobile</label>
            <Input
              type="text"
              name="mobile"
              placeholder="Enter mobile number"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              required
            />
          </div>

          <div className="registration__field">
            <label className="registration__label">Password</label>
            <Input
              type="password"
              name="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="registration__actions">
            <Button
              type="submit"
              variant="primary"
              disabled={loading}
              className="registration__submit-btn"
            >
              {loading ? "Registering..." : "Register"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};

export default StaffRegistration;
