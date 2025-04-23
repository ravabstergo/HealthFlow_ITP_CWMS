import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Button from "../components/ui/button";
import { toast } from "react-toastify";

export default function FeedbackCreatePage() {
  const { encounterId } = useParams();
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
          initialAnswers[q._id] = q.hasDetails ? { value: "", details: "" } : "";
        });
        setAnswers(initialAnswers);
      } catch (error) {
        console.error("[FeedbackCreatePage] Error fetching questions:", error);
        toast.error("Failed to load feedback questions. Please try again.");
      }
    };
    fetchQuestions();
  }, []);

  const handleAnswerChange = (questionId, value, details = "") => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: details ? { value, details } : value,
    }));
  };

  const validatePage = () => {
    const startIndex = (currentPage - 1) * questionsPerPage;
    const endIndex = startIndex + questionsPerPage;
    const pageQuestions = questions.slice(startIndex, endIndex);

    return pageQuestions.every(q => {
      const answer = answers[q._id];
      if (!answer) return false;
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

    const formattedAnswers = Object.keys(answers).map(questionId => ({
      questionId,
      answer: answers[questionId],
    }));

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          encounterId,
          answers: formattedAnswers,
          comments,
          doctorId: "671d7f5e9d8e2b4c5f6a7b8c", // Hardcoded doctorId (replace with actual doctorId)
        }),
      });
      const data = await response.json();
      if (response.ok) {
        toast.success("Feedback submitted successfully!", {
          onClose: () => navigate(`/account/feedback/summary/${data._id}`),
        });
      } else {
        toast.error(data.message || "Error submitting feedback");
      }
    } catch (error) {
      toast.error("Error submitting feedback");
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
            min={question.options[0].split("-")[0]}
            max={question.options[0].split("-")[1]}
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

  const startIndex = (currentPage - 1) * questionsPerPage;
  const endIndex = startIndex + questionsPerPage;
  const currentQuestions = questions.slice(startIndex, endIndex);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-end z-50">
      <div className="bg-white w-full md:w-1/3 h-full p-6 shadow-lg transform transition-transform duration-300 ease-in-out translate-x-0">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Encounter ID #{encounterId}</h2>
          <button onClick={() => navigate("/account/feedback")} className="text-gray-500">
            Cancel
          </button>
        </div>
        <div className="flex justify-center mb-4">
          {Array.from({ length: totalPages }, (_, i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-full mx-1 ${
                currentPage === i + 1 ? "bg-blue-600" : "bg-gray-300"
              }`}
            />
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
  );
}