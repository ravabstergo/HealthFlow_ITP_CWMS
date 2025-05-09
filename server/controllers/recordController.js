const mongoose = require("mongoose");
const Patient = require("../models/Patient");

exports.createPatientRecord = async (req, res) => {
  try {
    const doctorId = req.user.id;
    console.log("Inside record controller: Create patient record");

    // Get the doctor ID from the authenticated user
    if (!mongoose.isValidObjectId(doctorId)) {
      console.log("Invalid doctor ID:", doctorId);
      return res.status(400).json({ message: "Invalid doctor ID" });
    }

    console.log("Valid doctor ID:", doctorId);

    // Destructure the request body
    const { name, dateOfBirth, gender, email, phone, ...formData } = req.body;

    console.log("Request body received:", req.body);

    // Prepare patient record
    const patientRecord = {
      ...req.body,
      doctor: new mongoose.Types.ObjectId(doctorId),
      activeStatus: true,
    };

    console.log("Patient record prepared:", patientRecord);

    // Create and save new patient
    const newPatient = new Patient(patientRecord);
    const savedPatient = await newPatient.save();

    console.log("Patient record created successfully:", savedPatient);
    // Respond with success
    res.status(201).json({
      message: "Patient record created successfully",
      record: savedPatient,
    });
  } catch (error) {
    // Handle mongoose validation errors
    if (error instanceof mongoose.Error.ValidationError) {
      console.error("Validation error:", error);
      return res.status(400).json({
        message: "Validation Error",
        errors: Object.values(error.errors).map((err) => err.message),
      });
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      console.log("Duplicate Fields:", Object.keys(error.keyPattern || {}));
      return res.status(409).json({
        message: "A patient with similar unique identifiers already exists",
        duplicateFields: Object.keys(error.keyPattern || {}),
      });
    }

    // Log and respond with generic server error
    console.error("Error creating patient record:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

exports.getRecordsByDoctor = async (req, res) => {
  try {
    console.log("Inside getRecordsByDoctor controller");
    const doctorId = req.user.id;
    console.log("Doctor ID:", doctorId);

    // Find all patient records for this doctor
    const patients = await Patient.find({ doctor: doctorId })
      .select("-__v")
      .lean();

    console.log("Found patients:", patients);

    const getFullName = (patient) => {
      const fullNameParts = [
        patient.name.firstName,
        ...(patient.name.middleNames || []),
        patient.name.lastName,
      ];
      return fullNameParts.filter(Boolean).join(" ");
    };

    // Transform data if needed (optional)
    const transformedPatients = patients.map((patient) => ({
      _id: patient._id,
      fullName: getFullName(patient),
      dateOfBirth: patient.dateOfBirth,
      gender: patient.gender,
      phone: patient.phone,
      activeStatus: patient.activeStatus,
      createdAt: patient.createdAt,
    }));

    console.log("Transformed patient data:", transformedPatients);
    res.json(transformedPatients);

    console.log("Transformed patient data was sent");
  } catch (error) {
    console.error("Error fetching patient records:", error);
    res.status(500).json({
      message: "Error fetching patient records",
      error: error.message,
    });
  }
};

exports.deleteRecord = async (req, res) => {
  const { recordId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(recordId)) {
    return res.status(404).json({ error: "No such ehr" });
  }

  const deletedRecord = await Patient.findOneAndDelete({ _id: recordId });

  if (!deletedRecord) {
    return res.status(404).json({ error: "No such ehr" });
  }
  res.status(200).json({
    message: "Record and associated encounters deleted successfully",
    deletedRecord,
    // deletedEncountersCount: deletedEncounters.deletedCount,
  });
};

exports.updateRecord = async (req, res) => {
  const { recordId } = req.params;
  const { record } = req.body;

  if (!mongoose.Types.ObjectId.isValid(recordId)) {
    return res.status(404).json({ error: "No such ehr" });
  }

  try {
    let updatedPatient = null;
    if (record) {
      updatedPatient = await Patient.findByIdAndUpdate(
        recordId,
        { ...record },
        { new: true }
      );
      if (!updatedPatient) {
        return res.status(404).json({ error: "Patient not found" });
      }
    }
    res.status(200).json({
      record: updatedPatient,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getRecordById = async (req, res) => {
  try {
    const { recordId } = req.params;
    console.log("Fetching patient record by ID:", recordId);

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(recordId)) {
      console.log("Invalid patient record ID:", recordId);
      return res.status(400).json({
        message: "Invalid patient record ID",
        error: true,
      });
    }

    // Find patient by ID and populate doctor details
    const patient = await Patient.findById(recordId).lean(); // Convert to plain JavaScript object for easier manipulation

    // If no patient found
    if (!patient) {
      console.log("Patient not found for ID:", id);
      return res.status(404).json({
        message: "Patient record not found",
        error: true,
      });
    }

    // Prepare a comprehensive response
    const patientRecord = {
      id: patient._id,
      fullName: `${patient.name.firstName} ${patient.name.middleNames.join(
        " "
      )} ${patient.name.lastName}`,
      firstName: patient.name.firstName,
      middleNames: patient.name.middleNames,
      lastName: patient.name.lastName,
      searchName: patient.searchName,
      dateOfBirth: patient.dateOfBirth,
      gender: patient.gender,
      email: patient.email,
      phone: patient.phone,
      nic: patient.nic,
      activeStatus: patient.activeStatus,
      passportInfo: patient.passportDetails
        ? {
            number: patient.passportDetails.number,
            issuedCountry: patient.passportDetails.issuedCountry,
          }
        : null,

      allergies: patient.allergies.map((allergy) => ({
        allergenName: allergy.allergenName,
        manifestation: allergy.manifestation,
      })),

      pastMedicalConditions: patient.pastMedicalHistory.map((condition) => ({
        condition: condition.condition,
        onset: condition.onset,
        clinicalStatus: condition.clinicalStatus,
      })),

      regularMedications: patient.regularMedications.map((med) => ({
        medicationName: med.medicationName,
        form: med.form,
        dosage: med.dosage,
        route: med.route,
        status: med.status,
      })),

      surgicalHistory: patient.pastSurgicalHistory.map((surgery) => ({
        procedureName: surgery.procedureName,
        date: surgery.date,
      })),

      immunizations: patient.immunizations.map((vaccine) => ({
        vaccineName: vaccine.vaccineName,
        date: vaccine.date,
      })),

      behavioralRiskFactors: patient.behavioralRiskFactors.map((risk) => ({
        riskFactorName: risk.riskFactorName,
        status: risk.status,
        duration: risk.duration,
        statusRecordedDate: risk.statusRecordedDate,
      })),

      healthRiskAssessments: patient.healthRiskAssessment.map((assessment) => ({
        assessmentType: assessment.assessmentType,
        outcome: assessment.outcome,
        assessmentDate: assessment.assessmentDate,
      })),
    };

    console.log("Patient record:", patientRecord);
    res.status(200).json({
      message: "Patient record retrieved successfully",
      record: patientRecord,
      error: false,
    });
  } catch (error) {
    console.error("Error retrieving patient record:", error);
    res.status(500).json({
      message: "Internal server error while retrieving patient record",
      error: true,
      details: process.env.NODE_ENV === "development" ? error.message : null,
    });
  }
};

exports.searchPatients = async (req, res) => {
  try {
    const { query } = req.query;

    console.log("Searching for patients with query:", query);

    if (!query) {
      console.log("No query provided for search");
      return res.status(400).json({
        message: "Search query is required",
        error: true,
      });
    }

    const patients = await Patient.find({
      searchName: { $regex: query.toLowerCase(), $options: "i" },
      doctor: req.user._id, // Ensure only doctor's own patients are returned
    })
      .select("name email phone dateOfBirth")
      .limit(10); // Limit to 10 results

    console.log("Search results:", patients);

    res.status(200).json({
      message: "Patient search completed",
      data: patients.map((patient) => ({
        id: patient._id,
        fullName: `${patient.name.firstName} ${patient.name.middleNames.join(
          " "
        )} ${patient.name.lastName}`,
        email: patient.email,
        phone: patient.phone,
        dateOfBirth: patient.dateOfBirth,
        nic: patient.nic,
      })),
      error: false,
    });
  } catch (error) {
    console.error("Error searching patients:", error);
    res.status(500).json({
      message: "Internal server error during patient search",
      error: true,
    });
  }
};

exports.findPatientByUser = async (req, res) => {
  try {
    const { email, nic } = req.query;
    console.log("Finding patient by user details:", { email, nic });

    if (!email && !nic) {
      console.log("No email or NIC provided");
      return res.status(400).json({ message: "Email or NIC is required" });
    }

    const query = {};
    if (email) {
      console.log("Searching by email:", email);
      query.email = email;
    }
    if (nic) {
      console.log("Searching by NIC:", nic);
      query.nic = nic;
    }

    console.log("Final query:", query);
    const patient = await Patient.findOne(query);

    if (!patient) {
      console.log("No patient found for query:", query);
      return res.status(404).json({ message: "Patient record not found" });
    }

    console.log("Patient found:", patient._id);
    res.status(200).json({ patientId: patient._id });
  } catch (error) {
    console.error("Error finding patient:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};
exports.getLinkRecord = async (req, res) => {
  try {
    const { email, nic } = req.query;
    console.log("Finding patient by user details:", { email, nic });

    if (!email && !nic) {
      console.log("No email or NIC provided");
      return res.status(400).json({ message: "Email or NIC is required" });
    }

    const query = {};
    if (email) {
      console.log("Searching by email:", email);
      query.email = email;
    }
    if (nic) {
      console.log("Searching by NIC:", nic);
      query.nic = nic;
    }

    console.log("Final query:", query);
    const patient = await Patient.findOne(query);

    if (!patient) {
      console.log("No patient found for query:", query);
      return res.status(404).json({ message: "Patient record not found" });
    }

    console.log("Patient found:", patient._id);
    res.status(200).json({ patientId: patient._id });
  } catch (error) {
    console.error("Error finding patient:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};