import LoginPage from "./pages/login-page";
import { Navigate, Route, Routes } from "react-router-dom";
import { useAuthContext } from "./context/AuthContext";
import DashboardWrapper from "./components/dashboard-wrapper";
import Dashboard from "./pages/dashboard-page";
import PatientsPage from "./pages/patients-page";
import PatientDetailPage from "./pages/patient-detail-page";
import PatientInformationTab from "./components/patient-detail/PatientInformationTab";
import AppointmentHistoryTab from "./components/patient-detail/AppointmentHistoryTab";
import NextTreatmentTab from "./components/patient-detail/NextTreatmentTab";
import MedicalRecordTab from "./components/patient-detail/MedicalRecordTab";
import DoctorSchedule from './components/DoctorSchedule';
import TelemedicineMeeting from "./components/TelemedicineMeeting";
import DoctorSearch from "./pages/doctor-search";
import PatientAppointmentsPage from "./pages/patient-appointments-page";

function App() {
  const { isAuthenticated, loading } = useAuthContext();

  if (loading) {
    // Show a loading spinner or placeholder until the authentication is initialized
    return <div className="loading-spinner">Loading...</div>;
  }

  return (
    <div>
      <Routes>
        {/* Redirect from root to login */}
        <Route path="/" element={<Navigate to="/login" />} />

        {/* Login Route */}
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/account" /> : <LoginPage />}
        />

        {/* Dashboard Route (only accessible after login) */}
        <Route
          path="/account"
          element={
            isAuthenticated ? <DashboardWrapper /> : <Navigate to="/login" />
          }
        >
          {/* Nested Routes */}
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="search" element={<DoctorSearch />} />  
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="patients" element={<PatientsPage />} />
          <Route path="patient-appointments" element={<PatientAppointmentsPage />} />
          {/* Patient detail and nested tabs */}
          <Route path="patients/:id" element={<PatientDetailPage />}>
            <Route index element={<Navigate to="information" replace />} />

            <Route path="information" element={<PatientInformationTab />} />
            <Route path="appointments" element={<AppointmentHistoryTab />} />
            <Route path="treatment" element={<NextTreatmentTab />} />
            <Route path="record" element={<MedicalRecordTab />} />
          </Route>
          <Route path="schedule" element={<DoctorSchedule />} />   
          <Route path="meeting/:appointmentId" element={<TelemedicineMeeting />} />
          
     </Route>
      </Routes>
    </div>
  );
}

export default App;
