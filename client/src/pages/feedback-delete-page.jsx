import { useNavigate, useParams } from "react-router-dom";
import Button from "../components/ui/button";
import { toast } from "react-toastify";

export default function FeedbackDeletePage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const handleDelete = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/feedback/${id}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (response.ok) {
        toast.success("Feedback deleted successfully!", {
          onClose: () => navigate("/account/feedback"),
        });
      } else {
        toast.error(data.message || "Error deleting feedback");
      }
    } catch (error) {
      toast.error("Error deleting feedback");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-end z-50">
      <div className="bg-white w-full md:w-1/3 h-full p-6 shadow-lg transform transition-transform duration-300 ease-in-out translate-x-0">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Delete Feedback</h2>
          <button onClick={() => navigate(`/account/feedback/summary/${id}`)} className="text-gray-500">
            Cancel
          </button>
        </div>
        <p className="text-gray-700 mb-6">
          Are you sure you want to delete this feedback? This action cannot be undone.
        </p>
        <div className="flex justify-between">
          <Button
            variant="secondary"
            onClick={() => navigate(`/account/feedback/summary/${id}`)}
          >
            Cancel
          </Button>
          <Button onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
            Yes, I'm sure
          </Button>
        </div>
      </div>
    </div>
  );
}