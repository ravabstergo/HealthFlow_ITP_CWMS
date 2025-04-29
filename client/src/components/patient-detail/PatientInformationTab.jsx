import Card from "../ui/card";
import { useOutletContext } from "react-router-dom";
import { Edit } from "lucide-react";

export default function PatientInformationTab() {

  const { patient, isEditing, setIsEditing, formData, setFormData, handleSubmit } = useOutletContext();

  const handleMedicalInfoChange = (e, section = null, index = null) => {
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

  const renderSection = (title, items, renderItem, sectionName) => (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold">{title}</h3>
        {isEditing && (
          <button
            onClick={() => {
              // Add a new empty item to the section
              setFormData((prev) => ({
                ...prev,
                [sectionName]: [...(prev[sectionName] || []), {}],
              }));
            }}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            Add New
          </button>
        )}
      </div>
      {isEditing ? (
        <div className="space-y-3">
          {formData[sectionName]?.map((item, index) => (
            <div key={index} className="bg-gray-50 p-3 rounded-md">
              {renderItem(item, index, true)}
            </div>
          ))}
        </div>
      ) : items && items.length > 0 ? (
        <div className="space-y-3">
          {items.map((item, index) => renderItem(item, index, false))}
        </div>
      ) : (
        <p className="text-gray-500">No {title.toLowerCase()} recorded</p>
      )}
    </div>
  );

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Information</h1>
      <Card>
      <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Medical Information</h2>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center"
        >
          <Edit className="w-4 h-4 mr-1" />
          {isEditing ? "Cancel Edit" : "Edit"}
        </button>
      </div>

      {isEditing ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Allergies */}
          {renderSection(
            "Allergies",
            patient.allergies,
            (allergy, index, isEditing) => (
              <div key={index}>
                {isEditing ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      name="allergenName"
                      value={allergy.allergenName || ""}
                      onChange={(e) => handleMedicalInfoChange(e, "allergies", index)}
                      placeholder="Allergen Name"
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                    <input
                      type="text"
                      name="manifestation"
                      value={allergy.manifestation || ""}
                      onChange={(e) => handleMedicalInfoChange(e, "allergies", index)}
                      placeholder="Manifestation"
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>
                ) : (
                  <>
                    <p className="font-medium">{allergy.allergenName}</p>
                    <p className="text-sm text-gray-600">{allergy.manifestation}</p>
                  </>
                )}
              </div>
            ),
            "allergies"
          )}

          {/* Past Medical History */}
          {renderSection(
            "Past Medical History",
            patient.pastMedicalHistory,
            (condition, index, isEditing) => (
              <div key={index}>
                {isEditing ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      name="condition"
                      value={condition.condition || ""}
                      onChange={(e) => handleMedicalInfoChange(e, "pastMedicalHistory", index)}
                      placeholder="Condition"
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                    <input
                      type="text"
                      name="onset"
                      value={condition.onset || ""}
                      onChange={(e) => handleMedicalInfoChange(e, "pastMedicalHistory", index)}
                      placeholder="Onset"
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                    <input
                      type="text"
                      name="clinicalStatus"
                      value={condition.clinicalStatus || ""}
                      onChange={(e) => handleMedicalInfoChange(e, "pastMedicalHistory", index)}
                      placeholder="Clinical Status"
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>
                ) : (
                  <>
                    <p className="font-medium">{condition.condition}</p>
                    <div className="text-sm text-gray-600">
                      <p>Onset: {condition.onset}</p>
                      <p>Status: {condition.clinicalStatus}</p>
                    </div>
                  </>
                )}
              </div>
            ),
            "pastMedicalHistory"
          )}

          {/* Regular Medications */}
          {renderSection(
            "Regular Medications",
            patient.regularMedications,
            (medication, index, isEditing) => (
              <div key={index}>
                {isEditing ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      name="medicationName"
                      value={medication.medicationName || ""}
                      onChange={(e) => handleMedicalInfoChange(e, "regularMedications", index)}
                      placeholder="Medication Name"
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                    <input
                      type="text"
                      name="form"
                      value={medication.form || ""}
                      onChange={(e) => handleMedicalInfoChange(e, "regularMedications", index)}
                      placeholder="Form"
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                    <input
                      type="text"
                      name="dosage"
                      value={medication.dosage || ""}
                      onChange={(e) => handleMedicalInfoChange(e, "regularMedications", index)}
                      placeholder="Dosage"
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                    <input
                      type="text"
                      name="route"
                      value={medication.route || ""}
                      onChange={(e) => handleMedicalInfoChange(e, "regularMedications", index)}
                      placeholder="Route"
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                    <input
                      type="text"
                      name="status"
                      value={medication.status || ""}
                      onChange={(e) => handleMedicalInfoChange(e, "regularMedications", index)}
                      placeholder="Status"
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>
                ) : (
                  <>
                    <p className="font-medium">{medication.medicationName}</p>
                    <div className="text-sm text-gray-600">
                      <p>Form: {medication.form}</p>
                      <p>Dosage: {medication.dosage}</p>
                      <p>Route: {medication.route}</p>
                      <p>Status: {medication.status}</p>
                    </div>
                  </>
                )}
              </div>
            ),
            "regularMedications"
          )}

          {/* Past Surgical History */}
          {renderSection(
            "Past Surgical History",
            patient.pastSurgicalHistory,
            (surgery, index, isEditing) => (
              <div key={index}>
                {isEditing ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      name="procedureName"
                      value={surgery.procedureName || ""}
                      onChange={(e) => handleMedicalInfoChange(e, "pastSurgicalHistory", index)}
                      placeholder="Procedure Name"
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                    <input
                      type="text"
                      name="date"
                      value={surgery.date || ""}
                      onChange={(e) => handleMedicalInfoChange(e, "pastSurgicalHistory", index)}
                      placeholder="Date"
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>
                ) : (
                  <>
                    <p className="font-medium">{surgery.procedureName}</p>
                    <p className="text-sm text-gray-600">Date: {surgery.date}</p>
                  </>
                )}
              </div>
            ),
            "pastSurgicalHistory"
          )}

          {/* Immunizations */}
          {renderSection(
            "Immunizations",
            patient.immunizations,
            (vaccine, index, isEditing) => (
              <div key={index}>
                {isEditing ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      name="vaccineName"
                      value={vaccine.vaccineName || ""}
                      onChange={(e) => handleMedicalInfoChange(e, "immunizations", index)}
                      placeholder="Vaccine Name"
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                    <input
                      type="text"
                      name="date"
                      value={vaccine.date || ""}
                      onChange={(e) => handleMedicalInfoChange(e, "immunizations", index)}
                      placeholder="Date"
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>
                ) : (
                  <>
                    <p className="font-medium">{vaccine.vaccineName}</p>
                    <p className="text-sm text-gray-600">Date: {vaccine.date}</p>
                  </>
                )}
              </div>
            ),
            "immunizations"
          )}

          {/* Behavioral Risk Factors */}
          {renderSection(
            "Behavioral Risk Factors",
            patient.behavioralRiskFactors,
            (risk, index, isEditing) => (
              <div key={index}>
                {isEditing ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      name="riskFactorName"
                      value={risk.riskFactorName || ""}
                      onChange={(e) => handleMedicalInfoChange(e, "behavioralRiskFactors", index)}
                      placeholder="Risk Factor Name"
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                    <input
                      type="text"
                      name="status"
                      value={risk.status || ""}
                      onChange={(e) => handleMedicalInfoChange(e, "behavioralRiskFactors", index)}
                      placeholder="Status"
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                    <input
                      type="text"
                      name="duration"
                      value={risk.duration || ""}
                      onChange={(e) => handleMedicalInfoChange(e, "behavioralRiskFactors", index)}
                      placeholder="Duration"
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                    <input
                      type="text"
                      name="statusRecordedDate"
                      value={risk.statusRecordedDate || ""}
                      onChange={(e) => handleMedicalInfoChange(e, "behavioralRiskFactors", index)}
                      placeholder="Status Recorded Date"
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>
                ) : (
                  <>
                    <p className="font-medium">{risk.riskFactorName}</p>
                    <div className="text-sm text-gray-600">
                      <p>Status: {risk.status}</p>
                      <p>Duration: {risk.duration}</p>
                      <p>Status Recorded: {risk.statusRecordedDate}</p>
                    </div>
                  </>
                )}
              </div>
            ),
            "behavioralRiskFactors"
          )}

          {/* Health Risk Assessment */}
          {renderSection(
            "Health Risk Assessment",
            patient.healthRiskAssessment,
            (assessment, index, isEditing) => (
              <div key={index}>
                {isEditing ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      name="assessmentType"
                      value={assessment.assessmentType || ""}
                      onChange={(e) => handleMedicalInfoChange(e, "healthRiskAssessment", index)}
                      placeholder="Assessment Type"
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                    <input
                      type="text"
                      name="outcome"
                      value={assessment.outcome || ""}
                      onChange={(e) => handleMedicalInfoChange(e, "healthRiskAssessment", index)}
                      placeholder="Outcome"
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                    <input
                      type="text"
                      name="assessmentDate"
                      value={assessment.assessmentDate || ""}
                      onChange={(e) => handleMedicalInfoChange(e, "healthRiskAssessment", index)}
                      placeholder="Assessment Date"
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>
                ) : (
                  <>
                    <p className="font-medium">{assessment.assessmentType}</p>
                    <div className="text-sm text-gray-600">
                      <p>Outcome: {assessment.outcome}</p>
                      <p>Assessment Date: {assessment.assessmentDate}</p>
                    </div>
                  </>
                )}
              </div>
            ),
            "healthRiskAssessment"
          )}

          {isEditing && (
            <div className="flex justify-end space-x-2 mt-6">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
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
          )}
        </form>
      ) : (
        <>
          {/* Allergies */}
          {renderSection(
            "Allergies",
            patient.allergies,
            (allergy, index) => (
              <div key={index} className="bg-gray-50 p-3 rounded-md">
                <p className="font-medium">{allergy.allergenName}</p>
                <p className="text-sm text-gray-600">{allergy.manifestation}</p>
              </div>
            ),
            "allergies"
          )}

          {/* Past Medical History */}
          {renderSection(
            "Past Medical History",
            patient.pastMedicalHistory,
            (condition, index) => (
              <div key={index} className="bg-gray-50 p-3 rounded-md">
                <p className="font-medium">{condition.condition}</p>
                <div className="text-sm text-gray-600">
                  <p>Onset: {condition.onset}</p>
                  <p>Status: {condition.clinicalStatus}</p>
                </div>
              </div>
            ),
            "pastMedicalHistory"
          )}

          {/* Regular Medications */}
          {renderSection(
            "Regular Medications",
            patient.regularMedications,
            (medication, index) => (
              <div key={index} className="bg-gray-50 p-3 rounded-md">
                <p className="font-medium">{medication.medicationName}</p>
                <div className="text-sm text-gray-600">
                  <p>Form: {medication.form}</p>
                  <p>Dosage: {medication.dosage}</p>
                  <p>Route: {medication.route}</p>
                  <p>Status: {medication.status}</p>
                </div>
              </div>
            ),
            "regularMedications"
          )}

          {/* Past Surgical History */}
          {renderSection(
            "Past Surgical History",
            patient.pastSurgicalHistory,
            (surgery, index) => (
              <div key={index} className="bg-gray-50 p-3 rounded-md">
                <p className="font-medium">{surgery.procedureName}</p>
                <p className="text-sm text-gray-600">Date: {surgery.date}</p>
              </div>
            ),
            "pastSurgicalHistory"
          )}

          {/* Immunizations */}
          {renderSection(
            "Immunizations",
            patient.immunizations,
            (vaccine, index) => (
              <div key={index} className="bg-gray-50 p-3 rounded-md">
                <p className="font-medium">{vaccine.vaccineName}</p>
                <p className="text-sm text-gray-600">Date: {vaccine.date}</p>
              </div>
            ),
            "immunizations"
          )}

          {/* Behavioral Risk Factors */}
          {renderSection(
            "Behavioral Risk Factors",
            patient.behavioralRiskFactors,
            (risk, index) => (
              <div key={index} className="bg-gray-50 p-3 rounded-md">
                <p className="font-medium">{risk.riskFactorName}</p>
                <div className="text-sm text-gray-600">
                  <p>Status: {risk.status}</p>
                  <p>Duration: {risk.duration}</p>
                  <p>Status Recorded: {risk.statusRecordedDate}</p>
                </div>
              </div>
            ),
            "behavioralRiskFactors"
          )}

          {/* Health Risk Assessment */}
          {renderSection(
            "Health Risk Assessment",
            patient.healthRiskAssessment,
            (assessment, index) => (
              <div key={index} className="bg-gray-50 p-3 rounded-md">
                <p className="font-medium">{assessment.assessmentType}</p>
                <div className="text-sm text-gray-600">
                  <p>Outcome: {assessment.outcome}</p>
                  <p>Assessment Date: {assessment.assessmentDate}</p>
                </div>
              </div>
            ),
            "healthRiskAssessment"
          )}
        </>
      )}
    </div>

      </Card>
    </div>
  );
}
