import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import Button from "../components/ui/button";
import { toast } from "react-toastify";
import TokenService from "../services/TokenService";

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
  const totalPages = Math.ceil(questions.length / questionsPerPage) || 5; // Dynamic totalPages

  console.log("Location State Feedback:", location.state?.feedback); // Debug
  console.log("API URL:", process.env.REACT_APP_API_URL); // Debug

  useEffect(() => {
    const fetchFeedbackAndQuestions = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = TokenService.getAccessToken();
        console.log("Token:", token); // Debug
        if (!token) {
          throw new Error("No access token found. Please log in again.");
        }

        // Fetch questions
        const questionsResponse = await fetch(`${process.env.REACT_APP_API_URL}/feedback/questions/all`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        console.log("Questions Response Status:", questionsResponse.status); // Debug
        if (!questionsResponse.ok) {
          const errorText = await questionsResponse.text();
          throw new Error(`Failed to fetch questions: ${questionsResponse.status} ${questionsResponse.statusText} - ${errorText}`);
        }
        const questionsData = await questionsResponse.json();
        console.log("Questions Data:", questionsData); // Debug
        setQuestions(Array.isArray(questionsData) ? questionsData : []);

        // Fetch feedback if not passed via state
        let feedbackData = feedback;
        if (!feedback) {
          const feedbackResponse = await fetch(`${process.env.REACT_APP_API_URL}/feedback/${id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });
          console.log("Feedback Response Status:", feedbackResponse.status); // Debug
          if (!feedbackResponse.ok) {
            const errorText = await feedbackResponse.text();
            throw new Error(`Failed to fetch feedback: ${feedbackResponse.status} ${feedbackResponse.statusText} - ${errorText}`);
          }
          feedbackData = await feedbackResponse.json();
          console.log("Feedback Data:", feedbackData); // Debug
          setFeedback(feedbackData);
        }

        // Initialize comments and answers
        setComments(feedbackData?.comments || "");
        const initialAnswers = {};
        if (feedbackData?.answers) {
          feedbackData.answers.forEach((a) => {
            const questionId = typeof a.questionId === "object" ? a.questionId?._id : a.questionId;
            const question = questionsData.find((q) => q._id === questionId);
            if (question) {
              initialAnswers[questionId] = question.hasDetails
                ? { value: a.answer?.value || "", details: a.answer?.details || "" }
                : a.answer || "";
            } else {
              console.warn(`Question not found for questionId: ${questionId}`); // Debug
            }
          });
        }
        console.log("Initial Answers:", initialAnswers); // Debug
        setAnswers(initialAnswers);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(error.message || "Failed to load feedback or questions. Please try again.");
        toast.error(error.message || "Failed to load feedback or questions. Please try again.");
        if (error.message.includes("401")) {
          navigate("/login"); // Redirect to login on unauthorized
        }
      } finally {
        setLoading(false);
      }
    };

    fetchFeedbackAndQuestions();
  }, [id, feedback, navigate]);

  useEffect(() => {
    if (feedback) {
      const createdAt = new Date(feedback.createdAt);
      const now = new Date();
      const diffInSeconds = Math.max(0, 600 - Math.floor((now - createdAt) / 1000));
      setTimeRemaining(diffInSeconds);

      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
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
    return badWords.some((word) => lowerText.includes(word));
  };

  const handleAnswerChange = (questionId, value, details = "") => {
    const question = questions.find((q) => q._id === questionId);
    if (!question) {
      console.warn("Question not found for ID:", questionId); // Debug
      return;
    }
    if (question.type === "number") {
      const error = validateNumberInput(question.text, value);
      if (error) {
        toast.error(error);
        return;
      }
    }
    setAnswers((prev) => ({
      ...prev,
      [questionId]: question.hasDetails ? { value, details } : value,
    }));
  };

  const validatePage = () => {
    const startIndex = (currentPage - 1) * questionsPerPage;
    const endIndex = startIndex + questionsPerPage;
    const pageQuestions = questions.slice(startIndex, endIndex);

    return pageQuestions.every((q) => {
      const answer = answers[q._id];
      if (!answer && answer !== 0) return false;
      if (q.hasDetails && answer?.value === "Yes" && !answer.details) return false;
      return true;
    });
  };

  const handleNext = () => {
    if (!validatePage()) {
      toast.error("Please answer all questions on this page.");
      return;
    }
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
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

    const formattedAnswers = Object.keys(answers).map((questionId) => ({
      questionId,
      answer: answers[questionId],
    }));

    try {
      const token = TokenService.getAccessToken();
      console.log("Submit Token:", token); // Debug
      if (!token) {
        throw new Error("No access token found. Please log in again.");
      }

      const response = await fetch(`${process.env.REACT_APP_API_URL}/feedback/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ answers: formattedAnswers, comments }),
      });
      console.log("Submit Response Status:", response.status); // Debug
      const data = await response.json();
      if (response.ok) {
        toast.success("Feedback updated successfully!");
        navigate(`/account/feedback/summary/${id}`, { state: { feedback: data } });
      } else {
        throw new Error(data.message || `Error updating feedback: ${response.status}`);
      }
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast.error(error.message || "Error updating feedback");
      if (error.message.includes("401")) {
        navigate("/login");
      }
    }
  };

  const renderQuestion = (question, index) => {
    const answer = answers[question._id] || (question.hasDetails ? { value: "", details: "" } : "");
    console.log(`Rendering Question ${question._id}:`, { question, answer }); // Debug

    return (
      <div key={question._id} className="mb-4">
        <label className="block text-sm font-medium text-gray-700">{question.text || "Unnamed Question"}</label>
        {question.type === "number" ? (
          <input
            type="number"
            value={answer}
            onChange={(e) => handleAnswerChange(question._id, e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        ) : (
          <div className="mt-1 flex space-x-4">
            {question.options?.length ? (
              question.options.map((option) => (
                <label key={option} className="inline-flex items-center">
                  <input
                    type="radio"
                    name={`question-${question._id}`}
                    value={option}
                    checked={question.hasDetails ? answer.value === option : answer === option}
                    onChange={(e) => handleAnswerChange(question._id, e.target.value)}
                    className="form-radio h-4 w-4 text-blue-600"
                    required
                  />
                  <span className="ml-2 text-sm text-gray-700">{option}</span>
                </label>
              ))
            ) : (
              <p className="text-red-500">No options available for this question</p>
            )}
          </div>
        )}
        {question.hasDetails && answer.value === "Yes" && (
          <input
            type="text"
            placeholder="Please specify"
            value={answer.details}
            onChange={(e) => handleAnswerChange(question._id, answer.value, e.target.value)}
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
          <p className="text-gray-500">Loading feedback and questions...</p>
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

  if (!feedback) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-end z-50">
        <div className="bg-white w-full md:w-1/3 h-full p-6 rounded-lg shadow-lg">
          <p className="text-red-500">No feedback data available.</p>
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
          <Button
            className="mt-4"
            onClick={() => navigate(`/account/feedback/summary/${id}`, { state: { feedback } })}
          >
            Back to Summary
          </Button>
        </div>
      </div>
    );
  }

  if (!questions.length) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-end z-50">
        <div className="bg-white w-full md:w-1/3 h-full p-6 rounded-lg shadow-lg">
          <p className="text-red-500">No questions available to edit feedback.</p>
          <Button
            className="mt-4"
            onClick={() => navigate(`/account/feedback/summary/${id}`, { state: { feedback } })}
          >
            Back to Summary
          </Button>
        </div>
      </div>
    );
  }

  const startIndex = (currentPage - 1) * questionsPerPage;
  const endIndex = startIndex + questionsPerPage;
  const currentQuestions = questions.slice(startIndex, endIndex);
  console.log("Current Questions:", currentQuestions); // Debug
  console.log("Total Pages:", totalPages, "Questions Length:", questions.length); // Debug

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-end z-50">
      <div className="bg-white w-full md:w-1/3 h-full p-6 rounded-lg shadow-lg transform transition-transform duration-300 ease-in-out translate-x-0">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Edit Feedback</h2>
          <button
            onClick={() => navigate(`/account/feedback/summary/${id}`, { state: { feedback } })}
            className="text-gray-500"
          >
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
        {currentQuestions.length ? (
          currentQuestions.map((question, index) => renderQuestion(question, index))
        ) : (
          <p className="text-gray-500">No questions available for this page. Please check the number of questions.</p>
        )}
        {currentPage === totalPages && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Other Comments</label>
            <textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
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
            onClick={
              currentPage === 1
                ? () => navigate(`/account/feedback/summary/${id}`, { state: { feedback } })
                : handlePrevious
            }
          >
            {currentPage === 1 ? "Cancel" : "Previous"}
          </Button>
          <Button onClick={currentPage === totalPages ? handleSubmit : handleNext}>
            {currentPage === totalPages ? "Save" : "Next"}
          </Button>
        </div>
      </div>
    </div>
  );
}