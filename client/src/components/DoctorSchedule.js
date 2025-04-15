"use client"

import { useState, useEffect } from "react"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import "./DatePicker.css"  // Import our custom styles after the default styles
import { Search, ChevronLeft, ChevronRight, Bell, HelpCircle, Settings, ChevronDown } from "lucide-react"
import { getDoctorSchedules, deleteAvailability, createSchedule } from "../services/doctorService"

export default function HealthFlowDashboard() {
  const [activeTab, setActiveTab] = useState("Schedule")
  const [availabilityCount, setAvailabilityCount] = useState(0)
  const [availabilities, setAvailabilities] = useState([])
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [filteredAvailabilities, setFilteredAvailabilities] = useState([])
  const [showAddPanel, setShowAddPanel] = useState(false)
  const [consultationFee, setConsultationFee] = useState("")
  const [availability, setAvailability] = useState([{ 
    day: new Date(), 
    startTime: new Date(), 
    endTime: new Date(), 
    appointmentDuration: 30 
  }])
  const [errors, setErrors] = useState({})

  const handleAvailabilityChange = (index, field, value) => {
    const newAvailability = [...availability];
    newAvailability[index][field] = value;
    setAvailability(newAvailability);
  };

  const handleAddAvailability = () => {
    setAvailability([...availability, { 
      day: new Date(), 
      startTime: new Date(), 
      endTime: new Date(), 
      appointmentDuration: 30 
    }]);
  };

  const handleRemoveSlot = (index) => {
    // Don't remove if it's the only slot
    if (availability.length <= 1) {
      return;
    }
    const newAvailability = availability.filter((_, i) => i !== index);
    setAvailability(newAvailability);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    // Validate consultation fee
    if (!consultationFee || consultationFee <= 0) {
      newErrors.consultationFee = "Please enter a valid consultation fee";
    }

    // Validate each availability slot
    availability.forEach((slot, index) => {
      if (!slot.day) {
        newErrors[`availability_day_${index}`] = "Please select a day";
      }
      
      if (!slot.startTime) {
        newErrors[`availability_startTime_${index}`] = "Please select a start time";
      }
      
      if (!slot.endTime) {
        newErrors[`availability_endTime_${index}`] = "Please select an end time";
      }
      
      if (slot.startTime && slot.endTime && slot.startTime >= slot.endTime) {
        newErrors[`availability_time_${index}`] = "End time must be after start time";
      }
      
      if (!slot.appointmentDuration || slot.appointmentDuration <= 0) {
        newErrors[`availability_duration_${index}`] = "Please enter a valid duration";
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const doctorId = "67fe16ea33dbb0c55720cbc3"; // Replace with actual doctor ID
      await createSchedule(doctorId, {
        availability,
        consultationFee: Number(consultationFee)
      });

      // Refresh the availabilities list
      const data = await getDoctorSchedules(doctorId);
      if (Array.isArray(data)) {
        const allAvailabilities = data.reduce((acc, schedule) => {
          return acc.concat(schedule.availability || []);
        }, []);
        setAvailabilities(allAvailabilities);
        setAvailabilityCount(allAvailabilities.length);
        filterAvailabilities(allAvailabilities, selectedDate);
      }

      setShowAddPanel(false);
      setErrors({});
      
      // Reset form
      setConsultationFee("");
      setAvailability([{ 
        day: new Date(), 
        startTime: new Date(), 
        endTime: new Date(), 
        appointmentDuration: 30 
      }]);
    } catch (error) {
      console.error('Error creating schedule:', error);
      setErrors({ submit: 'Failed to create schedule. Please try again.' });
    }
  };

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const doctorId = "67fe16ea33dbb0c55720cbc3"; // Replace with actual doctor ID
        const data = await getDoctorSchedules(doctorId);
        if (Array.isArray(data)) {
          // Flatten all availabilities from all schedules into a single array
          const allAvailabilities = data.reduce((acc, schedule) => {
            return acc.concat(schedule.availability || []);
          }, []);
          setAvailabilities(allAvailabilities);
          setAvailabilityCount(allAvailabilities.length);
          filterAvailabilities(allAvailabilities, selectedDate);
        }
      } catch (error) {
        console.error('Error fetching schedules:', error);
        setAvailabilityCount(0);
      }
    };

    fetchSchedules();
  }, [selectedDate]);

  const filterAvailabilities = (availabilities, date) => {
    const startDate = new Date(date);
    const endDate = new Date(date);
    endDate.setDate(endDate.getDate() + 14);

    const filtered = availabilities.filter(avail => {
      const availDate = new Date(avail.day);
      return availDate >= startDate && availDate <= endDate;
    }).sort((a, b) => new Date(a.day) - new Date(b.day))
    .slice(0, 14); // Limit to 14 entries

    setFilteredAvailabilities(filtered);
  };

  const handleDateChange = (e) => {
    const newDate = new Date(e.target.value);
    setSelectedDate(newDate);
    filterAvailabilities(availabilities, newDate);
  };

  const handleDelete = async (availabilityId) => {
    try {
      const doctorId = "67fe16ea33dbb0c55720cbc3"; // Replace with actual doctor ID
      await deleteAvailability(doctorId, availabilityId);
      
      // Refresh the availabilities after deletion
      const data = await getDoctorSchedules(doctorId);
      if (Array.isArray(data)) {
        const allAvailabilities = data.reduce((acc, schedule) => {
          return acc.concat(schedule.availability || []);
        }, []);
        setAvailabilities(allAvailabilities);
        setAvailabilityCount(allAvailabilities.length);
        filterAvailabilities(allAvailabilities, selectedDate);
      }
    } catch (error) {
      console.error('Error deleting availability:', error);
    }
  };

  // Format date for input value
  const formatDateForInput = (date) => {
    return date.toISOString().split('T')[0];
  };

  // Format time for display
  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit'
    });
  };

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <div className="w-64 border-r border-gray-200 flex flex-col">
        {/* Logo */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center">
            <div className="h-6 w-6 bg-blue-600 rounded-sm flex items-center justify-center mr-2">
              <span className="text-white font-bold text-lg">+</span>
            </div>
            <span className="text-blue-600 font-semibold text-lg">HealthFlow</span>
          </div>
        </div>

        {/* User Profile */}
        <div className="p-4 border-b border-gray-200 flex items-center">
          <div className="h-8 w-8 bg-orange-100 rounded-full flex items-center justify-center mr-3">
            <span className="text-orange-500 font-medium">DS</span>
          </div>
          <div>
            <p className="text-sm font-medium">Darrin Stewart</p>
            <p className="text-xs text-gray-500">Super admin</p>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto">
          <div className="py-2">
            <p className="px-4 py-2 text-xs font-medium text-gray-500 uppercase">Dashboard</p>
            <NavItem icon={<DashboardIcon />} label="Dashboard" active />
          </div>

          <div className="py-2">
            <p className="px-4 py-2 text-xs font-medium text-gray-500 uppercase">Clinical</p>
            <NavItem icon={<PatientsIcon />} label="Patients" />
            <NavItem icon={<PrescriptionsIcon />} label="Prescriptions" />
            <NavItem icon={<DocumentsIcon />} label="Documents" />
          </div>

          <div className="py-2">
            <p className="px-4 py-2 text-xs font-medium text-gray-500 uppercase">Telemedicine</p>
            <NavItem icon={<AppointmentsIcon />} label="Appointments" />
            <NavItem icon={<ChartIcon />} label="Chart" />
            <NavItem icon={<FinanceIcon />} label="Finance" />
          </div>

          <div className="py-2">
            <p className="px-4 py-2 text-xs font-medium text-gray-500 uppercase">Staff</p>
            <NavItem icon={<RolesIcon />} label="Roles" />
          </div>

          <div className="py-2">
            <p className="px-4 py-2 text-xs font-medium text-gray-500 uppercase">Feedback</p>
            <NavItem icon={<FeedbackIcon />} label="Feedback" />
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="border-t border-gray-200 py-2">
          <NavItem icon={<Settings className="h-5 w-5 text-gray-500" />} label="Settings" />
          <NavItem icon={<CustomerSupportIcon />} label="Customer Support" />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-14 border-b border-gray-200 flex items-center px-4">
          <button className="mr-2">
            <ChevronLeft className="h-5 w-5 text-gray-500" />
          </button>
          <h1 className="text-lg font-medium">Dashboard</h1>

          <div className="ml-auto flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search for anything here..."
                className="w-64 h-9 pl-10 pr-4 rounded-md bg-gray-100 text-sm focus:outline-none"
              />
            </div>
            <button className="h-8 w-8 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100">
              <Bell className="h-5 w-5" />
            </button>
            <button className="h-8 w-8 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100">
              <HelpCircle className="h-5 w-5" />
            </button>
            <div className="h-8 w-8 bg-green-500 rounded-full flex items-center justify-center text-white font-medium">
              P
            </div>
            <ChevronDown className="h-4 w-4 text-gray-500" />
          </div>
        </header>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex px-4">
            <TabButton label="Calendar" active={activeTab === "Calendar"} onClick={() => setActiveTab("Calendar")} />
            <TabButton label="Schedule" active={activeTab === "Schedule"} onClick={() => setActiveTab("Schedule")} />
          </div>
        </div>

        {/* Schedule Content */}
        <div className="flex-1 overflow-auto p-4">
          {/* Total Availabilities */}
          <div className="flex items-center mb-4">
            <div className="flex items-center">
              <div className="h-6 w-6 bg-gray-200 rounded flex items-center justify-center mr-2">
                <CalendarIcon />
              </div>
              <span className="text-xl font-semibold mr-2">{availabilityCount}</span>
              <span className="text-gray-500 text-sm">total availabilities</span>
            </div>

            {/* Date Selection */}
            <div className="ml-auto flex items-center">
              <input
                type="date"
                value={formatDateForInput(selectedDate)}
                onChange={handleDateChange}
                className="px-3 py-2 border border-gray-300 rounded-md mr-4 text-sm"
              />
              <button 
                className="ml-4 bg-green-100 text-green-600 px-4 py-1.5 rounded-md text-sm font-medium"
                onClick={() => setShowAddPanel(true)}
              >
                Add Availability
              </button>
            </div>
          </div>

          {/* Availability Grid */}
          <div className="grid grid-cols-2 gap-4">
            {filteredAvailabilities.map((availability, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="mb-2">
                  <p className="text-sm font-medium">
                    {new Date(availability.day).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </p>
                  <p className="text-sm text-gray-500">
                    {formatTime(availability.startTime)} - {formatTime(availability.endTime)}
                  </p>
                  <p className="text-xs text-gray-400">
                    {availability.appointmentDuration} min appointments
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button className="px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded hover:bg-blue-100">
                    Update
                  </button>
                  <button 
                    onClick={() => handleDelete(availability._id)}
                    className="px-3 py-1 text-xs font-medium text-indigo-600 bg-indigo-50 rounded hover:bg-indigo-100"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Slide-out Panel */}
        {showAddPanel && (
          <div className="fixed inset-0 bg-black bg-opacity-30 z-50 flex justify-end items-start p-6">
            <div className="bg-white w-full max-w-md rounded-xl shadow-xl flex flex-col mr-6 mt-6 max-h-[calc(100vh-3rem)] overflow-hidden">
              {/* Panel Header */}
              <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center">
                  <div className="bg-gray-100 p-2 rounded-md mr-3">
                    <CalendarIcon />
                  </div>
                  <div>
                    <h2 className="font-medium">Add Availability</h2>
                    <p className="text-sm text-gray-500">Create a new availability slot</p>
                  </div>
                </div>
                <button
                  className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-gray-100"
                  onClick={() => setShowAddPanel(false)}
                >
                  <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-gray-500">
                    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </button>
              </div>

              {/* Panel Content */}
              <div className="flex-1 p-6 mb-4 overflow-y-auto max-h-[500px]">
                <form id="availabilityForm" onSubmit={handleSubmit} className="space-y-6">
                  <div className="bg-white rounded-lg">
                    <div className="mb-6">
                      <label className="block mb-2 font-medium text-gray-800">Consultation Fee</label>
                      <input
                        type="number"
                        value={consultationFee}
                        onChange={(e) => setConsultationFee(e.target.value)}
                        className="p-2 border border-gray-300 rounded-md w-full focus:border-blue-500 focus:outline-none"
                        style={{ maxWidth: "200px" }}
                        required
                      />
                      {errors.consultationFee && <p className="text-red-500 text-sm">{errors.consultationFee}</p>}
                    </div>

                    <div className="space-y-6">
                      <label className="block mb-2 font-medium text-gray-800">Availability</label>
                      {availability.map((slot, index) => (
                        <div key={index} className="p-4 border border-gray-200 rounded-lg relative">
                          <div className="flex justify-between items-center mb-4">
                            <h4 className="text-lg font-semibold text-gray-800">Slot {index + 1}</h4>
                            {availability.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveSlot(index)}
                                className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50"
                                title="Remove Slot"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            )}
                          </div>
                          <div className="space-y-4">
                            <div>
                              <label className="block mb-2 font-medium text-gray-700">Day</label>
                              <DatePicker
                                selected={slot.day}
                                onChange={(date) => handleAvailabilityChange(index, "day", date)}
                                dateFormat="yyyy/MM/dd"
                                className="p-2 border border-gray-300 rounded-md w-full focus:border-blue-500 focus:outline-none"
                                calendarClassName="custom-datepicker"
                                required
                              />
                              {errors[`availability_day_${index}`] && (
                                <p className="text-red-500 text-sm">{errors[`availability_day_${index}`]}</p>
                              )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block mb-2 font-medium text-gray-700">Start Time</label>
                                <DatePicker
                                  selected={slot.startTime}
                                  onChange={(date) => handleAvailabilityChange(index, "startTime", date)}
                                  showTimeSelect
                                  showTimeSelectOnly
                                  timeIntervals={15}
                                  timeCaption="Start Time"
                                  dateFormat="h:mm aa"
                                  className="p-2 border border-gray-300 rounded-md w-full focus:border-blue-500 focus:outline-none"
                                  calendarClassName="custom-datepicker"
                                  required
                                />
                                {errors[`availability_startTime_${index}`] && (
                                  <p className="text-red-500 text-sm">{errors[`availability_startTime_${index}`]}</p>
                                )}
                              </div>
                              <div>
                                <label className="block mb-2 font-medium text-gray-700">End Time</label>
                                <DatePicker
                                  selected={slot.endTime}
                                  onChange={(date) => handleAvailabilityChange(index, "endTime", date)}
                                  showTimeSelect
                                  showTimeSelectOnly
                                  timeIntervals={15}
                                  timeCaption="End Time"
                                  dateFormat="h:mm aa"
                                  className="p-2 border border-gray-300 rounded-md w-full focus:border-blue-500 focus:outline-none"
                                  calendarClassName="custom-datepicker"
                                  required
                                />
                                {errors[`availability_endTime_${index}`] && (
                                  <p className="text-red-500 text-sm">{errors[`availability_endTime_${index}`]}</p>
                                )}
                              </div>
                            </div>

                            {errors[`availability_time_${index}`] && (
                              <p className="text-red-500 text-sm">{errors[`availability_time_${index}`]}</p>
                            )}

                            <div>
                              <label className="block mb-2 font-medium text-gray-700">Appointment Duration (minutes)</label>
                              <input
                                type="number"
                                placeholder="Appointment Duration (minutes)"
                                value={slot.appointmentDuration}
                                onChange={(e) => handleAvailabilityChange(index, "appointmentDuration", e.target.value)}
                                className="p-2 border border-gray-300 rounded-md w-full focus:border-blue-500 focus:outline-none" 
                                style={{ maxWidth: "150px" }}
                                required
                              />
                              {errors[`availability_duration_${index}`] && (
                                <p className="text-red-500 text-sm">{errors[`availability_duration_${index}`]}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                      {errors.availability && <p className="text-red-500 text-sm">{errors.availability}</p>}
                      
                      <button
                        type="button"
                        onClick={handleAddAvailability}
                        className="w-full py-2 px-4 border border-blue-500 text-blue-500 rounded-md hover:bg-blue-50 transition-colors duration-200"
                      >
                        + Add Another Slot
                      </button>
                    </div>
                  </div>
                </form>
              </div>
              
              {/* Panel Footer */}
              <div className="p-4 border-t mt-auto">
                <div className="flex space-x-3">
                  <button
                    type="submit"
                    form="availabilityForm"
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors duration-200"
                  >
                    Save Availability
                  </button>
                  <button
                    type="button"
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                    onClick={() => setShowAddPanel(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function TabButton({ label, active, onClick }) {
  return (
    <button
      className={`px-4 py-3 text-sm font-medium border-b-2 ${
        active ? "text-blue-600 border-blue-600" : "text-gray-500 border-transparent hover:text-gray-700"
      }`}
      onClick={onClick}
    >
      {label}
    </button>
  )
}

function NavItem({ icon, label, active = false }) {
  return (
    <div
      className={`flex items-center px-4 py-2 text-sm ${
        active ? "bg-blue-50 text-blue-600" : "text-gray-700 hover:bg-gray-100"
      }`}
    >
      <div className="w-5 h-5 mr-3 flex-shrink-0">{icon}</div>
      <span>{label}</span>
    </div>
  )
}

function AvailabilitySlot() {
  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="mb-2">
        <p className="text-sm font-medium">Fri, 16 May 2024</p>
        <p className="text-sm text-gray-500">09:00 AM - 12:00 PM</p>
      </div>
      <div className="flex space-x-2">
        <button className="px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded hover:bg-blue-100">
          Update
        </button>
        <button className="px-3 py-1 text-xs font-medium text-indigo-600 bg-indigo-50 rounded hover:bg-indigo-100">
          Delete
        </button>
      </div>
    </div>
  )
}

// Custom Icons
function DashboardIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-blue-600">
      <rect
        x="3"
        y="3"
        width="7"
        height="7"
        rx="1"
        fill="currentColor"
        fillOpacity="0.2"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <rect
        x="3"
        y="14"
        width="7"
        height="7"
        rx="1"
        fill="currentColor"
        fillOpacity="0.2"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <rect
        x="14"
        y="3"
        width="7"
        height="7"
        rx="1"
        fill="currentColor"
        fillOpacity="0.2"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <rect
        x="14"
        y="14"
        width="7"
        height="7"
        rx="1"
        fill="currentColor"
        fillOpacity="0.2"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  )
}

function PatientsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-gray-500">
      <circle cx="12" cy="8" r="4" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M5 18C5 15.7909 7.01472 14 9.5 14H14.5C16.9853 14 19 15.7909 19 18V20H5V18Z"
        fill="currentColor"
        fillOpacity="0.2"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  )
}

function PrescriptionsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-gray-500">
      <path
        d="M8 4H6C4.89543 4 4 4.89543 4 6V18C4 19.1046 4.89543 20 6 20H18C19.1046 20 20 19.1046 20 18V16"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M8 16H10L18 8L16 6L8 14V16Z"
        fill="currentColor"
        fillOpacity="0.2"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  )
}

function DocumentsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-gray-500">
      <path
        d="M14 3H7C5.89543 3 5 3.89543 5 5V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V8L14 3Z"
        fill="currentColor"
        fillOpacity="0.2"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path d="M14 3V8H19" stroke="currentColor" strokeWidth="1.5" />
      <path d="M9 13H15" stroke="currentColor" strokeWidth="1.5" />
      <path d="M9 17H15" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}

function AppointmentsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-gray-500">
      <rect
        x="3"
        y="5"
        width="18"
        height="16"
        rx="2"
        fill="currentColor"
        fillOpacity="0.2"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path d="M8 3V7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M16 3V7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M3 11H21" stroke="currentColor" strokeWidth="1.5" />
      <rect x="7" y="15" width="4" height="2" rx="0.5" fill="currentColor" />
    </svg>
  )
}

function ChartIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-gray-500">
      <path
        d="M3 12H7L10 7L14 17L17 12H21"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function FinanceIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-gray-500">
      <path
        d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2Z"
        fill="currentColor"
        fillOpacity="0.2"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path d="M12 17V11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="12" cy="8" r="1" fill="currentColor" />
    </svg>
  )
}

function RolesIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-gray-500">
      <path
        d="M17 21V19C17 16.7909 15.2091 15 13 15H5C2.79086 15 1 16.7909 1 19V21"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <circle cx="9" cy="7" r="4" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M23 21V19C22.9986 17.1771 21.765 15.5857 20 15.13"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M16 3.13C17.7699 3.58317 19.0078 5.17799 19.0078 7.005C19.0078 8.83201 17.7699 10.4268 16 10.88"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

function FeedbackIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-gray-500">
      <path
        d="M21 11.5C21.0034 12.8199 20.6951 14.1219 20.1 15.3C19.3944 16.7118 18.3098 17.8992 16.9674 18.7293C15.6251 19.5594 14.0782 19.9994 12.5 20C11.1801 20.0035 9.87812 19.6951 8.7 19.1L3 21L4.9 15.3C4.30493 14.1219 3.99656 12.8199 4 11.5C4.00061 9.92179 4.44061 8.37488 5.27072 7.03258C6.10083 5.69028 7.28825 4.6056 8.7 3.90003C9.87812 3.30496 11.1801 2.99659 12.5 3.00003H13C15.0843 3.11502 17.053 3.99479 18.5291 5.47089C20.0052 6.94699 20.885 8.91568 21 11V11.5Z"
        fill="currentColor"
        fillOpacity="0.2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function CustomerSupportIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-gray-500">
      <path
        d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2Z"
        fill="currentColor"
        fillOpacity="0.2"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path d="M12 16V12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="12" cy="8" r="1" fill="currentColor" />
    </svg>
  )
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-gray-500">
      <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 2V6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M16 2V6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M3 10H21" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}
