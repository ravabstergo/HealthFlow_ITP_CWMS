import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import Card from "../components/ui/card";
import Button from "../components/ui/button";
import { toast } from "react-toastify";

export default function FeedbackDeletePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [feedback, setFeedback] = useState(location.state?.feedback || null);
  const [loading, setLoading] = useState(!location.state?.feedback);
  const [error, setError] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(null);

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`${process.env.REACT_APP_API_URL}/feedback/${id}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch feedback: ${response.statusText}`);
        }
        const data = await response.json();
        setFeedback(data);
      } catch (error) {
        console.error("Error fetching feedback:", error);
        setError("Failed to load feedback. Please try again.");
        toast.error("Failed to load feedback. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (!feedback) {
      fetchFeedback();
    } else {
      setLoading(false);
    }
  }, [id, feedback]);

  useEffect(() => {
    if (feedback) {
      const createdAt = new Date(feedback.createdAt);
      const now = new Date();
      const diffInSeconds = Math.max(0, 600 - Math.floor((now - createdAt) / 1000));
      setTimeRemaining(diffInSeconds);

      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 0) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [feedback]);

  const handleDelete = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/feedback/${id}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (response.ok) {
        toast.success("Feedback deleted successfully!");
        navigate("/account/feedback");
      } else {
        toast.error(data.message || "Error deleting feedback");
      }
    } catch (error) {
      toast.error("Error deleting feedback");
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold mb-6">Delete Feedback</h1>
        <Card>
          <p className="text-gray-500">Loading feedback...</p>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold mb-6">Delete Feedback</h1>
        <Card>
          <p className="text-red-500">{error}</p>
          <Button className="mt-4" onClick={() => navigate("/account/feedback")}>
            Back to Feedback
          </Button>
        </Card>
      </div>
    );
  }

  if (timeRemaining <= 0) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold mb-6">Delete Feedback</h1>
        <Card>
          <p className="text-red-500">The delete window has expired (10 minutes).</p>
          <Button className="mt-4" onClick={() => navigate(`/account/feedback/summary/${id}`, { state: { feedback } })}>
            Back to Summary
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold mb-6">Delete Feedback</h1>
      <Card>
        <p className="text-gray-700 mb-4">
          Are you sure you want to delete this feedback? This action cannot be undone.
        </p>
        <p className="text-sm text-gray-500 mb-4">
          Time remaining to delete: {Math.floor(timeRemaining / 60)}:
          {(timeRemaining % 60).toString().padStart(2, "0")}
        </p>
        <div className="flex space-x-2">
          <Button variant="danger" onClick={handleDelete}>
            Delete Feedback
          </Button>
          <Button variant="secondary" onClick={() => navigate(`/account/feedback/summary/${id}`, { state: { feedback } })}>
            Cancel
          </Button>
        </div>
      </Card>
    </div>
  );
}