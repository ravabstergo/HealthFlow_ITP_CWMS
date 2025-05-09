const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getPatientByNIC } = require('../controllers/patientController');

// Routes related to patient data
router.get('/nic/:nic', getPatientByNIC);

module.exports = router;