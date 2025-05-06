import { useEffect, useState } from "react";
import Card from "../components/ui/card";
import Button from "../components/ui/button";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import TokenService from "../services/TokenService"; // Import TokenService for token

export default function FeedbackSummaryPage() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFeedback, setSelectedFeedback] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = TokenService.getAccessToken(); // Retrieve the access token
        if (!token) {
          throw new Error("No access token found. Please log in again.");
        }

        const response = await fetch(`${process.env.REACT_APP_API_URL}/feedback/patient/me`, {
          headers: {
            "Content-Type": "application/json", // Ensure Content-Type is set
            Authorization: `Bearer ${token}`, // Use TokenService token
          },
        });
        if (!response.ok) {
          throw new Error("Failed to fetch feedback");
        }
        const data = await response.json();
        setFeedbacks(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("[FeedbackSummaryPage] Error fetching data:", error.message);
        toast.error("Failed to load feedback.");
        setFeedbacks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleViewFeedback = (feedback) => {
    setSelectedFeedback(feedback);
  };

  const closeModal = () => {
    setSelectedFeedback(null);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold mb-6">Feedback Summary</h1>
        <Card>
          <p className="text-gray-500">Loading feedback...</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold mb-6">Feedback Summary</h1>
      <Card>
        <div className="p-4 bg-gray-50 rounded-lg text-center">
          <p className="text-3xl font-bold">{feedbacks.length}</p>
          <p className="text-sm text-gray-500">Total Feedback Submitted</p>
        </div>
      </Card>
      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Encounter ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Submitted At
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {feedbacks.length === 0 ? (
                <tr>
                  <td colSpan="3" className="px-6 py-4 text-center text-gray-500">
                    No feedback submitted.
                  </td>
                </tr>
              ) : (
                feedbacks.map(f => {
                  const now = new Date();
                  const createdAt = new Date(f.createdAt);
                  const diffInMinutes = (now - createdAt) / (1000 * 60);
                  const canEditOrDelete = diffInMinutes <= 10;

                  return (
                    <tr key={f._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {f.encounterId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(f.createdAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Button
                          variant="link"
                          onClick={() => handleViewFeedback(f)}
                          className="mr-2"
                        >
                          View
                        </Button>
                        {canEditOrDelete && (
                          <>
                            <Link
                              to={`/account/feedback/edit/${f._id}`}
                              state={{ feedback: f }} // Pass feedback object in state
                              className="mr-2"
                            >
                              <Button variant="link">Edit</Button>
                            </Link>
                            <Link
                              to={`/account/feedback/delete/${f._id}`}
                              state={{ feedback: f }} // Consistent with delete page
                            >
                              <Button variant="link" className="text-red-600">
                                Delete
                              </Button>
                            </Link>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Right-Side Modal for Viewing Feedback */}
      {selectedFeedback && (
        <div className="fixed inset-0 z-50 flex">
          {/* Overlay */}
          <div className="fixed inse t-0 bg-black opacity-50" onClick={closeModal}></div>
          {/* Modal Content */}
          <div
            className="relative ml-auto w-full max-w-lg bg-white shadow-xl p-6 overflow-y-auto"
            style={{ marginTop: '2rem', marginBottom: '2rem', marginRight: '2rem', borderRadius: '1rem' }}
          >
            <h2 className="text-xl font-bold mb-4">Feedback Details</h2>
            <div className="space-y-4">
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
            <Button onClick={closeModal} className="mt-6 w-full">Close</Button>
          </div>
        </div>
      )}
    </div>
  );
}