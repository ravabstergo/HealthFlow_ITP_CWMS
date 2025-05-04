import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/ui/button";
import { toast } from "react-toastify";
import TokenService from "../services/TokenService"; // Import TokenService for token
import { X } from "lucide-react"; // Import X icon from lucide-react

export default function FeedbackCreatePage() {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [comments, setComments] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const questionsPerPage = 2;
  const totalPages = 5;

  useEffect(() => {       
    const fetchQuestions = async () => {
      try {
        console.log("[FeedbackCreatePage] Fetching questions...");
        const response = await fetch(`${process.env.REACT_APP_API_URL}/feedback/questions/all`);
        if (!response.ok) {
          throw new Error(`Failed to fetch questions: ${response.statusText}`);
        }
        const data = await response.json();
        console.log("[FeedbackCreatePage] Questions fetched:", data);
        setQuestions(data);
        const initialAnswers = {};
        data.forEach(q => {
          initialAnswers[q._id] = q.type === "number" ? "" : (q.type === "yesNoWithDetails" ? { value: "", details: "" } : "");
        });
        setAnswers(initialAnswers);
      } catch (error) {
        console.error("[FeedbackCreatePage] Error fetching questions:", error);
        toast.error("Failed to load feedback questions. Please try again.");
      }
    };
    fetchQuestions();
  }, []);

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
      [questionId]: question.type === "yesNoWithDetails" ? { value, details } : value,
    }));
  };

  const validatePage = () => {
    const startIndex = (currentPage - 1) * questionsPerPage;
    const endIndex = startIndex + questionsPerPage;
    const pageQuestions = questions.slice(startIndex, endIndex);

    return pageQuestions.every(q => {
      const answer = answers[q._id];
      if (!answer && answer !== 0) return false;
      if (q.type === "yesNoWithDetails" && answer.value === "Yes" && !answer.details) return false;
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
      const token = TokenService.getAccessToken(); // Retrieve the access token
      if (!token) {
        throw new Error("No access token found. Please log in again.");
      }

      const response = await fetch(`${process.env.REACT_APP_API_URL}/feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Add the Authorization header with the token
        },
        body: JSON.stringify({
          encounterId: "PE123",
          answers: formattedAnswers,
          comments,
          doctorId: "671d7f5e9d8e2b4c5f6a7b8c",
        }),
      });
      const data = await response.json();
      if (response.ok) {
        toast.success("Feedback submitted successfully!");
        navigate(`/account/feedback/summary/${data._id}`, { state: { feedback: data } });
      } else {
        toast.error(data.message || "Error submitting feedback");
      }
    } catch (error) {
      toast.error("Error submitting feedback");
    }
  };

  const renderQuestion = (question, index) => {
    const answer = answers[question._id] || (question.type === "yesNoWithDetails" ? { value: "", details: "" } : "");

    // Define options based on question type
    const options = question.type === "multipleChoice" ? question.options : ["Yes", "No"];

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
            {options.map(option => (
              <label key={option} className="inline-flex items-center">
                <input
                  type="radio"
                  name={`question-${question._id}`}
                  value={option}
                  checked={question.type === "yesNoWithDetails" ? answer.value === option : answer === option}
                  onChange={e => handleAnswerChange(question._id, e.target.value, question.type === "yesNoWithDetails" ? answer.details : "")}
                  className="form-radio h-4 w-4 text-blue-600"
                  required
                />
                <span className="ml-2 text-sm text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        )}
        {question.type === "yesNoWithDetails" && answer.value === "Yes" && (
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

  const startIndex = (currentPage - 1) * questionsPerPage;
  const endIndex = startIndex + questionsPerPage;
  const currentQuestions = questions.slice(startIndex, endIndex);

  const handleBackgroundClick = (e) => {
    if (e.target.id === "backdrop") {
      navigate("/account/feedback");
    }
  };

  return (
    <div
      id="backdrop"
      onClick={handleBackgroundClick}
      className="fixed inset-0 z-50 bg-black/50 transition-opacity duration-300 flex justify-end m-0"
      aria-modal="true"
      role="dialog"
      aria-labelledby="panel-title"
    >
      <div
        className="relative m-4 h-[calc(100%-2rem)] w-[90vw] max-w-xl bg-white rounded-2xl shadow-xl transition-transform duration-30 flex flex-col"
      >
        <div className="flex justify-between items-center p-4 border-b sticky top-0 rounded-t-lg z-10">
          <h2 id="panel-title" className="text-lg font-semibold">Encounter ID #PE123</h2>
          <button
            onClick={() => navigate("/account/feedback")}
            className="p-1 rounded-full hover:bg-gray-100"
            aria-label="Close panel"
          >
            <X className="w-5 h-5 text-gray-500 hover:text-black" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto flex-grow">
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
          {questions.length === 0 ? (
            <p className="text-gray-500">Loading questions...</p>
          ) : (
            currentQuestions.map((question, index) => renderQuestion(question, index))
          )}
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
          <div className="flex justify-between">
            <Button
              variant="secondary"
              onClick={currentPage === 1 ? () => navigate("/account/feedback") : handlePrevious}
            >
              {currentPage === 1 ? "Cancel" : "Previous"}
            </Button>
            <Button
              onClick={currentPage === totalPages ? handleSubmit : handleNext}
            >
              {currentPage === totalPages ? "Submit" : "Next"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}