import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../components/ui/card";
import Button from "../components/ui/button";
import { toast } from "react-toastify";

export default function FeedbackStartPage() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [error, setError] = useState(null); // Add state to track errors
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        console.log("[FeedbackStartPage] Fetching feedbacks...");
        const response = await fetch(`${process.env.REACT_APP_API_URL}/feedback/patient/me`);
        if (!response.ok) {
          throw new Error(`Failed to fetch feedbacks: ${response.statusText}`);
        }
        const data = await response.json();
        console.log("[FeedbackStartPage] Fetched feedbacks:", data);
        // Ensure data is an array; if not, set to empty array
        setFeedbacks(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching feedbacks:", error);
        setFeedbacks([]); // Reset to empty array on error
        setError("Failed to load feedbacks. Please try again.");
        toast.error("Failed to load feedbacks. Please try again.");
      }
    };
    fetchFeedbacks();
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold mb-6">Feedback</h1>
      {error ? (
        <Card>
          <p className="text-red-500">{error}</p>
          <Button
            className="mt-4"
            onClick={() => navigate("/account/feedback/create/PE123")}
          >
            Give Feedback
          </Button>
        </Card>
      ) : feedbacks.length === 0 ? (
        <Card>
          <p className="text-gray-500">No feedback yet!</p>
          <Button
            className="mt-4"
            onClick={() => navigate("/account/feedback/create/PE123")}
          >
            Give Feedback
          </Button>
        </Card>
      ) : (
        feedbacks.map(feedback => (
          <div key={feedback._id}>
            <Button onClick={() => navigate(`/account/feedback/summary/${feedback._id}`)}>
              View Feedback
            </Button>
          </div>
        ))
      )}
    </div>
  );
}