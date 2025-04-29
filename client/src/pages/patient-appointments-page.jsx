import React, { useState, useEffect } from 'react';
import { useAuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { format } from 'date-fns';

export default function PatientAppointmentsPage() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useAuthContext();

  useEffect(() => {
    const fetchDoctorDetails = async (appointment) => {
      try {
        console.log(`Fetching details for doctor ID: ${appointment.doctorId}`);
        const doctorResponse = await api.get(`/api/appointments/doctors/${appointment.doctorId}`);
        return {
          ...appointment,
          doctorName: doctorResponse.data.name || 'Unknown Doctor',
          specialization: doctorResponse.data.doctorInfo?.specialization || 'General'
        };
      } catch (err) {
        console.error(`Error fetching doctor details for ${appointment.doctorId}:`, err);
        return {
          ...appointment,
          doctorName: 'Unknown Doctor',
          specialization: 'Unknown'
        };
      }
    };

    const fetchAppointments = async () => {
      try {
        setLoading(true);
        // Updated to use the correct endpoint matching the backend route
        const response = await api.get(`/api/appointments/appointments/patient/${currentUser?.id}`);
        
        // Fetch doctor details for each appointment
        const appointmentsWithDoctors = await Promise.all(
          response.data.map(appointment => fetchDoctorDetails(appointment))
        );
        
        setAppointments(appointmentsWithDoctors);
      } catch (err) {
        setError('Failed to fetch appointments');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (currentUser?.id) {
      fetchAppointments();
    }
  }, [currentUser?.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">My Appointments</h1>
      <div className="grid gap-4">
        {appointments.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            No appointments found
          </div>
        ) : (
          appointments.map((appointment) => (
            <div
              key={appointment._id}
              className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
            >
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Doctor</p>
                  <p className="font-medium">{appointment.doctorName}</p>
                  <p className="text-xs text-gray-500">{appointment.specialization}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Date & Time</p>
                  <p className="font-medium">
                    {format(new Date(appointment.time), 'PPp')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                    appointment.status === 'completed' ? 'bg-green-100 text-green-800' :
                    appointment.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                  </span>
                </div>
                <div className="md:col-span-3">
                  <p className="text-sm text-gray-500">Reason</p>
                  <p className="text-gray-700">{appointment.reason}</p>
                </div>
                {appointment.status === 'active' && (
                  <div className="md:col-span-3">
                    <button 
                      className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                      onClick={() => navigate(`/account/meeting/${appointment._id}`)}
                    >
                      Join Video Call
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
