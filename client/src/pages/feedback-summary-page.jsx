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
        // Sort feedbacks by createdAt in descending order (newest first)
        const sortedData = Array.isArray(data) 
          ? data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          : [];
        setFeedbacks(sortedData);
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
        <div className="flex justify-center px-4">
          <div className="w-full max-w-9xl">
            <div className="overflow-hidden rounded-xl max-h-[700px] overflow-y-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-100 sticky top-0">
                    <th className="px-12 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      ENCOUNTER ID
                    </th>
                    <th className="px-12 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      SUBMITTED AT
                    </th>
                    <th className="px-12 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider"></th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {feedbacks.length === 0 ? (
                    <tr>
                      <td colSpan="3" className="text-center py-4 text-gray-500">
                        No feedback available.
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
                          <td className="px-12 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {f.encounterId}
                            </div>
                          </td>
                          <td className="px-12 py-4 whitespace-nowrap">
                            <div className="text-sm text-indigo-400">
                              {new Date(f.createdAt).toLocaleString()}
                            </div>
                          </td>
                          <td className="px-12 py-4 whitespace-nowrap text-right">
                            <button
                              onClick={() => handleViewFeedback(f)}
                              className="inline-flex items-center px-4 py-2 border border-indigo-300 text-sm font-medium rounded-[10px] text-indigo-600 bg-white hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mr-2"
                            >
                              View Feedback
                            </button>
                            {canEditOrDelete && (
                              <>
                                <Link
                                  to={`/account/feedback/edit/${f._id}`}
                                  state={{ feedback: f }}
                                  className="mr-2"
                                >
                                  <button
                                    className="inline-flex items-center px-4 py-2 border border-indigo-300 text-sm font-medium rounded-[10px] text-indigo-600 bg-white hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                  >
                                    Edit
                                  </button>
                                </Link>
                                <Link
                                  to={`/account/feedback/delete/${f._id}`}
                                  state={{ feedback: f }}
                                >
                                  <button
                                    className="inline-flex items-center px-4 py-2 border border-red-300 text-sm font-medium rounded-[10px] text-red-600 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                  >
                                    Delete
                                  </button>
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
          </div>
        </div>
      </Card>

      {/* Right-Side Modal for Viewing Feedback */}
      {selectedFeedback && (
        <div className="fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black opacity-30" onClick={closeModal}></div>
          <div
            className="relative ml-auto h-full w-96 bg-white shadow-xl p-6 overflow-y-auto"
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