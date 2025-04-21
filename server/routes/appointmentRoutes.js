const express = require('express')
const router = express.Router()
const {     
    getAllDoctors,
    createSchedule,
    getDoctorSlots,
    bookAppointment,
    getDoctorById,
    getDoctorSchedule,
    updateSchedule,
    getAppointmentById,
    getAppointmentsByDoctor,
    getAppointmentsByPatient,
    deleteAppointment,
    getActiveAppointments,
    getAppointmentsByPatientName,
    searchDoctorByName,
    deleteAvailability,
    updateAppointmentStatus,
    checkSlotAvailability,
    getDoctorSlotsByDate // Add this new controller
} = require('../controllers/appointmentController')
const { create } = require('../models/Appointment')


//get all doctors
router.get('/doctors', getAllDoctors)

//get doctor by id
router.get('/doctors/:id', getDoctorById)

//create schedule
router.post('/doctors/:id/schedule', createSchedule)

//get doctor schedule
router.get('/doctors/:id/getSchedule', getDoctorSchedule)

//update doctor schedule
router.put("/doctors/:doctorId/schedule", updateSchedule);

//get doctor slots by date
router.get('/doctors/:id/slots', getDoctorSlots) // date will be passed as query parameter

//book appointment
router.post('/doctors/:id/slots/:slotId/appointments', bookAppointment) // simplified route for booking


//get appointment by id
router.get('/appointments/:appointmentId', getAppointmentById)

//get all appointments of a doctor
router.get('/appointments/doctor/:doctorId', getAppointmentsByDoctor)

//get all appointments of a patient
router.get('/appointments/patient/:patientId', getAppointmentsByPatient)

//delete appointment
router.delete('/appointments/:appointmentId', deleteAppointment)

//get all active appointments
router.get('/appointments/doctor/:doctorId/active', getActiveAppointments)

//get appointments by patient name
router.get('/appointments/patient/:firstName/:lastName', getAppointmentsByPatientName)

//search doctor by name
router.get('/doctors/search/:searchTerm', searchDoctorByName)

//delete availability
router.delete('/availability/:doctorId/:availabilityId', deleteAvailability)

//update appointment status
router.patch('/appointments/:id', updateAppointmentStatus)

//check slot availability
router.get('/doctors/:id/slots/:slotId/availability', checkSlotAvailability)

//get doctor slots by availability
router.get('/doctors/:id/slots/:date', getDoctorSlotsByDate)

module.exports = router