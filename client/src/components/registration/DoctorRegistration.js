import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../../context/AuthContext";
import { validateDocForm } from "../../validations/validate";
import AuthService from "../../services/AuthService";
import Button from "../ui/button";
import Input from "../ui/input";
import "./Registration.css";

const DoctorRegistration = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    nic: "",
    mobile: "",
    password: "",
    confirmPassword: "",
    specialization: "",
    licenseNumber: "",
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [errorMsg, setErrorMsg] = useState(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuthContext();
  const navigate = useNavigate();

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Handle input blur for validation
  const handleBlur = (e) => {
    const { name } = e.target;

    setTouched((prevTouched) => ({
      ...prevTouched,
      [name]: true,
    }));

    const fieldError = validateDocForm(formData, name);
    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: fieldError,
    }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const firstErrorField = Object.keys(errors).find(
      (field) => errors[field] !== null
    );

    // If there is an error, show that error message
    if (firstErrorField) {
      alert(errors[firstErrorField]);
      setLoading(false);
      return;
    }

    // Prepare data to send
    const dataToSend = {
      name: formData.name,
      email: formData.email,
      nic: formData.nic,
      password: formData.password,
      mobile: formData.mobile,
      doctorInfo: {
        specialization: formData.specialization,
        licenseNumber: formData.licenseNumber,
      },
    };

    try {
      // Register the doctor using AuthService
      await AuthService.registerDoctor(dataToSend);

      // Registration successful, now login with credentials
      try {
        await login(formData.email, formData.password);
        navigate("/account");
      } catch (loginError) {
        console.error("Login after registration failed:", loginError);
        // If login fails after registration, redirect to login page
        setErrorMsg(
          "Registration successful. Please log in with your credentials."
        );
        setTimeout(() => navigate("/login"), 2000);
      }
    } catch (error) {
      setErrorMsg(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="registration">
      <h2 className="registration__title">Register as Doctor</h2>

      {errorMsg && <div className="registration__error">{errorMsg}</div>}

      <form onSubmit={handleRegister} className="registration__form">
        <div className="registration__section">
          <h3 className="registration__section-title">Personal Information</h3>

          <div className="registration__grid">
            <div className="registration__field">
              <label className="registration__label">Name</label>
              <Input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                onBlur={handleBlur}
                className={
                  touched.name && errors.name
                    ? "registration__input--error"
                    : ""
                }
                required
              />
              {touched.name && errors.name && (
                <div className="registration__error-text">{errors.name}</div>
              )}
            </div>

            <div className="registration__field">
              <label className="registration__label">Email</label>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                className={
                  touched.email && errors.email
                    ? "registration__input--error"
                    : ""
                }
              />
              {touched.email && errors.email && (
                <div className="registration__error-text">{errors.email}</div>
              )}
            </div>

            <div className="registration__field">
              <label className="registration__label">NIC</label>
              <Input
                type="text"
                name="nic"
                value={formData.nic}
                onChange={handleChange}
                onBlur={handleBlur}
                className={
                  touched.nic && errors.nic ? "registration__input--error" : ""
                }
              />
              {touched.nic && errors.nic && (
                <div className="registration__error-text">{errors.nic}</div>
              )}
            </div>

            <div className="registration__field">
              <label className="registration__label">Mobile</label>
              <Input
                type="tel"
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
                onBlur={handleBlur}
                className={
                  touched.mobile && errors.mobile
                    ? "registration__input--error"
                    : ""
                }
                required
              />
              {touched.mobile && errors.mobile && (
                <div className="registration__error-text">{errors.mobile}</div>
              )}
            </div>
          </div>
        </div>

        <div className="registration__section">
          <h3 className="registration__section-title">Security</h3>

          <div className="registration__grid">
            <div className="registration__field">
              <label className="registration__label">Password</label>
              <Input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                onBlur={handleBlur}
                className={
                  touched.password && errors.password
                    ? "registration__input--error"
                    : ""
                }
                required
              />
              {touched.password && errors.password && (
                <div className="registration__error-text">
                  {errors.password}
                </div>
              )}
            </div>

            <div className="registration__field">
              <label className="registration__label">Confirm Password</label>
              <Input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                onBlur={handleBlur}
                className={
                  touched.confirmPassword && errors.confirmPassword
                    ? "registration__input--error"
                    : ""
                }
                required
              />
              {touched.confirmPassword && errors.confirmPassword && (
                <div className="registration__error-text">
                  {errors.confirmPassword}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="registration__section">
          <h3 className="registration__section-title">
            Professional Information
          </h3>

          <div className="registration__grid">
            <div className="registration__field">
              <label className="registration__label">Specialization</label>
              <Input
                type="text"
                name="specialization"
                value={formData.specialization}
                onChange={handleChange}
                onBlur={handleBlur}
                className={
                  touched.specialization && errors.specialization
                    ? "registration__input--error"
                    : ""
                }
              />
              {touched.specialization && errors.specialization && (
                <div className="registration__error-text">
                  {errors.specialization}
                </div>
              )}
            </div>

            <div className="registration__field">
              <label className="registration__label">License Number</label>
              <Input
                type="text"
                name="licenseNumber"
                value={formData.licenseNumber}
                onChange={handleChange}
                onBlur={handleBlur}
                className={
                  touched.licenseNumber && errors.licenseNumber
                    ? "registration__input--error"
                    : ""
                }
                required
              />
              {touched.licenseNumber && errors.licenseNumber && (
                <div className="registration__error-text">
                  {errors.licenseNumber}
                </div>
              )}
            </div>
          </div>
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
    </div>
  );
};

export default DoctorRegistration;
