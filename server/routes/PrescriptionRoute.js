const express= require("express");
const router= express.Router();

//import controllers
const PrescriptionController= require('../Controller/PrescriptionController');


//Routes
router.get('/',PrescriptionController.getAllPrescriptions);
router.get('/:id',PrescriptionController.getPrescriptionById);
router.post('/',PrescriptionController.CreatePrescription);
router.put('/:id',PrescriptionController.UpdatePrescription);
router.delete('/:id',PrescriptionController.DeletePrescription);


module.exports= router;