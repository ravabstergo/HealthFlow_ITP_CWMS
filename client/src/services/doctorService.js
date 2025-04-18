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

export {
    getDoctorSchedules,
    deleteAvailability,
    createSchedule,
    getAppointmentsByDoctor
};