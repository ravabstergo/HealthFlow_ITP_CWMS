import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Card from "../components/ui/card";
import Button from "../components/ui/button";
import { toast } from "react-toastify";

export default function FeedbackSummaryPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(true); // Add loading state
  const [error, setError] = useState(null); // Add error state

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        console.log("[FeedbackSummaryPage] Fetching feedback with ID:", id);
        setLoading(true);
        setError(null);
        const response = await fetch(`${process.env.REACT_APP_API_URL}/feedback/${id}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch feedback: ${response.statusText}`);
        }
        const data = await response.json();
        console.log("[FeedbackSummaryPage] Fetched feedback:", data);
        // Ensure data has the expected structure
        if (!data || !data.answers || !Array.isArray(data.answers)) {
          throw new Error("Invalid feedback data received");
        }
        setFeedback(data);
      } catch (error) {
        console.error("Error fetching feedback:", error);
        setError("Failed to load feedback. Please try again.");
        toast.error("Failed to load feedback. Please try again.");
        setFeedback(null);
      } finally {
        setLoading(false);
      }
    };
    fetchFeedback();
  }, [id]);

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

  if (error) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold mb-6">Feedback Summary</h1>
        <Card>
          <p className="text-red-500">{error}</p>
          <Button className="mt-4" onClick={() => navigate("/account/feedback")}>
            Back to Feedback
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold mb-6">Feedback Summary</h1>
      <Card>
        <h2 className="text-lg font-semibold mb-4">Feedback Details</h2>
        <div className="space-y-2">
          {feedback.answers.map((answer, index) => (
            <div key={index} className="border-b border-gray-200 py-2">
              <p className="text-sm font-medium text-gray-700">
                {answer.questionId.text}
              </p>
              <p className="text-sm text-gray-500">
                {typeof answer.answer === "object"
                  ? `${answer.answer.value} (${answer.answer.details})`
                  : answer.answer}
              </p>
            </div>
          ))}
        </div>
        {feedback.comments && (
          <div className="mt-4">
            <h3 className="text-sm font-medium text-gray-700">Comments</h3>
            <p className="text-sm text-gray-500">{feedback.comments}</p>
          </div>
        )}
        <div className="mt-4 flex space-x-2">
          <Button onClick={() => navigate(`/account/feedback/edit/${id}`)}>
            Edit Feedback
          </Button>
          <Button
            variant="danger"
            onClick={() => navigate(`/account/feedback/delete/${id}`)}
          >
            Delete Feedback
          </Button>
        </div>
      </Card>
    </div>
  );
}