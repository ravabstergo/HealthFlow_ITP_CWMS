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
import {EncounterContextProvider} from "./context/EncounterContext";
import DoctorSchedule from './components/DoctorSchedule';
import TelemedicineMeeting from "./components/TelemedicineMeeting";
import DoctorSearch from "./pages/doctor-search";
import PatientAppointmentsPage from "./pages/patient-appointments-page";
import PatientDocumentList from "./components/patient-detail/DocumentList";
import DocumentList from "./pages/document_page";
import PrescriptionPage from "./pages/prescription-page";
import PrescriptionReport from "./pages/prescription-report";
import AppointmentsPage from "./pages/appointments-page";
import ProtectedRoute from "./components/ProtectedRoute";
import { RecordContextProvider } from "./context/RecordContext";
import { HoverPanelProvider } from "./context/HoverPanelContext";
import FeedbackStartPage from "./pages/feedback-start-page";
import FeedbackCreatePage from "./pages/feedback-create-page";
import FeedbackSummaryPage from "./pages/feedback-summary-page";
import FeedbackUpdatePage from "./pages/feedback-update-page";
import FeedbackDeletePage from "./pages/feedback-delete-page";
import DoctorFeedbackPage from "./pages/doctor-feedback-page";
import FeedbackReportPage from "./pages/feedback-report-page";
import PatientPrescriptionPage from "./pages/patient-prescription";

function App() {
  const { currentUser, loading } = useAuthContext();






  if (loading) {
    return <div className="loading-spinner">Loading...</div>;
  }

  return (
    <div>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
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
              <EncounterContextProvider>
                <HoverPanelProvider>
                  <DashboardWrapper />
                </HoverPanelProvider>
                </EncounterContextProvider>
              </RecordContextProvider>
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />

          <Route path="search" element={<DoctorSearch />} />  

          <Route path="patient-appointments" element={<PatientAppointmentsPage />} />
          <Route path="patient-prescription" element={<PatientPrescriptionPage />} />

          <Route path="dashboard" element={<Dashboard />} />
          <Route path="patients" element={<PatientsPage />} />
          <Route path="documents" element={<DocumentList />} />
          <Route path="prescription" element={<PrescriptionPage />} />
          <Route path="prescription-report" element={<PrescriptionReport />} />
          <Route path="schedule" element={<DoctorSchedule />} />   
          <Route path="meeting/:appointmentId" element={<TelemedicineMeeting />} />


          {/* Patient detail and nested tabs */}

          <Route path="patients/:id" element={<PatientDetailPage />}>
            <Route index element={<PatientInformationTab />} />
            <Route path="treatments" element={<AppointmentHistoryTab />} />
            <Route path="prescriptions" element={<NextTreatmentTab />} />
            <Route path="record" element={<MedicalRecordTab />} />
            <Route path="documents" element={<PatientDocumentList />} />
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