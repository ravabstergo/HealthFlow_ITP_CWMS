import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Card from "../components/ui/card";
import Button from "../components/ui/button";
import { Search } from "lucide-react";
import Input from "../components/ui/input";
import { toast } from "react-toastify";
import FeedbackReportPopup from "./feedback-report-page";

export default function DoctorFeedbackPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [feedbacks, setFeedbacks] = useState([]);
  const [metrics, setMetrics] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [showReportPopup, setShowReportPopup] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        console.log("[DoctorFeedbackPage] Fetching feedbacks...");
        const feedbacksResponse = await fetch(`${process.env.REACT_APP_API_URL}/feedback/doctor/me`);
        if (!feedbacksResponse.ok) {
          if (feedbacksResponse.status === 401) {
            localStorage.removeItem("token");
            toast.error("Session expired. Please log in again.");
            navigate("/login");
            return;
          }
          throw new Error("Failed to fetch feedbacks");
        }
        const feedbacksData = await feedbacksResponse.json();
        console.log("[DoctorFeedbackPage] Fetched feedbacks:", feedbacksData);
        setFeedbacks(Array.isArray(feedbacksData) ? feedbacksData : []);

        console.log("[DoctorFeedbackPage] Fetching metrics...");
        const metricsResponse = await fetch(`${process.env.REACT_APP_API_URL}/feedback/metrics/me`);
        if (!metricsResponse.ok) {
          throw new Error("Failed to fetch metrics");
        }
        const metricsData = await metricsResponse.json();
        console.log("[DoctorFeedbackPage] Fetched metrics:", metricsData);
        setMetrics(metricsData || {});
      } catch (error) {
        console.error("[DoctorFeedbackPage] Error fetching data:", error.message);
        toast.error(error.message || "Failed to load data. Displaying available content.");
        setFeedbacks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [location.pathname, navigate]);

  const handleGenerateReport = () => {
    console.log("[DoctorFeedbackPage] Opening report popup");
    setShowReportPopup(true);
  };

  const closeReportPopup = () => {
    console.log("[DoctorFeedbackPage] Closing report popup");
    setShowReportPopup(false);
  };

  const filteredFeedbacks = feedbacks.filter(f =>
    f.patientId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || ""
  );

  const handleViewFeedback = (feedback) => {
    setSelectedFeedback(feedback);
  };

  const closeModal = () => {
    setSelectedFeedback(null);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold mb-6">Doctor Feedback</h1>
        <Card>
          <p className="text-gray-500">Loading feedbacks...</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 pl-6 pr-6 pt-4 pb-4">
      <h1 className="text-2xl font-bold mb-6">Doctor Feedback</h1>
      <Card>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="p-4 bg-gray-50 rounded-lg text-center">
            <p className="text-3xl font-bold">{metrics.totalFeedbackReceived || 0}</p>
            <p className="text-sm text-gray-500">Total Feedback Received</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg text-center">
            <p className="text-3xl font-bold">{metrics.patientSatisfactionRate || "0%"}</p>
            <p className="text-sm text-gray-500">Patient Satisfaction Rate</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg text-center">
            <p className="text-3xl font-bold">{metrics.treatmentSuccessRate || "0%"}</p>
            <p className="text-sm text-gray-500">Treatment Success Rate (%)</p>
          </div>
        </div>
        <Button onClick={handleGenerateReport}>Generate Feedback Report</Button>
      </Card>
      
      {/* Search Bar */}
      <div className="relative w-1/3 mx-auto mb-6">
        <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search patients..."
          className="pl-8 pr-3 py-2.5 w-full bg-gray-100 rounded-[10px] text-sm focus:outline-none focus:ring-1 focus:ring-indigo-100"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <Card>
        {/* Feedback List Table with Scroll */}
        <div className="flex justify-center px-4">
          <div className="w-full max-w-9xl">
            <div className="overflow-hidden rounded-xl max-h-[700px] overflow-y-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-100 sticky top-0">
                    <th className="px-12 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      NAME
                    </th>
                    <th className="px-12 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      CONTACT
                    </th>
                    <th className="px-12 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider"></th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {filteredFeedbacks.length === 0 ? (
                    <tr>
                      <td colSpan="3" className="text-center py-4 text-gray-500">
                        No feedback available.
                      </td>
                    </tr>
                  ) : (
                    filteredFeedbacks.map(f => (
                      <tr key={f._id} className="hover:bg-gray-50">
                        <td className="px-12 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {f.patientId?.name || "Unknown Patient"}
                          </div>
                        </td>
                        <td className="px-12 py-4 whitespace-nowrap">
                          <div className="text-sm text-indigo-400">
                            {f.patientId?.email || "N/A"}
                          </div>
                        </td>
                        <td className="px-12 py-4 whitespace-nowrap text-right">
                          <button
                            onClick={() => handleViewFeedback(f)}
                            className="inline-flex items-center px-4 py-2 border border-indigo-300 text-sm font-medium rounded-[10px] text-indigo-600 bg-white hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          >
                            View Feedback
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </Card>

      {/* Right-Side Modal for Viewing Feedback */}
      {selectedFeedback && (
        <div className="fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black opacity-30" onClick={closeModal}></div>
          <div className="relative ml-auto h-full w-96 bg-white shadow-xl p-6 overflow-y-auto" style={{ marginTop: '2rem', marginBottom: '2rem', marginRight: '2rem', borderRadius: '1rem' }}>
            <h2 className="text-xl font-bold mb-4">Client Feedback</h2>
            <div className="space-y-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-700">Patient Name</p>
                <p className="text-sm text-gray-500">{selectedFeedback.patientId?.name || "Unknown Patient"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-700">Email</p>
                <p className="text-sm text-gray-500">{selectedFeedback.patientId?.email || "N/A"}</p>
              </div>
              {selectedFeedback.answers.map((a, idx) => (
                <div key={idx} className="space-y-1">
                  <p className="text-sm font-medium text-gray-700">
                    {a.questionId?.text || "Unknown Question"}
                  </p>
                  <p className="text-sm text-gray-500">
                    {typeof a.answer === "object" ? (a.answer.value || "No") : a.answer}
                    {a.answer.details && a.answer.value === "Yes" && (
                      <span className="block text-xs text-gray-400">
                        Details: {a.answer.details}
                      </span>
                    )}
                  </p>
                </div>
              ))}
              {selectedFeedback.comments && (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-700">Comments</p>
                  <p className="text-sm text-gray-500">{selectedFeedback.comments}</p>
                </div>
              )}
            </div>
            <Button onClick={closeModal} className="mt-4 w-full">Close</Button>
          </div>
        </div>
      )}

      {/* Right-Side Popup for Feedback Report */}
      {showReportPopup && <FeedbackReportPopup onClose={closeReportPopup} />}
    </div>
  );
}