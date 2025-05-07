import { useState } from "react";
import PatientRegistration from "../components/registration/PatientRegistration";
import DoctorRegistration from "../components/registration/DoctorRegistration";
import StaffRegistration from "../components/registration/StaffRegistration";
import "./RegisterPage.css";

const RegisterPage = () => {
  const [primaryRole, setPrimaryRole] = useState(null);
  const [medicalRole, setMedicalRole] = useState(null);

  const handleSelection = (type, category) => {
    if (category === "primary") {
      setPrimaryRole(type);
      setMedicalRole(null); // Reset medical role when switching primary role
    } else {
      setMedicalRole(type);
    }
  };

  return (
    <div className="register-page">
      <div className="register-page__header">
        <center>
          <h1 className="register-page__title">Register</h1>
        </center>
      </div>

      <div className="register-page__card">
        <div className="register-page__content">
          {/* Primary Selection - Always Visible */}
          <div className="register-page__section">
            <h3 className="register-page__section-title">Account Type</h3>
            <div className="register-page__radio-group">
              <p className="register-page__question">
                Are you a patient or medical staff?
              </p>

              <label className="register-page__radio-label">
                <div className="register-page__radio-button">
                  <input
                    type="radio"
                    name="primary"
                    className="register-page__radio-input"
                    checked={primaryRole === "patient"}
                    onChange={() => handleSelection("patient", "primary")}
                  />
                  <span className="register-page__radio-custom"></span>
                </div>
                <span className="register-page__radio-text">
                  I am a patient
                </span>
              </label>

              <label className="register-page__radio-label">
                <div className="register-page__radio-button">
                  <input
                    type="radio"
                    name="primary"
                    className="register-page__radio-input"
                    checked={primaryRole === "medicalStaff"}
                    onChange={() => handleSelection("medicalStaff", "primary")}
                  />
                  <span className="register-page__radio-custom"></span>
                </div>
                <span className="register-page__radio-text">
                  I am part of the medical staff
                </span>
              </label>
            </div>
          </div>

          {/* Medical Staff Sub-selection */}
          {primaryRole === "medicalStaff" && (
            <div className="register-page__section">
              <div className="register-page__radio-group">
                <p className="register-page__question">What is your role?</p>

                <label className="register-page__radio-label">
                  <div className="register-page__radio-button">
                    <input
                      type="radio"
                      name="medicalRole"
                      className="register-page__radio-input"
                      checked={medicalRole === "doctor"}
                      onChange={() => handleSelection("doctor", "medical")}
                    />
                    <span className="register-page__radio-custom"></span>
                  </div>
                  <span className="register-page__radio-text">
                    I am a doctor and want to register my practice
                  </span>
                </label>

                <label className="register-page__radio-label">
                  <div className="register-page__radio-button">
                    <input
                      type="radio"
                      name="medicalRole"
                      className="register-page__radio-input"
                      checked={medicalRole === "staff"}
                      onChange={() => handleSelection("staff", "medical")}
                    />
                    <span className="register-page__radio-custom"></span>
                  </div>
                  <span className="register-page__radio-text">
                    I work for a doctor using this system
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* Registration Forms */}
          <div className="register-page__form-container">
            {primaryRole === "patient" && <PatientRegistration />}
            {medicalRole === "doctor" && <DoctorRegistration />}
            {medicalRole === "staff" && <StaffRegistration />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
