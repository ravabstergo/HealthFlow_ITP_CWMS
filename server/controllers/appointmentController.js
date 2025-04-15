const DoctorSchedule = require('../models/DoctorSchedule');
const Appointment = require('../models/Appointment');
const mongoose = require('mongoose');
const User = require('../models/User');
const querystring = require('querystring');
const dotenv = require("dotenv");
const { RtcTokenBuilder, RtcRole } = require('agora-token');

require('dotenv').config();


//search doctor by name
const searchDoctorByName = async (req, res) => {
  try {
    const { name } = req.params;
    const doctor = await User.findOne({ name , role: 'doctor' });

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found.' });
    }

    res.status(200).json(doctor);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching doctor.', error });
  }
};

//get all doctors
const getAllDoctors = async (req, res) => {
    const doctors = await User.find({role: 'doctor'})

    res.status(200).json(doctors)
}

//create schedule
const createSchedule = async (req, res) => {
  try {
    const { availability, consultationFee } = req.body;
    const doctorId = req.params.id;

    // Create slots from availability
    const slots = [];
    availability.forEach((day) => {
      const startTime = new Date(day.startTime);
      const endTime = new Date(day.endTime);
      const duration = day.appointmentDuration;

      let slotTime = new Date(startTime);
      while (slotTime < endTime) {
        slots.push({ day: day.day, slotTime: slotTime.toISOString(), isBooked: false });
        slotTime = new Date(slotTime.getTime() + duration * 60000); // Increment by duration
      }
    });

    // Save schedule and slots
    const schedule = new DoctorSchedule({ doctorId, availability, slots, consultationFee });
    await schedule.save();

    res.status(201).json(schedule);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating schedule', error });
  }
};

//get doctor slots
const getDoctorSlots = async (req, res) => {
  try {
    const doctorId = req.params.id;
    const schedules = await DoctorSchedule.find({ doctorId }).lean();

    if (!schedules.length) {
      return res.status(404).json({ message: 'No schedule found for this doctor' });
    }

    // Combine slots from all schedules
    const allSlots = schedules.reduce((acc, schedule) => {
      return acc.concat(schedule.slots.filter(slot => !slot.isBooked));
    }, []);

    res.json(allSlots);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching slots', error });
  }
};



  //book appointment
  const bookAppointment = async (req, res) => {
    try {
      const { doctorId, patientId, slotId, reason, title, firstName, lastName, phone, nic, email, status } = req.body;
  
      // Fetch the doctor's schedule
      const schedules = await DoctorSchedule.find({ doctorId });
      if (!schedules.length) return res.status(404).json({ message: 'Doctor schedule not found' });
  
      let slot;
      let schedule;
  
      // Find the specific slot
      for (const sched of schedules) {
        slot = sched.slots.id(slotId);
        if (slot) {
          schedule = sched;
          break;
        }
      }
  
      // Check if the slot is available
      if (!slot || slot.isBooked) {
        return res.status(400).json({ message: 'Slot is not available' });
      }
  
      // Generate Agora token
      const APP_ID = '18713c1eb82746e68c49288b56a780c3'; // Replace with your Agora App ID
      const APP_CERTIFICATE = '3cc0008156594102a3ff71848a5a65bb'; // Replace with your Agora App Certificate
  
      const channelName = `appointment-${slotId}`; // Unique channel name for the appointment
      const uid = 0; // User ID (0 means any user)
      const role = RtcRole.PUBLISHER; // Role: PUBLISHER or SUBSCRIBER
      const expirationTimeInSeconds = 3600 * 24 * 30; // Token validity (e.g., 24 hours)
  
      const currentTimestamp = Math.floor(Date.now() / 1000);
      const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;
  
      // Build the token
      const agoraToken = RtcTokenBuilder.buildTokenWithUid(
        APP_ID,
        APP_CERTIFICATE,
        channelName,
        uid,
        role,
        privilegeExpiredTs
      );
  
      // Create the appointment
      const appointment = new Appointment({
        doctorId,
        patientId,
        slotId,
        reason,
        title,
        firstName,
        lastName,
        phone,
        nic,
        email,
        status,
        channelName, // Save the channel name
        agoraToken, // Save the Agora token
      });
  
      await appointment.save();
  
      // Mark slot as booked
      slot.isBooked = true;
      await schedule.save();
  
      res.status(201).json(appointment);
    } catch (error) {
      res.status(500).json({ message: 'Error booking appointment', error });
    }
  };



//get doctor by id

const getDoctorById = async (req, res) => {
  try {
    const doctorId = req.params.id;
    const doctor = await User.findOne({ _id: doctorId, role: 'doctor' }); // Ensure role is 'doctor'

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found.' });
    }

    res.status(200).json(doctor);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching doctor.', error });
  }
};

//get doctor schedule

const getDoctorSchedule = async (req, res) => {
  try {
    const doctorId = req.params.id;
    const schedule = await DoctorSchedule.find({ doctorId });

    if (!schedule) {
      return res.status(404).json({ message: 'Schedule not found.' });
    }

    res.status(200).json(schedule);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching schedule.', error });
  }
};

//update doctor schedule

const updateSchedule = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { day, startTime, endTime, appointmentDuration } = req.body;

    // Find all schedules for the doctor
    const schedules = await DoctorSchedule.find({ doctorId });
    if (!schedules.length) {
      return res.status(404).json({ message: "Doctor schedule not found" });
    }

    // Convert `day` to a Date object for comparison
    const dayDate = new Date(day);

    // Find which schedule contains the availability for this day
    let targetSchedule = null;
    let availability = null;

    for (const schedule of schedules) {
      availability = schedule.availability.find(
        (a) => new Date(a.day).toISOString() === dayDate.toISOString()
      );
      if (availability) {
        targetSchedule = schedule;
        break;
      }
    }

    if (!targetSchedule || !availability) {
      return res.status(404).json({ message: "Day not found in availability" });
    }

    // Update the start time and end time
    availability.startTime = new Date(startTime);
    availability.endTime = new Date(endTime);

    // Recreate slots for the updated day
    const newSlots = [];
    let slotTime = new Date(startTime);
    const endTimeDate = new Date(endTime);

    while (slotTime < endTimeDate) {
      newSlots.push({
        day: dayDate.toISOString(),
        slotTime: slotTime.toISOString(),
        isBooked: false,
      });
      slotTime = new Date(slotTime.getTime() + appointmentDuration * 60000);
    }

    // Replace the slots for the updated day
    targetSchedule.slots = targetSchedule.slots.filter(
      (slot) => new Date(slot.day).toISOString() !== dayDate.toISOString()
    ).concat(newSlots);

    // Save the updated schedule
    await targetSchedule.save();

    res.status(200).json({ message: "Schedule updated successfully", schedule: targetSchedule });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating schedule", error });
  }
};

//get appointment by id

const getAppointmentById = async (req, res) => {
  try {
    const appointmentId = req.params.id;
    const appointment = await Appointment.findOne(appointmentId);

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found.' });
    }

    res.status(200).json(appointment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching appointment.', error });
  }
};

//get all appointments of a doctor

const getAppointmentsByDoctor = async (req, res) => {
  try {
    const doctorId = req.params.doctorId;
    const appointments = await Appointment.find({doctorId});

    if (!appointments.length) {
      return res.status(404).json({ message: 'No appointments found for this doctor.' });
    }

    res.status(200).json(appointments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching appointments.', error });
  }
};

//get active appointments of a doctor sorted in ascending order of slotTime
const getActiveAppointments = async (req, res) => {
  try {
    const { doctorId } = req.params;

    const appointments = await Appointment.find({ doctorId, status: 'active' }).sort({ slotTime: 1 });

    if (!appointments.length) {
      return res.status(404).json({ message: 'No active appointments found' });
    }

    res.status(200).json(appointments);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving appointments', error });
  }
};


//get all appointments of a patient

const getAppointmentsByPatient = async (req, res) => {
  try {
    const patientId = req.params.patientId;
    const appointments = await Appointment.find({patientId});

    if (!appointments.length) {
      return res.status(404).json({ message: 'No appointments found for this patient.' });
    }

    res.status(200).json(appointments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching appointments.', error });
  }
};

//delete appointment

const deleteAppointment = async (req, res) => {
  try {
    const appointmentId = req.params.id;

    // Find the appointment
    const appointment = await Appointment.findOneAndDelete(appointmentId);

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found.' });
    }

    // Find the schedule and slot
    const schedules = await DoctorSchedule.find({ doctorId: appointment.doctorId });
    if (!schedules.length) return res.status(404).json({ message: 'Doctor schedule not found' });

    let slot;
    let schedule;

    for (const sched of schedules) {
      slot = sched.slots.id(appointment.slotId);
      if (slot) {
        schedule = sched;
        break;
      }
    }

    if (!slot) {
      return res.status(404).json({ message: 'Slot not found in doctor schedule.' });
    }

    // Free up the slot
    slot.isBooked = false;
    await schedule.save();

    res.status(200).json({ message: 'Appointment canceled successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error canceling appointment.', error });
  }
};

//get appointments by patient name
const getAppointmentsByPatientName = async (req, res) => {
  try {
    const { firstName, lastName } = req.params;
    const appointments = await Appointment.find({ firstName, lastName });

    if (!appointments.length) {
      return res.status(404).json({ message: 'No appointments found for this patient.' });
    }

    res.status(200).json(appointments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching appointments.', error });
  }
};

//delete availability period and associated slots
const deleteAvailability = async (req, res) => {
  try {
    const { doctorId, availabilityId } = req.params;

    // Find all schedules for the doctor
    const schedules = await DoctorSchedule.find({ doctorId });
    if (!schedules.length) {
      return res.status(404).json({ message: 'Doctor schedule not found' });
    }

    // Find which schedule contains the availability
    let targetSchedule = null;
    let availability = null;
    
    for (const schedule of schedules) {
      availability = schedule.availability.id(availabilityId);
      if (availability) {
        targetSchedule = schedule;
        break;
      }
    }

    if (!targetSchedule || !availability) {
      return res.status(404).json({ message: 'Availability period not found' });
    }

    // Get the start and end times of the availability period
    const startTime = new Date(availability.startTime);
    const endTime = new Date(availability.endTime);
    const availabilityDay = new Date(availability.day);

    // Remove slots that fall within this availability period
    targetSchedule.slots = targetSchedule.slots.filter(slot => {
      const slotTime = new Date(slot.slotTime);
      const slotDay = new Date(slot.day);
      
      // Check if the slot is on the same day and within the time range
      return !(slotDay.getTime() === availabilityDay.getTime() &&
               slotTime >= startTime &&
               slotTime <= endTime);
    });

    // Remove the availability period
    targetSchedule.availability.pull(availabilityId);

    // Save the updated schedule
    await targetSchedule.save();

    res.status(200).json({ 
      message: 'Availability period and associated slots deleted successfully',
      schedule: targetSchedule
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error deleting availability period', error });
  }
};

module.exports = {
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
    deleteAvailability, // Add the new function to exports
}