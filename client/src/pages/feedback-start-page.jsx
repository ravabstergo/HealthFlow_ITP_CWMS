import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../components/ui/card";
import Button from "../components/ui/button";

export default function FeedbackStartPage() {
  const [feedbacks, setFeedbacks] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/feedback/patient/me`);
        const data = await response.json();
        setFeedbacks(data);
      } catch (error) {
        console.error("Error fetching feedbacks:", error);
      }
    };
    fetchFeedbacks();
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold mb-6">Feedback</h1>
      {feedbacks.length === 0 ? (
        <Card>
          <p className="text-gray-500">No feedback yet!</p>
          <Button
            className="mt-4"
            onClick={() => navigate("/account/feedback/create/PE123")} // Replace with actual Encounter ID
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