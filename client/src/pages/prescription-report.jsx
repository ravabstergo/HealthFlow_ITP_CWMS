import { useState, useEffect } from "react";
import { useAuthContext } from "../context/AuthContext";
import TokenService from "../services/TokenService";
import Button from "../components/ui/button";
import { Bar } from 'react-chartjs-2';
import jsPDF from 'jspdf';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const API_URL = `${process.env.REACT_APP_API_URL}`;

export default function PrescriptionReport() {
  const { currentUser } = useAuthContext();
  const doctorId = currentUser?.id;
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [medicineStats, setMedicineStats] = useState({});
  const [reportPeriod, setReportPeriod] = useState('all'); // 'all', 'month', 'week', 'today', 'yesterday'

  useEffect(() => {
    const fetchPrescriptions = async () => {
      try {
        const token = TokenService.getAccessToken();
        const response = await fetch(`${API_URL}/prescriptions/doctor/${doctorId}`, {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch prescriptions");
        }

        const data = await response.json();
        setPrescriptions(data);
        calculateMedicineStats(data);
      } catch (err) {
        console.error("Error fetching prescriptions:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (doctorId) {
      fetchPrescriptions();
    }
  }, [doctorId]);

  const isWithinLastMonth = (date, currentDate) => {
    const lastMonth = new Date(currentDate);
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    return date >= lastMonth;
  };

  const isWithinLastWeek = (date, currentDate) => {
    const lastWeek = new Date(currentDate);
    lastWeek.setDate(lastWeek.getDate() - 7);
    return date >= lastWeek;
  };

  const isToday = (date, currentDate) => {
    return date.toDateString() === currentDate.toDateString();
  };

  const isYesterday = (date, currentDate) => {
    const yesterday = new Date(currentDate);
    yesterday.setDate(yesterday.getDate() - 1);
    return date.toDateString() === yesterday.toDateString();
  };

  const calculateMedicineStats = (prescriptionData) => {
    const stats = {};
    const currentDate = new Date();

    prescriptionData.forEach(prescription => {
      const prescriptionDate = new Date(prescription.dateIssued);
      
      // Filter based on report period
      if (reportPeriod === 'month' && !isWithinLastMonth(prescriptionDate, currentDate)) return;
      if (reportPeriod === 'week' && !isWithinLastWeek(prescriptionDate, currentDate)) return;
      if (reportPeriod === 'today' && !isToday(prescriptionDate, currentDate)) return;
      if (reportPeriod === 'yesterday' && !isYesterday(prescriptionDate, currentDate)) return;

      prescription.medicines.forEach(medicine => {
        if (!stats[medicine.medicineName]) {
          stats[medicine.medicineName] = {
            totalPrescribed: 0,
            dosageStats: {},
          };
        }

        stats[medicine.medicineName].totalPrescribed++;
        
        if (!stats[medicine.medicineName].dosageStats[medicine.dosage]) {
          stats[medicine.medicineName].dosageStats[medicine.dosage] = 1;
        } else {
          stats[medicine.medicineName].dosageStats[medicine.dosage]++;
        }
      });
    });

    setMedicineStats(stats);
  };

  useEffect(() => {
    calculateMedicineStats(prescriptions);
  }, [reportPeriod, prescriptions]);

  const handleDownloadReport = () => {
  const doc = new jsPDF();
  let y = 25.4; // Start content after 1-inch (25.4mm) padding
  const lineHeight = 7;
  const pageWidth = 210; // A4 width in mm
  const pageHeight = 297; // A4 height in mm

  // Add letterhead image as background layer (full page)
  const letterheadImg = "/letterhead.png"; // Path to letterhead in public folder
  try {
    doc.addImage(
      letterheadImg,
      "PNG",
      0,
      0,
      pageWidth,
      pageHeight,
      undefined,
      "FAST"
    );
  } catch (imgError) {
    console.error("[PrescriptionReport] Error loading letterhead image:", imgError.message);
  }
y += 5;
  // Add header text in white
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
 
  // Reset text color for content
  doc.setTextColor(0, 0, 0);
  y += 40;

  // Add report info section with blue accent
  doc.setDrawColor(41, 128, 185);
  doc.setLineWidth(0.5);
  doc.roundedRect(15, y, pageWidth - 30, 35, 3, 3);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(15, y, pageWidth - 30, 35, 3, 3, "F");
  y += 10;

  // Add doctor info
  doc.setFontSize(12);
  doc.text(`Generated for: Dr. ${currentUser?.name || "Unknown"}`, 25, y);
  y += lineHeight;
  doc.text(`Period: ${reportPeriod.charAt(0).toUpperCase() + reportPeriod.slice(1)}`, 25, y);
  y += lineHeight;
  doc.text(`Generation Date: ${new Date().toLocaleDateString()}`, 25, y);
  y += lineHeight * 3;

  // Add summary section
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Prescription Analysis Report", 20, y);
  

  y += lineHeight * 1.5;

  // Add statistics overview in a table
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.setFillColor(241, 246, 251);
  doc.rect(20, y, pageWidth - 40, 20, "F");
  y += 5;
  doc.text(`Total Medicines: ${Object.keys(medicineStats).length}`, 25, y);
  y += lineHeight;
  const totalPrescriptions = Object.values(medicineStats).reduce(
    (sum, stat) => sum + stat.totalPrescribed,
    0
  );
  doc.text(`Total Prescriptions Written: ${totalPrescriptions}`, 25, y);
  y += lineHeight * 2.5;

  // Add detailed statistics section
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Detailed Medicine Statistics", 20, y);
  y += lineHeight * 2;

  // Create table headers with blue background
  doc.setFillColor(41, 128, 185);
  doc.rect(20, y - 6, pageWidth - 40, 10, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.text("Medicine Name", 25, y);
  doc.text("Total Prescribed", pageWidth - 120, y);
  doc.text("Most Common Dosage", pageWidth - 60, y);
  y += lineHeight * 1.5;
  doc.setTextColor(0, 0, 0);

  // Add table content with alternating backgrounds
  Object.entries(medicineStats).forEach(([medicine, stats], index) => {
    if (y > pageHeight - 40) {
      doc.addPage();
      // Add letterhead as background on new pages
      try {
        doc.addImage(letterheadImg, "PNG", 0, 0, pageWidth, pageHeight, undefined, "FAST");
      } catch (imgError) {
        console.error("[PrescriptionReport] Error loading letterhead image on new page:", imgError.message);
      }
      y = 70; // Reset y to 1-inch padding on new pages
    }

    // Add alternating row background
    if (index % 2 === 0) {
      doc.setFillColor(248, 250, 252);
      doc.rect(20, y - 5, pageWidth - 40, lineHeight * 1.2, "F");
    }

    doc.setFont("helvetica", "normal");
    doc.text(medicine, 25, y);
    doc.text(stats.totalPrescribed.toString(), pageWidth - 115, y);

    // Find most common dosage
    const mostCommonDosage = Object.entries(stats.dosageStats).reduce((a, b) => (a[1] > b[1] ? a : b))[0];
    doc.text(mostCommonDosage, pageWidth - 60, y);

    y += lineHeight * 1.2;
  });
  y += lineHeight * 2;

  // Add dosage breakdown section if space allows
  if (y < pageHeight - 60) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("Dosage Breakdown", 20, y);
    y += lineHeight * 2;

    Object.entries(medicineStats).forEach(([medicine, stats]) => {
      if (y > pageHeight - 40) {
        doc.addPage();
        // Add letterhead as background on new pages
        try {
          doc.addImage(letterheadImg, "PNG", 0, 0, pageWidth, pageHeight, undefined, "FAST");
        } catch (imgError) {
          console.error("[PrescriptionReport] Error loading letterhead image on new page:", imgError.message);
        }
        y = 70; // Reset y to 1-inch padding on new pages
      }

      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text(medicine, 25, y);
      y += lineHeight;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      Object.entries(stats.dosageStats).forEach(([dosage, count]) => {
        doc.text(`• ${dosage}: ${count} prescription${count !== 1 ? "s" : ""}`, 30, y);
        y += lineHeight;
      });
      y += lineHeight;
    });
  }

  // Add footer to each page
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);

    // Add footer line
    doc.setDrawColor(41, 128, 185);
    doc.line(20, pageHeight - 20, pageWidth - 20, pageHeight - 20);

    // Add footer text
    doc.setFontSize(8);
    doc.setFont("helvetica", "italic");
    doc.text("HealthFlow Medical Center - Prescription Analysis Report", 20, pageHeight - 15);
    doc.text(`Page ${i} of ${pageCount}`, pageWidth - 40, pageHeight - 15);
  }

  // Save the PDF
  const filename = `prescription-analysis-${reportPeriod}-${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
};

  const chartData = {
    labels: Object.keys(medicineStats),
    datasets: [
      {
        label: 'Times Prescribed',
        data: Object.values(medicineStats).map(stat => stat.totalPrescribed),
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
        borderColor: 'rgb(53, 162, 235)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Medicine Prescription Frequency',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-600 text-center py-8">
        {error}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-gray-800">Prescription Analysis</h1>
            <Button
              variant="primary"
              className="bg-blue-600 hover:bg-blue-700"
              onClick={handleDownloadReport}
            >
              Download Report
            </Button>
          </div>
          <div className="flex gap-4 mb-6">
            <Button
              variant={reportPeriod === 'all' ? 'primary' : 'secondary'}
              onClick={() => setReportPeriod('all')}
            >
              All Time
            </Button>
            <Button
              variant={reportPeriod === 'month' ? 'primary' : 'secondary'}
              onClick={() => setReportPeriod('month')}
            >
              Last Month
            </Button>
            <Button
              variant={reportPeriod === 'week' ? 'primary' : 'secondary'}
              onClick={() => setReportPeriod('week')}
            >
              Last Week
            </Button>
            <Button
              variant={reportPeriod === 'yesterday' ? 'primary' : 'secondary'}
              onClick={() => setReportPeriod('yesterday')}
            >
              Yesterday
            </Button>
            <Button
              variant={reportPeriod === 'today' ? 'primary' : 'secondary'}
              onClick={() => setReportPeriod('today')}
            >
              Today
            </Button>
            
          </div>
        </div>

        <div className="mb-8">
          <div className="h-[400px]">
            <Bar data={chartData} options={chartOptions} />
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-800">Detailed Medicine Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(medicineStats).map(([medicine, stats]) => (
              <div key={medicine} className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-lg text-gray-900 mb-2">{medicine}</h3>
                <p className="text-gray-600 mb-2">
                  Total Prescriptions: {stats.totalPrescribed}
                </p>
                <div>
                  <h4 className="font-medium text-sm text-gray-700 mb-1">Dosage Breakdown:</h4>
                  <ul className="space-y-1">
                    {Object.entries(stats.dosageStats).map(([dosage, count]) => (
                      <li key={dosage} className="text-sm text-gray-600">
                        {dosage}: {count} time{count !== 1 ? 's' : ''}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}