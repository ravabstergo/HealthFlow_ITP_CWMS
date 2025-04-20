import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Button from "../components/ui/button";

export default function FeedbackSummaryPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [feedback, setFeedback] = useState(null);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/feedback/${id}`);
        const data = await response.json();
        setFeedback(data);

        const createdAt = new Date(data.createdAt);
        const now = new Date();
        const diffInSeconds = Math.max(0, 600 - Math.floor((now - createdAt) / 1000));
        setTimeLeft(diffInSeconds);
      } catch (error) {
        console.error("Error fetching feedback:", error);
      }
    };
    fetchFeedback();
  }, [id]);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  if (!feedback) return <div>Loading...</div>;

  const formatTime = seconds => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-end z-50">
      <div className="bg-white w-full md:w-1/3 h-full p-6 shadow-lg transform transition-transform duration-300 ease-in-out translate-x-0">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Encounter ID #{feedback.encounterId}</h2>
          <button onClick={() => navigate("/account/feedback")} className="text-gray-500">
            Cancel
          </button>
        </div>
        <h3 className="text-xl font-semibold mb-4">Feedback Summary</h3>
        <div className="space-y-2">
          {feedback.answers.map((a, index) => (
            <p key={index}>
              <strong>{a.questionId.text.split(" ")[0]}:</strong>{" "}
              {typeof a.answer === "object" ? `${a.answer.value}${a.answer.details ? ` (${a.answer.details})` : ""}` : a.answer}
            </p>
          ))}
          {feedback.comments && (
            <p>
              <strong>Comments:</strong> {feedback.comments}
            </p>
          )}
        </div>
        <p className={`mt-4 ${timeLeft < 60 ? "text-red-500" : "text-gray-500"}`}>
          Time left to edit or delete: {formatTime(timeLeft)}
        </p>
        <div className="flex justify-between mt-4">
          <Button
            variant="secondary"
            onClick={() => navigate(`/account/feedback/delete/${id}`)}
            disabled={timeLeft <= 0}
          >
            Delete
          </Button>
          <Button
            onClick={() => navigate(`/account/feedback/edit/${id}`)}
            disabled={timeLeft <= 0}
          >
            Edit
          </Button>
        </div>
      </div>
    </div>
  );
}