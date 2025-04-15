const prescription= require('../Model/PrescriptionModel');

//GetAllPrescriptions
const getAllPrescriptions = async (req, res) => {
    let getprescriptions;
    try{
        getprescriptions = await prescription.find()
        .populate('patientId','name')
        .populate('doctorId','name');
    }catch(err){
        console.log(err);
    }
    if(!getprescriptions){
        return res.status(404).json({message:'No prescriptions found'})
    }
    return res.status(200).json({getprescriptions})
};


//GetPrescriptionById
const getPrescriptionById = async (req, res) => {
    const id = req.params.id;
    let getidprescription;
    try{
        getidprescription = await prescription.findById(id)
        .populate('patientId','name')
        .populate('doctorId','name');
    }catch(err){
        console.log(err);
    }
    if(!getidprescription){
        return res.status(404).json({message:'No prescription found'})
    }
    return res.status(200).json({getidprescription})
};


//CreatePrescription
const CreatePrescription = async (req, res) => {
    const {
        medicines,
        patientId,
        doctorId,
        validUntil,
        notes
    }= req.body;

    const prescriptionData = new prescription({
        medicines,
        patientId,
        doctorId,
        validUntil,
        notes
    });
    try{
        const newPrescription = await prescriptionData.save();
        res.status(201).json({prescription:newPrescription});
    }catch(err){
        console.log(err);
        res.status(400).json({message:'Error creating prescription'});
    }
};


//UpdatePrescription
const UpdatePrescription = async (req, res) => {
    const id = req.params.id;
    const {
        medicines,
        patientId,
        doctorId,
        validUntil,
        notes
    }= req.body;

    let updateprescription;
    try{
        updateprescription = await prescription.findByIdAndUpdate(id,{
            medicines,
            patientId,
            doctorId,
            validUntil,
            notes
        });
        updateprescription = await updateprescription.save();
    }catch(err){
        console.log(err);
        return res.status(500).json({message:'Error updating prescription'});
    }

    if(!updateprescription){
        return res.status(404).json({message:'No prescription found'})
    }
    return res.status(200).json({
        message:'Prescription updated successfully',
        prescription:updateprescription
    })
    
};


//DeletePrescription
const DeletePrescription = async (req, res) => {
    const id = req.params.id;
    let deleteprescription;
    try{
        deleteprescription = await prescription.findByIdAndDelete(id);
    }catch(err){
        console.log(err);
        return res.status(500).json({message:'Error deleting prescription'});
    }

    if(!deleteprescription){
        return res.status(404).json({message:'No prescription found'})
    }
    return res.status(200).json({
        message:'Prescription deleted successfully',
        prescription:deleteprescription
    })
};



//exports
exports.getAllPrescriptions = getAllPrescriptions;
exports.getPrescriptionById = getPrescriptionById;
exports.CreatePrescription = CreatePrescription;
exports.UpdatePrescription = UpdatePrescription;
exports.DeletePrescription = DeletePrescription;
