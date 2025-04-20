import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Button from "../components/ui/button";
import { toast } from "react-toastify";

export default function FeedbackUpdatePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [feedback, setFeedback] = useState(null);
  const [answers, setAnswers] = useState({});
  const [comments, setComments] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const questionsPerPage = 2;
  const totalPages = 5;

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/feedback/${id}`);
        const data = await response.json();
        setFeedback(data);
        setComments(data.comments);
        const initialAnswers = {};
        data.answers.forEach(a => {
          initialAnswers[a.questionId._id] = a.answer;
        });
        setAnswers(initialAnswers);
      } catch (error) {
        console.error("Error fetching feedback:", error);
      }
    };
    fetchFeedback();
  }, [id]);

  const handleAnswerChange = (questionId, value, details = "") => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: details ? { value, details } : value,
    }));
  };

  const validatePage = () => {
    const startIndex = (currentPage - 1) * questionsPerPage;
    const endIndex = startIndex + questionsPerPage;
    const pageQuestions = feedback.answers.slice(startIndex, endIndex);

    return pageQuestions.every(q => {
      const answer = answers[q.questionId._id];
      if (!answer) return false;
      if (q.questionId.hasDetails && answer.value === "Yes" && !answer.details) return false;
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

  const handleUpdate = async () => {
    if (!validatePage()) {
      toast.error("Please answer all questions.");
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
        toast.success("Feedback updated successfully!", {
          onClose: () => navigate(`/account/feedback/summary/${id}`),
        });
      } else {
        toast.error(data.message || "Error updating feedback");
      }
    } catch (error) {
      toast.error("Error updating feedback");
    }
  };

  const renderQuestion = (answer, index) => {
    const question = answer.questionId;
    const value = answers[question._id] || (question.hasDetails ? { value: "", details: "" } : "");

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
            value={value}
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
                  checked={question.hasDetails ? value.value === option : value === option}
                  onChange={e => handleAnswerChange(question._id, e.target.value)}
                  className="form-radio h-4 w-4 text-blue-600"
                  required
                />
                <span className="ml-2 text-sm text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        )}
        {question.hasDetails && value.value === "Yes" && (
          <input
            type="text"
            placeholder="Please specify"
            value={value.details}
            onChange={e => handleAnswerChange(question._id, value.value, e.target.value)}
            className="mt-2 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        )}
      </div>
    );
  };

  if (!feedback) return <div>Loading...</div>;

  const startIndex = (currentPage - 1) * questionsPerPage;
  const endIndex = startIndex + questionsPerPage;
  const currentQuestions = feedback.answers.slice(startIndex, endIndex);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-end z-50">
      <div className="bg-white w-full md:w-1/3 h-full p-6 shadow-lg transform transition-transform duration-300 ease-in-out translate-x-0">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Encounter ID #{feedback.encounterId}</h2>
          <button onClick={() => navigate(`/account/feedback/summary/${id}`)} className="text-gray-500">
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
        {currentQuestions.map((answer, index) => renderQuestion(answer, index))}
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
            onClick={currentPage === 1 ? () => navigate(`/account/feedback/summary/${id}`) : handlePrevious}
          >
            {currentPage === 1 ? "Cancel" : "Previous"}
          </Button>
          <Button
            onClick={currentPage === totalPages ? handleUpdate : handleNext}
          >
            {currentPage === totalPages ? "Update" : "Next"}
          </Button>
        </div>
      </div>
    </div>
  );
}