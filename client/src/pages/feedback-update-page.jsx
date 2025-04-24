import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import Button from "../components/ui/button";
import { toast } from "react-toastify";

export default function FeedbackUpdatePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [feedback, setFeedback] = useState(location.state?.feedback || null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [comments, setComments] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(!location.state?.feedback);
  const [error, setError] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const questionsPerPage = 2;
  const totalPages = 5;

  useEffect(() => {
    const fetchFeedbackAndQuestions = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch questions
        const questionsResponse = await fetch(`${process.env.REACT_APP_API_URL}/feedback/questions/all`);
        if (!questionsResponse.ok) {
          throw new Error(`Failed to fetch questions: ${questionsResponse.statusText}`);
        }
        const questionsData = await questionsResponse.json();
        setQuestions(questionsData);

        // Fetch feedback if not passed via state
        if (!feedback) {
          const feedbackResponse = await fetch(`${process.env.REACT_APP_API_URL}/feedback/${id}`);
          if (!feedbackResponse.ok) {
            throw new Error(`Failed to fetch feedback: ${feedbackResponse.statusText}`);
          }
          const feedbackData = await feedbackResponse.json();
          setFeedback(feedbackData);
          setComments(feedbackData.comments || "");

          const initialAnswers = {};
          feedbackData.answers.forEach(a => {
            const question = questionsData.find(q => q._id === a.questionId);
            initialAnswers[a.questionId] = question.hasDetails ? { value: a.answer.value, details: a.answer.details || "" } : a.answer;
          });
          setAnswers(initialAnswers);
        } else {
          setComments(feedback.comments || "");
          const initialAnswers = {};
          feedback.answers.forEach(a => {
            const question = questionsData.find(q => q._id === a.questionId);
            initialAnswers[a.questionId] = question.hasDetails ? { value: a.answer.value, details: a.answer.details || "" } : a.answer;
          });
          setAnswers(initialAnswers);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load feedback. Please try again.");
        toast.error("Failed to load feedback. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchFeedbackAndQuestions();
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

  const validateNumberInput = (questionText, value) => {
    if (questionText === "How many days did it take for you to feel noticeable improvement?") {
      const num = parseInt(value);
      if (isNaN(num) || num < 0 || num > 30) {
        return "Please enter a number between 0 and 30.";
      }
    }
    if (questionText === "How would you rate your overall health improvement after the consultation?") {
      const num = parseInt(value);
      if (isNaN(num) || num < 0 || num > 5) {
        return "Please enter a number between 0 and 5.";
      }
    }
    return null;
  };

  const badWords = ["fuck", "shit", "asshole", "damn", "bitch"];
  const checkForBadWords = (text) => {
    const lowerText = text.toLowerCase();
    return badWords.some(word => lowerText.includes(word));
  };

  const handleAnswerChange = (questionId, value, details = "") => {
    const question = questions.find(q => q._id === questionId);
    if (question.type === "number") {
      const error = validateNumberInput(question.text, value);
      if (error) {
        toast.error(error);
        return;
      }
    }
    setAnswers(prev => ({
      ...prev,
      [questionId]: question.hasDetails ? { value, details } : value,
    }));
  };

  const validatePage = () => {
    const startIndex = (currentPage - 1) * questionsPerPage;
    const endIndex = startIndex + questionsPerPage;
    const pageQuestions = questions.slice(startIndex, endIndex);

    return pageQuestions.every(q => {
      const answer = answers[q._id];
      if (!answer && answer !== 0) return false;
      if (q.hasDetails && answer.value === "Yes" && !answer.details) return false;
      return true;
    });
  };

  const handleNext = () => {
    if (!validatePage()) {
      toast.error("Please answer all questions on this page.");
      return;
    }
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!validatePage()) {
      toast.error("Please answer all questions.");
      return;
    }

    if (checkForBadWords(comments)) {
      toast.error("Comments contain inappropriate language. Please remove bad words.");
      return;
    }

    const formattedAnswers = Object.keys(answers).map(questionId => ({
      questionId,
      answer: answers[questionId],
    }));

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/feedback/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: formattedAnswers, comments }),
      });
      const data = await response.json();
      if (response.ok) {
        toast.success("Feedback updated successfully!");
        navigate(`/account/feedback/summary/${id}`, { state: { feedback: data } });
      } else {
        toast.error(data.message || "Error updating feedback");
      }
    } catch (error) {
      toast.error("Error updating feedback");
    }
  };

  const renderQuestion = (question, index) => {
    const answer = answers[question._id] || (question.hasDetails ? { value: "", details: "" } : "");

    return (
      <div key={question._id} className="mb-4">
        <label className="block text-sm font-medium text-gray-700">
          {question.text}
        </label>
        {question.type === "number" ? (
          <input
            type="number"
            value={answer}
            onChange={e => handleAnswerChange(question._id, e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        ) : (
          <div className="mt-1 flex space-x-4">
            {question.options.map(option => (
              <label key={option} className="inline-flex items-center">
                <input
                  type="radio"
                  name={`question-${question._id}`}
                  value={option}
                  checked={question.hasDetails ? answer.value === option : answer === option}
                  onChange={e => handleAnswerChange(question._id, e.target.value)}
                  className="form-radio h-4 w-4 text-blue-600"
                  required
                />
                <span className="ml-2 text-sm text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        )}
        {question.hasDetails && answer.value === "Yes" && (
          <input
            type="text"
            placeholder="Please specify"
            value={answer.details}
            onChange={e => handleAnswerChange(question._id, answer.value, e.target.value)}
            className="mt-2 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-end z-50">
        <div className="bg-white w-full md:w-1/3 h-full p-6 rounded-lg shadow-lg">
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-end z-50">
        <div className="bg-white w-full md:w-1/3 h-full p-6 rounded-lg shadow-lg">
          <p className="text-red-500">{error}</p>
          <Button className="mt-4" onClick={() => navigate("/account/feedback")}>
            Back to Feedback
          </Button>
        </div>
      </div>
    );
  }

  if (timeRemaining <= 0) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-end z-50">
        <div className="bg-white w-full md:w-1/3 h-full p-6 rounded-lg shadow-lg">
          <p className="text-red-500">The edit window has expired (10 minutes).</p>
          <Button className="mt-4" onClick={() => navigate(`/account/feedback/summary/${id}`, { state: { feedback } })}>
            Back to Summary
          </Button>
        </div>
      </div>
    );
  }

  const startIndex = (currentPage - 1) * questionsPerPage;
  const endIndex = startIndex + questionsPerPage;
  const currentQuestions = questions.slice(startIndex, endIndex);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-end z-50">
      <div className="bg-white w-full md:w-1/3 h-full p-6 rounded-lg shadow-lg transform transition-transform duration-300 ease-in-out translate-x-0">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Edit Feedback</h2>
          <button onClick={() => navigate(`/account/feedback/summary/${id}`, { state: { feedback } })} className="text-gray-500">
            Cancel
          </button>
        </div>
        <div className="flex justify-center mb-4">
          {Array.from({ length: totalPages }, (_, i) => (
            <div
              key={i}
              className={`w-8 h-8 flex items-center justify-center rounded-full mx-1 ${
                currentPage === i + 1 ? "bg-blue-600 text-white" : "bg-gray-300 text-gray-700"
              }`}
            >
              {i + 1}
            </div>
          ))}
        </div>
        {currentQuestions.map((question, index) => renderQuestion(question, index))}
        {currentPage === totalPages && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Other Comments
            </label>
            <textarea
              value={comments}
              onChange={e => setComments(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
              rows="3"
            />
          </div>
        )}
        <div className="mt-4">
          <p className="text-sm text-gray-500">
            Time remaining to edit: {Math.floor(timeRemaining / 60)}:
            {(timeRemaining % 60).toString().padStart(2, "0")}
          </p>
        </div>
        <div className="flex justify-between mt-4">
          <Button
            variant="secondary"
            onClick={currentPage === 1 ? () => navigate(`/account/feedback/summary/${id}`, { state: { feedback } }) : handlePrevious}
          >
            {currentPage === 1 ? "Cancel" : "Previous"}
          </Button>
          <Button
            onClick={currentPage === totalPages ? handleSubmit : handleNext}
          >
            {currentPage === totalPages ? "Save" : "Next"}
          </Button>
        </div>
      </div>
    </div>
  );
}