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
    <div className="space-y-4">
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
      <div className="flex space-x-4 mb-6">
        <Input
          placeholder="Search patients..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          icon={<Search className="w-4 h-4 text-gray-500" />}
          className="max-w-md"
        />
      </div>
      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredFeedbacks.length === 0 ? (
                <tr>
                  <td colSpan="3" className="px-6 py-4 text-center text-gray-500">
                    No feedback available.
                  </td>
                </tr>
              ) : (
                filteredFeedbacks.map(f => (
                  <tr key={f._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full overflow-hidden mr-3">
                          <img
                            src="/placeholder.svg?height=40&width=40"
                            alt={f.patientId?.name || "Patient"}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="font-medium text-gray-900">{f.patientId?.name || "Unknown Patient"}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {f.patientId?.email || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button
                        variant="link"
                        onClick={() => handleViewFeedback(f)}
                      >
                        View Feedback
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
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