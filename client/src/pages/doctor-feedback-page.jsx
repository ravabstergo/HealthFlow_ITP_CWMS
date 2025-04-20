import { useEffect, useState } from "react";
import Card from "../components/ui/card";
import Button from "../components/ui/button";
import { Search, Filter } from "lucide-react";
import Input from "../components/ui/input";
import { jsPDF } from "jspdf";

export default function DoctorFeedbackPage() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [metrics, setMetrics] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTreatment, setFilterTreatment] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const feedbacksResponse = await fetch(`${process.env.REACT_APP_API_URL}/feedback/doctor/me`);
        const feedbacksData = await feedbacksResponse.json();
        setFeedbacks(feedbacksData);

        const metricsResponse = await fetch(`${process.env.REACT_APP_API_URL}/feedback/metrics/me`);
        const metricsData = await metricsResponse.json();
        setMetrics(metricsData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  const generateReport = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/feedback/report/generate`);
      const { reportData, aiAnalysis } = await response.json();

      const doc = new jsPDF();
      let y = 10;

      doc.setFontSize(16);
      doc.text("Feedback Report", 10, y);
      y += 10;

      reportData.forEach((data, index) => {
        doc.setFontSize(12);
        doc.text(`Patient: ${data.patient.name}`, 10, y);
        y += 5;
        doc.text(`Email: ${data.patient.email}`, 10, y);
        y += 5;

        doc.text("Feedback:", 10, y);
        y += 5;
        data.feedback.forEach(f => {
          doc.text(`${f.question}: ${typeof f.answer === "object" ? f.answer.value : f.answer}`, 15, y);
          y += 5;
        });

        if (data.comments) {
          doc.text(`Comments: ${data.comments}`, 10, y);
          y += 5;
        }

        doc.text("Prescriptions:", 10, y);
        y += 5;
        data.prescriptions.forEach(p => {
          p.medicines.forEach(m => {
            doc.text(`${m.medicineName} - ${m.dosage}, ${m.frequency}`, 15, y);
            y += 5;
          });
        });

        doc.text("Allergies:", 10, y);
        y += 5;
        data.allergies.forEach(a => {
          doc.text(`${a.allergen} - ${a.reaction} (${a.severity})`, 15, y);
          y += 5;
        });

        y += 5;
        if (y > 270) {
          doc.addPage();
          y = 10;
        }
      });

      doc.setFontSize(14);
      doc.text("AI Analysis:", 10, y);
      y += 5;
      doc.setFontSize(12);
      const splitAnalysis = doc.splitTextToSize(aiAnalysis, 180);
      doc.text(splitAnalysis, 10, y);

      doc.save("feedback-report.pdf");
    } catch (error) {
      console.error("Error generating report:", error);
    }
  };

  const filteredFeedbacks = feedbacks.filter(f => {
    const matchesSearch = f.patientId.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterTreatment ? f.treatment?.toLowerCase().includes(filterTreatment.toLowerCase()) : true;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold mb-6">Feedback</h1>
      <Card>
        <div className="grid grid-cols-5 gap-4 mb-6">
          <div>
            <p className="text-3xl font-bold">{metrics.totalConsultations || 0}</p>
            <p className="text-sm text-gray-500">Total Consultations</p>
          </div>
          <div>
            <p className="text-3xl font-bold">{metrics.totalFeedbackReceived || 0}</p>
            <p className="text-sm text-gray-500">Total Feedback Received</p>
          </div>
          <div>
            <p className="text-3xl font-bold">{metrics.patientSatisfactionRate || "0%"}</p>
            <p className="text-sm text-gray-500">Patient Satisfaction Rate</p>
          </div>
          <div>
            <p className="text-3xl font-bold">{metrics.peakConsultationDay || "N/A"}</p>
            <p className="text-sm text-gray-500">Peak Consultation Day</p>
          </div>
          <div>
            <p className="text-3xl font-bold">{metrics.treatmentSuccessRate || "0%"}</p>
            <p className="text-sm text-gray-500">Treatment Success Rate (%)</p>
          </div>
        </div>
        <Button onClick={generateReport}>Generate Feedback Report</Button>
      </Card>
      <div className="flex space-x-4 mb-6">
        <Input
          placeholder="Search patients..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          icon={<Search className="w-4 h-4 text-gray-400" />}
          className="max-w-md"
        />
        <Input
          placeholder="Filter by treatment..."
          value={filterTreatment}
          onChange={e => setFilterTreatment(e.target.value)}
          icon={<Filter className="w-4 h-4 text-gray-400" />}
          className="max-w-md"
        />
      </div>
      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Treatment
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredFeedbacks.map(f => (
                <tr key={f._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full overflow-hidden mr-3">
                        <img
                          src="/placeholder.svg?height=40&width=40"
                          alt={f.patientId.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="font-medium text-gray-900">{f.patientId.name}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {f.patientId.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    Dental service, Oral Disease {/* Replace with actual treatment data */}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Button
                      variant="link"
                      onClick={() => alert(JSON.stringify(f.answers, null, 2))} // Replace with modal or page navigation
                    >
                      View Feedback
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}