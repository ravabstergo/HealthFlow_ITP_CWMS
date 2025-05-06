import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/ui/button";
import { toast } from "react-toastify";
import TokenService from "../services/TokenService";
import { X, User, Calendar, Stethoscope } from "lucide-react";

export default function FeedbackCreatePage() {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [comments, setComments] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 3;

  const patientData = {
    name: "John Doe",
    age: 45,
    diagnosis: "Hypertension"
  };

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
    if (questionText === "How many days did you take the prescribed medication?") {
      const num = parseInt(value);
      if (value !== "" && (isNaN(num) || num < 0 || num > 30)) {
        return "Please enter a number between 0 and 30.";
      }
    }
    if (questionText === "How would you rate your overall satisfaction (1-5)?") {
      const num = parseInt(value);
      if (value !== "" && (isNaN(num) || num < 1 || num > 5)) {
        return "Please enter a number between 1 and 5.";
      }
    }
    return null;
  };

  const badWords = ["fuck", "shit", "asshole", "damn", "bitch"];
  const checkForBadWords = (text) => {
    const lowerText = text.toLowerCase();
    return badWords.some(word => lowerText.includes(word));
  };

  const handleAnswerChange = (questionId, value, details = "", isDetailsUpdate = false) => {
    const question = questions.find(q => q._id === questionId);
    if (question.type === "number") {
      const error = validateNumberInput(question.text, value);
      if (error) {
        toast.error(error);
        return;
      }
      setAnswers(prev => ({
        ...prev,
        [questionId]: value,
      }));
    } else if (question.type === "yesNoWithDetails") {
      const currentAnswer = answers[questionId];
      if (isDetailsUpdate) {
        setAnswers(prev => ({
          ...prev,
          [questionId]: { value: currentAnswer.value, details: value },
        }));
      } else {
        const isSelected = currentAnswer.value === value;
        const newAnswer = isSelected ? { value: "", details: "" } : { value, details: currentAnswer.details || "" };
        setAnswers(prev => ({
          ...prev,
          [questionId]: newAnswer,
        }));
      }
    } else {
      const currentAnswer = answers[questionId];
      const isSelected = currentAnswer === value;
      const newAnswer = isSelected ? "" : value;
      setAnswers(prev => ({
        ...prev,
        [questionId]: newAnswer,
      }));
    }
  };

  const validatePage = () => {
    if (currentPage === totalPages) {
      return true;
    }
    const startIndex = currentPage === 1 ? 0 : Math.ceil(questions.length / 2);
    const endIndex = currentPage === 1 ? Math.ceil(questions.length / 2) : questions.length;
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
    if (checkForBadWords(comments)) {
      toast.error("Comments contain inappropriate language. Please remove bad words.");
      return;
    }

    const formattedAnswers = Object.keys(answers).map(questionId => ({
      questionId,
      answer: answers[questionId],
    }));

    try {
      const token = TokenService.getAccessToken();
      if (!token) {
        throw new Error("No access token found. Please log in again.");
      }

      const response = await fetch(`${process.env.REACT_APP_API_URL}/feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
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
    const isCustomNumberInput = [
      "How many days did you take the prescribed medication?",
      "How would you rate your overall satisfaction (1-5)?"
    ].includes(question.text);

    const options = question.type === "multipleChoice" ? question.options : ["Yes", "No"];

    const handleIncrement = () => {
      const currentValue = parseInt(answer) || 0;
      let newValue = currentValue + 1;
      if (question.text === "How would you rate your overall satisfaction (1-5)?") {
        newValue = Math.min(newValue, 5);
      } else if (question.text === "How many days did you take the prescribed medication?") {
        newValue = Math.min(newValue, 30);
      }
      handleAnswerChange(question._id, newValue.toString());
    };

    const handleDecrement = () => {
      const currentValue = parseInt(answer) || 0;
      let newValue = currentValue - 1;
      if (question.text === "How would you rate your overall satisfaction (1-5)?") {
        newValue = Math.max(newValue, 1);
      } else if (question.text === "How many days did you take the prescribed medication?") {
        newValue = Math.max(newValue, 0);
      }
      handleAnswerChange(question._id, newValue.toString());
    };

    return (
      <div key={question._id} className="mb-6 p-4 bg-white rounded-xl shadow-sm border border-gray-200">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {question.text}
        </label>
        {question.type === "number" && isCustomNumberInput ? (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleDecrement}
              className="h-10 w-10 flex items-center justify-center text-sm rounded-xl border bg-white border-gray-300 text-gray-700 hover:bg-blue-50 transition-colors duration-200"
            >
              −
            </button>
            <input
              type="number"
              value={answer}
              onChange={e => handleAnswerChange(question._id, e.target.value)}
              className="h-10 w-16 text-center text-sm border border-gray-300 rounded-xl py-0 px-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
            <button
              type="button"
              onClick={handleIncrement}
              className="h-10 w-10 flex items-center justify-center text-sm rounded-xl border bg-white border-gray-300 text-gray-700 hover:bg-blue-50 transition-colors duration-200"
            >
              +
            </button>
          </div>
        ) : question.type === "number" ? (
          <input
            type="number"
            value={answer}
            onChange={e => handleAnswerChange(question._id, e.target.value)}
            className="block w-full border border-gray-300 rounded-xl shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        ) : (
          <div className="flex flex-wrap gap-3">
            {options.map(option => (
              <button
                key={option}
                type="button"
                onClick={() => handleAnswerChange(question._id, option)}
                className={`text-sm py-2 px-4 rounded-xl border transition-colors duration-200 ${
                  (question.type === "yesNoWithDetails" ? answer.value === option : answer === option)
                    ? "bg-blue-100 border-blue-300 text-blue-700"
                    : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        )}
        {question.type === "yesNoWithDetails" && answer.value === "Yes" && (
          <input
            type="text"
            placeholder="Please specify"
            value={answer.details}
            onChange={e => handleAnswerChange(question._id, e.target.value, undefined, true)}
            className="mt-3 block w-full border border-gray-300 rounded-xl shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        )}
      </div>
    );
  };

  const startIndex = currentPage === 1 ? 0 : Math.ceil(questions.length / 2);
  const endIndex = currentPage === 1 ? Math.ceil(questions.length / 2) : questions.length;
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
      className="fixed inset-0 z-50 bg-black/50 flex justify-end m-0"
      aria-modal="true"
      role="dialog"
      aria-labelledby="panel-title"
    >
      <div
        className="relative m-6 h-[calc(100%-3rem)] w-[90vw] max-w-xl bg-white rounded-2xl shadow-xl flex flex-col"
      >
        <div className="p-6 border-b sticky top-0 rounded-t-2xl z-10 bg-white">
          <div className="flex justify-between items-center">
            <h2 id="panel-title" className="text-xl font-medium">Encounter ID #PE123</h2>
            <button
              onClick={() => navigate("/account/feedback")}
              className="p-2 rounded-xl hover:bg-gray-100"
              aria-label="Close panel"
            >
              <X className="w-6 h-6 text-gray-500 hover:text-black" />
            </button>
          </div>
          <hr className="my-4 border-gray-200" />
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-gray-500" />
              <span className="font-semibold text-blue-600">{patientData.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-500" />
              <span>{patientData.age} yrs</span>
            </div>
            <div className="flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-gray-500" />
              <span className="font-semibold text-blue-600">{patientData.diagnosis}</span>
            </div>
          </div>
        </div>

        <div className="p-6 flex-grow flex flex-col justify-between">
          <div>
            <div className="flex justify-center items-center mb-8">
              {Array.from({ length: totalPages }, (_, i) => (
                <div key={i} className="flex items-center">
                  <div
                    className={`w-10 h-10 flex items-center justify-center rounded-xl ${
                      currentPage === i + 1 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    {i + 1}
                  </div>
                  {i < totalPages - 1 && (
                    <div
                      className={`h-1 w-12 ${
                        currentPage > i + 1 ? "bg-blue-600" : "bg-gray-200"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
            {questions.length === 0 ? (
              <p className="text-gray-500 text-center">Loading questions...</p>
            ) : currentPage < totalPages ? (
              <div className="space-y-6">
                {currentQuestions.map((question, index) => renderQuestion(question, index))}
              </div>
            ) : (
              <div className="p-4 bg-white rounded-xl shadow-sm border border-gray-200">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Other Comments
                </label>
                <textarea
                  value={comments}
                  onChange={e => setComments(e.target.value)}
                  className="block w-full border border-gray-300 rounded-xl shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500"
                  rows="4"
                />
              </div>
            )}
          </div>
          <div className="flex justify-between mt-8">
            <Button
              variant="secondary"
              onClick={currentPage === 1 ? () => navigate("/account/feedback") : handlePrevious}
              className="py-3 px-6 rounded-xl"
            >
              {currentPage === 1 ? "Cancel" : "Previous"}
            </Button>
            <Button
              onClick={currentPage === totalPages ? handleSubmit : handleNext}
              className="py-3 px-6 rounded-xl"
            >
              {currentPage === totalPages ? "Submit" : "Next"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}