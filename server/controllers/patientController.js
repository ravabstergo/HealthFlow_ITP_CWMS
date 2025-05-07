const Patient = require('../models/Patient');

// Get a patient by NIC number
const getPatientByNIC = async (req, res) => {
  try {
    const { nic } = req.params;
    console.log('[PatientController] Finding patient with NIC:', nic);

    if (!nic) {
      return res.status(400).json({ message: 'NIC parameter is required' });
    }


    const patient = await Patient.findOne({ nic });
    console.log('[PatientController] Patient found:', patient);

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found with this NIC' });
    }

    console.log('[PatientController] Patient found:', patient._id);
    res.status(200).json(patient);
  } catch (error) {
    console.error('[PatientController] Error fetching patient by NIC:', error);
    res.status(500).json({ message: 'Error retrieving patient data', error: error.message });
  }
};

module.exports = {
  getPatientByNIC
};