const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");

//import controllers
const PrescriptionController = require('../controllers/PrescriptionController');

//Routes
router.use(protect); // Apply auth middleware to all prescription routes

router.get('/patient/:patientId', PrescriptionController.getAllPrescriptions);
router.get('/doctor/:doctorId', PrescriptionController.getAllPrescriptionsByDoctor);
router.get('/:id', PrescriptionController.getPrescriptionById);
router.post('/', PrescriptionController.CreatePrescription);
router.put('/:id', PrescriptionController.UpdatePrescription);
router.delete('/:id', PrescriptionController.DeletePrescription);
router.get('/search/:query', PrescriptionController.SearchPrescription);

module.exports = router;