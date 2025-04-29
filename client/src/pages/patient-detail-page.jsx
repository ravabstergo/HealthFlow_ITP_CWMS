
import React, { useState, useEffect } from "react";
import { Mail, Phone, Calendar, User, MapPin, Edit } from "lucide-react";
import { NavLink, Outlet, useParams, useNavigate, useLocation } from "react-router-dom";
import { useRecordContext } from "../context/RecordContext";

const tabs = [
  { label: "Patient Information", path: "" },
  { label: "Appointment History", path: "appointments" },
  { label: "Prescriptions", path: "treatment" },
  { label: "Medical Record", path: "record" },
  { label: "Documents", path: "documents" }
];


export default function PatientDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { fetchRecord, updateRecord } = useRecordContext();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditingPersonal, setIsEditingPersonal] = useState(false);
  const [isEditingMedical, setIsEditingMedical] = useState(false);
  const [formData, setFormData] = useState({
    nic: "",
    name: {
      firstName: "",
      middleNames: [],
      lastName: "",
    },
    dateOfBirth: "",
    gender: "",
    email: "",
    phone: "",
    passportDetails: {
      number: "",
      issuedCountry: "",
    },
    allergies: [
      {
        allergenName: "",
        manifestation: "",
      },
    ],
    pastMedicalHistory: [
      {
        condition: "",
        onset: "",
        clinicalStatus: "",
      },
    ],
    regularMedications: [
      {
        medicationName: "",
        form: "",
        dosage: "",
        route: "",
        status: "",
      },
    ],
    pastSurgicalHistory: [
      {
        procedureName: "",
        date: "",
      },
    ],
    immunizations: [
      {
        vaccineName: "",
        date: "",
      },
    ],
    behavioralRiskFactors: [
      {
        riskFactorName: "",
        status: "",
        duration: "",
        statusRecordedDate: "",
      },
    ],
    healthRiskAssessment: [
      {
        assessmentType: "",
        outcome: "",
        assessmentDate: "",
      },
    ],
    activeStatus: true,
  });

  useEffect(() => {
    const fetchPatientDetails = async () => {
      try {
        const data = await fetchRecord(id);
        if (data && data.record) {
          setPatient(data.record);
          setFormData(data.record);
        } else {
          setError("Patient data not found");
        }
      } catch (err) {
        setError("Failed to fetch patient details");
        console.error("Error fetching patient:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPatientDetails();
  }, [id, fetchRecord]);

  const handlePersonalInfoChange = (e) => {
    const { name, value } = e.target;
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handlePersonalInfoSubmit = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      await updateRecord(id, formData);
      setIsEditingPersonal(false);
      setPatient(formData);
      alert("Personal information updated successfully");
    } catch (err) {
      console.error("Error updating personal information:", err);
      setError("Failed to update personal information. Please try again.");
    }
  };

  const handleChange = (e, section = null, index = null) => {
    const { name, value } = e.target;

    if (section && index !== null) {
      // Handle nested array fields
      setFormData((prev) => ({
        ...prev,
        [section]: prev[section].map((item, i) =>
          i === index ? { ...item, [name]: value } : item
        ),
      }));
    } else if (section) {
      // Handle nested object fields
      setFormData((prev) => ({
        ...prev,
        [section]: { ...prev[section], [name]: value },
      }));
    } else if (name.includes(".")) {
      // Handle dot notation for nested fields
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      // Handle top-level fields
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setError(null);
      await updateRecord(id, formData);
      setIsEditingMedical(false);
      setPatient(formData);
      // Optional success notification
      alert("Patient record updated successfully");
    } catch (err) {
      console.error("Error updating patient record:", err);
      setError("Failed to update patient record. Please try again.");
    }
  };

  const handleCreateEncounter = () => {
    // Implementation for creating a new encounter
    navigate(`/encounters/new/${id}`);
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-600">Error: {error}</div>;
  if (!patient) return <div className="p-6">Patient not found</div>;


  return (
    <div className="bg-white rounded-lg shadow-sm">
      {/* Patient Info Header section */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center">
            <div className="w-16 h-16 rounded-full overflow-hidden mr-4 bg-gray-200 flex items-center justify-center">
              <User className="w-8 h-8 text-gray-500" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold">
                {`${patient.name?.firstName || ''} ${patient.name?.lastName || ''}`}
              </h2>
              <div className="text-sm text-gray-500">Patient ID: {patient._id}</div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button 
              className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center"
              onClick={() => setIsEditingPersonal(!isEditingPersonal)}
            >
              <Edit className="w-4 h-4 mr-1" />
              {isEditingPersonal ? "Cancel Edit" : "Edit"}
            </button>
            <button 
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              onClick={handleCreateEncounter}
            >
              Create Encounter
            </button>
          </div>
        </div>

        {/* Contact Information */}
        {isEditingPersonal ? (
          <form onSubmit={handlePersonalInfoSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  name="name.firstName"
                  value={formData.name?.firstName || ""}
                  onChange={handlePersonalInfoChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  name="name.lastName"
                  value={formData.name?.lastName || ""}
                  onChange={handlePersonalInfoChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email || ""}
                  onChange={handlePersonalInfoChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone || ""}
                  onChange={handlePersonalInfoChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date of Birth
                </label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth || ""}
                  onChange={handlePersonalInfoChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gender
                </label>
                <select
                  name="gender"
                  value={formData.gender || ""}
                  onChange={handlePersonalInfoChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setIsEditingPersonal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Save Changes
              </button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center text-gray-600">
              <Mail className="w-4 h-4 mr-2 text-gray-400" />
              <span>{patient.email || 'No email provided'}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <Phone className="w-4 h-4 mr-2 text-gray-400" />
              <span>{patient.phone || 'No phone provided'}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <Calendar className="w-4 h-4 mr-2 text-gray-400" />
              <span>{patient.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString() : 'No DOB provided'}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <User className="w-4 h-4 mr-2 text-gray-400" />
              <span>{patient.gender || 'No gender provided'}</span>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex">
          {tabs.map(({ label, path }) => (
            <NavLink
              key={path}

              to={path}
              end={path === ""}


              className={({ isActive }) =>
                `px-6 py-3 text-sm font-medium ${
                  isActive
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </div>
      </div>

      {/* Dynamic tab content */}
      <div className="p-6">
        <Outlet context={{ 
          patient, 
          isEditing: isEditingMedical, 
          setIsEditing: setIsEditingMedical, 
          formData, 
          setFormData, 
          handleSubmit 
        }} />
      </div>
    </div>
  );
}