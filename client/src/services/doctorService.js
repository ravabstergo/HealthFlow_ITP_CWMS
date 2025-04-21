const getDoctorSchedules = async (doctorId) => {
    try {
        const response = await fetch(`/api/appointments/doctors/${doctorId}/getSchedule`);
        if (!response.ok) {
            throw new Error('Failed to fetch doctor schedules');
        }
        return await response.json();
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
};

const deleteAvailability = async (doctorId, availabilityId) => {
    try {
        const response = await fetch(`/api/appointments/availability/${doctorId}/${availabilityId}`, {
            method: 'DELETE'
        });
        if (!response.ok) {
            throw new Error('Failed to delete availability');
        }
        return await response.json();
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
};

const createSchedule = async (doctorId, data) => {
    try {
        const response = await fetch(`/api/appointments/doctors/${doctorId}/schedule`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            throw new Error('Failed to create schedule');
        }
        return await response.json();
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
};

const getAllDoctors = async () => {
    try {
        const response = await fetch('/api/appointments/doctors');
        if (!response.ok) {
            console.error('Response status:', response.status);
            const errorText = await response.text();
            console.error('Error response:', errorText);
            throw new Error(`Failed to fetch doctors: ${response.status}`);
        }
        const data = await response.json();
        console.log('Doctors data:', data);
        return data;
    } catch (error) {
        console.error('Error in getAllDoctors:', error);
        throw error;
    }
};

const getAppointmentsByDoctor = async (doctorId) => {
    try {
        const response = await fetch(`/api/appointments/appointments/doctor/${doctorId}`);
        if (!response.ok) {
            throw new Error('Failed to fetch doctor appointments');
        }
        return await response.json();
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
};

const getDoctorSlotsByDate = async (doctorId, date) => {
    try {
        console.log('Service: Getting slots for doctor:', doctorId);
        const formattedDate = new Date(date);
        formattedDate.setHours(0, 0, 0, 0);
        const isoDate = formattedDate.toISOString();
        console.log('Service: Formatted date:', isoDate);
        
        const response = await fetch(`/api/appointments/doctors/${doctorId}/slots?date=${isoDate}`, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        console.log('Service: Response status:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Service: Error response:', errorText);
            throw new Error(`Failed to fetch doctor slots: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Service: Received data:', data);
        return data;
    } catch (error) {
        console.error('Service: Error in getDoctorSlotsByDate:', error);
        throw error;
    }
};

export {
    getDoctorSchedules,
    deleteAvailability,
    createSchedule,
    getAllDoctors,
    getAppointmentsByDoctor,
    getDoctorSlotsByDate
};