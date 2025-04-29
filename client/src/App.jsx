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
import FeedbackStartPage from "./pages/feedback-start-page";
import FeedbackCreatePage from "./pages/feedback-create-page";
import FeedbackSummaryPage from "./pages/feedback-summary-page";
import FeedbackUpdatePage from "./pages/feedback-update-page";
import FeedbackDeletePage from "./pages/feedback-delete-page";
import DoctorFeedbackPage from "./pages/doctor-feedback-page";
import FeedbackReportPage from "./pages/feedback-report-page";

function App() {
  const { isAuthenticated, loading, activeRole } = useAuthContext(); // Destructure activeRole here

  if (loading) {
    return <div className="loading-spinner">Loading...</div>;
  }

  return (
    <div>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/account" /> : <LoginPage />}
        />
        <Route
          path="/account"
          element={
            isAuthenticated ? <DashboardWrapper /> : <Navigate to="/login" />
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="patients" element={<PatientsPage />} />
          <Route path="patients/:id" element={<PatientDetailPage />}>
            <Route index element={<Navigate to="information" replace />} />
            <Route path="information" element={<PatientInformationTab />} />
            <Route path="appointments" element={<AppointmentHistoryTab />} />
            <Route path="treatment" element={<NextTreatmentTab />} />
            <Route path="record" element={<MedicalRecordTab />} />
          </Route>
          <Route path="appointments" element={<AppointmentsPage />} />
          <Route path="feedback" element={<FeedbackStartPage />} />
          <Route path="feedback/create/:id" element={<FeedbackCreatePage />} />
          <Route path="feedback/summary/:id" element={<FeedbackSummaryPage />} />
          <Route path="feedback/edit/:id" element={<FeedbackUpdatePage />} />
          <Route path="feedback/delete/:id" element={<FeedbackDeletePage />} />
          <Route path="feedback/doctor" element={<DoctorFeedbackPage />} />
          <Route path="/account/feedback/report" element={<FeedbackReportPage />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;