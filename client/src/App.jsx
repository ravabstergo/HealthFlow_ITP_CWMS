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
import AppointmentsPage from "./pages/appointments-page";
import ProtectedRoute from "./components/ProtectedRoute";
import { RecordContextProvider } from "./context/RecordContext";
import { HoverPanelProvider } from "./context/HoverPanelContext";

function App() {
  const { currentUser, loading } = useAuthContext();

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
          element={currentUser ? <Navigate to="/account" /> : <LoginPage />}
        />

        {/* Protected Routes */}
        <Route
          path="/account"
          element={
            <ProtectedRoute>
              <RecordContextProvider>
                <HoverPanelProvider>
                  <DashboardWrapper />
                </HoverPanelProvider>
              </RecordContextProvider>
            </ProtectedRoute>
          }
        >
          {/* Nested Routes */}
          <Route index element={<Navigate to="dashboard" replace />} />

          <Route path="dashboard" element={<Dashboard />} />
          <Route path="patients" element={<PatientsPage />} />
          {/* Patient detail and nested tabs */}
          <Route path="patients/:id" element={<PatientDetailPage />}>
            <Route index element={<PatientInformationTab />} />
            <Route path="appointments" element={<AppointmentHistoryTab />} />
            <Route path="treatment" element={<NextTreatmentTab />} />
            <Route path="record" element={<MedicalRecordTab />} />
          </Route>
          <Route path="appointments" element={<AppointmentsPage />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
