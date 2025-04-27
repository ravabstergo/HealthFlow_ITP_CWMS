import { ChevronRight, Monitor, X, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { useState } from "react"
import { useAuthContext } from "../context/AuthContext"
import api from "../services/api"
import { toast } from "react-hot-toast"

export default function AppointmentDetailsModal({ isOpen, onClose, appointmentData }) {
  const { currentUser } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    firstName: "",
    lastName: "",
    phone: "",
    nic: "",
    email: "",
    reason: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleBookAppointment = async () => {
    try {
      setLoading(true);
      setError(null);

      // Validate required fields
      const requiredFields = ['title', 'firstName', 'lastName', 'phone', 'email', 'reason'];
      const missingFields = requiredFields.filter(field => !formData[field]);

      console.log(appointmentData.doctorId, appointmentData.selectedSlot._id);
      
      if (missingFields.length > 0) {
        throw new Error(`Please fill in all required fields: ${missingFields.join(', ')}`);
      }

      // The endpoint expects /api/doctors/:id/slots/:slotId/appointments
      await api.post(
        `/api/appointments/doctors/${appointmentData.doctorId}/slots/${appointmentData.selectedSlot._id}/appointments`,
        {
          doctorId: appointmentData.doctorId,
          patientId: currentUser?.id,
          slotId: appointmentData.selectedSlot._id,
          reason: formData.reason,
          title: formData.title,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          nic: formData.nic,
          email: formData.email,
          status: 'active'
        }
      );
      
      toast.success('Appointment booked successfully!');
      onClose();
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to book appointment';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const doctorInitials = appointmentData.doctorName
    .split(" ")
    .map(n => n[0])
    .join("")
    .toUpperCase();  return (    <div className="fixed top-[50%] right-[calc(4rem+21px)] -translate-y-1/2 z-50">
      <div className="w-[450px] min-h-[600px] bg-white shadow-lg rounded-2xl">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <div className="flex flex-col">
            <span className="text-sm text-gray-600">Appointment No</span>
            <span className="font-medium text-gray-800">#DOC0010</span>
          </div>
          <div className="flex items-center">
            <div className="flex items-center mr-4">
              <Monitor className="h-4 w-4 text-gray-400 mr-1" />
              <span className="text-xs text-gray-400">MANUAL APPOINTMENT</span>
            </div>
            <button onClick={onClose}>
              <X className="h-5 w-5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Doctor Info */}
        <div className="p-4 flex items-center justify-between border-b">
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-full bg-purple-500 flex items-center justify-center text-white font-medium mr-3">
              {doctorInitials}
            </div>
            <div>
              <p className="text-xs text-gray-500">Doctor</p>
              <p className="font-medium text-gray-800">{appointmentData.doctorName}</p>
            </div>
          </div>

          <div className="flex items-center">
            <div className="text-right mr-6">
              <p className="text-xs text-gray-500">DATE AND TIME</p>
              <p className="text-sm text-gray-800">{format(appointmentData.selectedDate, 'EEE, dd MMM')}</p>
              <p className="text-sm text-gray-800">{format(new Date(appointmentData.selectedSlot.slotTime), 'hh:mm a')}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">Specialization</p>
              <p className="text-sm text-gray-800">{appointmentData.specialization}</p>
            </div>
          </div>
        </div>

        {/* Stepper */}
        <div className="p-6 border-b">
          <div className="flex items-center justify-center">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
              1
            </div>
            <div className="flex-1 h-1 mx-2 bg-blue-500"></div>
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
              2
            </div>
            <div className="flex-1 h-1 mx-2 bg-gray-200"></div>
            <div className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center text-gray-400 font-medium">
              3
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Mr/Mrs/Ms"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">NIC</label>
              <input
                type="text"
                name="nic"
                value={formData.nic}
                onChange={handleChange}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="National ID Number"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="First Name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Last Name"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Phone Number"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Email Address"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Visit</label>
            <textarea
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              rows="3"
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Please describe your reason for visit"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t">
          {error && (
            <div className="mb-4 p-2 bg-red-50 text-red-600 rounded text-sm">
              {error}
            </div>
          )}
          <button
            onClick={handleBookAppointment}
            disabled={loading}
            className={`w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center ${
              loading ? 'opacity-75 cursor-not-allowed' : ''
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Booking Appointment...
              </>
            ) : (
              'Book Appointment'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
