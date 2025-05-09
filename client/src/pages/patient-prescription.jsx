import { useState, useEffect } from "react";
import { useAuthContext } from "../context/AuthContext";
import { useLinkedRecordContext } from "../context/LinkedRecordContext";
import TokenService from "../services/TokenService";
import Button from "../components/ui/button";
import Input from "../components/ui/input";
import Modal from "../components/ui/modal";
import { Calendar, User, Clock, Eye } from "lucide-react";
import jsPDF from 'jspdf';

// API URL constant
const API_URL = `${process.env.REACT_APP_API_URL}`;

export default function PatientPrescriptionPage() {
  const { currentUser } = useAuthContext();
  const { linkedRecordIds, loading: linkLoading, error: linkError } = useLinkedRecordContext();
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [patientName, setPatientName] = useState("");
  const [sortBy, setSortBy] = useState("dateIssued");
  const [sortOrder, setSortOrder] = useState("desc");

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  const getSortIcon = (field) => {
    if (sortBy !== field) return "↕";
    return sortOrder === "asc" ? "↑" : "↓";
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  useEffect(() => {
    const fetchPrescriptionsForPatient = async (patientId) => {
      try {
        const token = TokenService.getAccessToken();
        const response = await fetch(`${API_URL}/prescriptions/patient-all/${patientId}`, {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch prescriptions for patient ${patientId}`);
        }

        return await response.json();
      } catch (err) {
        console.error(`Error fetching prescriptions for patient ${patientId}:`, err);
        return [];
      }
    };

    const fetchData = async () => {
      try {
        if (currentUser) {
          setPatientName(currentUser.name || "");
        }

        if (linkedRecordIds && linkedRecordIds.length > 0) {
          setLoading(true);
          
          // Fetch prescriptions for all linked records in parallel
          const allPrescriptions = await Promise.all(
            linkedRecordIds.map(recordId => fetchPrescriptionsForPatient(recordId))
          );

          // Combine and sort all prescriptions by date, newest first
          const combinedPrescriptions = allPrescriptions
            .flat()
            .sort((a, b) => new Date(b.dateIssued) - new Date(a.dateIssued));
            
          setPrescriptions(combinedPrescriptions);
        } else {
          // No linked records available
          setPrescriptions([]);
        }
      } catch (err) {
        console.error("Error fetching prescriptions data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (currentUser && linkedRecordIds) {
      fetchData();
    }
  }, [currentUser, linkedRecordIds]);

  const handleViewPrescription = (prescription) => {
    if (!prescription) {
      return;
    }
    setSelectedPrescription(prescription);
    setViewModalOpen(true);
  };

  const handleDownloadPrescription = (prescription) => {
    if (!prescription?._id) {
      console.error("Invalid prescription data");
      return;
    }

    const doc = new jsPDF();
    
    let y = 20;
    const lineHeight = 7;
    const pageWidth = doc.internal.pageSize.width;
    
    // Add header with blue banner
    doc.setFillColor(41, 128, 185);
    doc.rect(0, 0, pageWidth, 15, 'F');
    
    // Add logo/hospital name in white
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('HEALTHFLOW', pageWidth/2, 10, { align: 'center' });
    doc.setTextColor(0, 0, 0);
    
    // Add prescription title
    y += 15;
    doc.setFontSize(14);
    doc.text('PRESCRIPTION', pageWidth/2, y, { align: 'center' });
    
    // Reset font for content
    doc.setFontSize(11);
    y += 20;

    // Add header info in a professional table-like layout
    doc.setDrawColor(41, 128, 185);
    doc.setLineWidth(0.1);
    doc.line(20, y - 5, pageWidth - 20, y - 5);
    
    // Left column
    doc.setFont('helvetica', 'bold');
    doc.text('Doctor Details:', 20, y);
    doc.setFont('helvetica', 'normal');
    y += lineHeight;
    doc.text(`Name: Dr. ${prescription.doctorId?.name || "Unknown"}`, 25, y);
    y += lineHeight;
    doc.text(`License: ${prescription.doctorId?.doctorInfo?.licenseNumber || "N/A"}`, 25, y);
    y += lineHeight;
    doc.text(`Specialization: ${prescription.doctorId?.doctorInfo?.specialization || "General Practice"}`, 25, y);
    
    // Right column
    const rightCol = pageWidth/2 + 10;
    y -= lineHeight * 2;
    doc.text(`Date: ${formatDate(prescription.dateIssued)}`, rightCol, y);
    y += lineHeight;
    doc.text(`Valid Until: ${formatDate(prescription.validUntil)}`, rightCol, y);
    y += lineHeight;
    doc.text(`Ref No: ${prescription._id.slice(-6)}`, rightCol, y);
    
    // Patient information
    y += lineHeight * 2;
    doc.line(20, y, pageWidth - 20, y);
    y += lineHeight;
    doc.setFont('helvetica', 'bold');
    doc.text('Patient Information:', 20, y);    doc.setFont('helvetica', 'normal');
    y += lineHeight;
    doc.text(`Name: ${patientName || "Unknown"}`, 25, y);
    y += lineHeight;
    doc.text(`ID: ${prescription.patientId?._id?.slice(-6) || "N/A"}`, 25, y);
    
    // Medicines section with table
    y += lineHeight * 2;
    doc.line(20, y, pageWidth - 20, y);
    y += lineHeight;
    doc.setFont('helvetica', 'bold');
    doc.text('Prescribed Medicines:', 20, y);
    y += lineHeight;
    
    // Table headers
    const startX = 25;
    doc.setFillColor(241, 246, 251);
    doc.rect(startX - 5, y - 5, pageWidth - 40, 10, 'F');
    doc.text('Medicine', startX, y);
    doc.text('Dosage', startX + 60, y);
    doc.text('Qty', startX + 100, y);
    doc.text('Frequency', startX + 120, y);
    y += lineHeight * 1.5;
    
    // Table content
    doc.setFont('helvetica', 'normal');
    prescription.medicines.forEach((medicine, index) => {
      // Alternate row background
      if (index % 2 === 0) {
        doc.setFillColor(249, 250, 251);
        doc.rect(startX - 5, y - 5, pageWidth - 40, 12, 'F');
      }
      
      doc.text(medicine.medicineName, startX, y);
      doc.text(medicine.dosage, startX + 60, y);
      doc.text(medicine.quantity.toString(), startX + 100, y);
      doc.text(medicine.frequency, startX + 120, y);
      
      y += lineHeight;
      // Add instructions in smaller font
      doc.setFontSize(9);
      doc.text(`Instructions: ${medicine.instructions}`, startX + 5, y);
      doc.setFontSize(11);
      y += lineHeight * 1.5;
      
      if (y > 250) {
        doc.addPage();
        y = 20;
      }
    });
    
    // Add notes section
    y += lineHeight;
    doc.line(20, y, pageWidth - 20, y);
    y += lineHeight;
    doc.setFont('helvetica', 'bold');
    doc.text('Additional Notes:', 20, y);
    y += lineHeight;
    doc.setFont('helvetica', 'normal');
    const notes = prescription.notes || 'No additional notes';
    const splitNotes = doc.splitTextToSize(notes, pageWidth - 40);
    doc.text(splitNotes, 25, y);
    y += (splitNotes.length * lineHeight) + lineHeight;
    
    // Add footer with verification details
    const footerY = doc.internal.pageSize.height - 25;
    doc.line(20, footerY, pageWidth - 20, footerY);
    
    // Center
    doc.setFont('helvetica', 'italic');
    doc.text('This is a computer generated prescription.', pageWidth/2, footerY + 5, { align: 'center' });
    
    // Add doctor's signature placeholder
    doc.line(pageWidth - 80, footerY - 15, pageWidth - 20, footerY - 15);
    doc.setFontSize(8);
    doc.text("Doctor's Signature & Stamp", pageWidth - 50, footerY - 10, { align: 'center' });
    
    // Save the PDF with a proper filename
    const filename = `prescription-${prescription._id}-${new Date().toISOString().slice(0,10)}.pdf`;
    doc.save(filename);
  };

  const filteredPrescriptions = prescriptions.filter((prescription) => {
    const doctorNameMatch = prescription.doctorId?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const medicineMatch = prescription.medicines?.some(med => 
      med.medicineName?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return doctorNameMatch || medicineMatch || searchQuery === "";
  }).sort((a, b) => {
    const fieldA = a[sortBy];
    const fieldB = b[sortBy];
    if (sortOrder === "asc") {
      return fieldA > fieldB ? 1 : -1;
    } else {
      return fieldA < fieldB ? 1 : -1;
    }
  });

  return (
    <>
      <Modal
        isOpen={viewModalOpen}
        onClose={() => {
          setViewModalOpen(false);
          setSelectedPrescription(null);
        }}
        title="Prescription Details"
        size="lg"
        footer={
          <div className="flex justify-end w-full gap-4">
            <Button
              variant="secondary"
              onClick={() => {
                setViewModalOpen(false);
                setSelectedPrescription(null);
              }}
            >
              Close
            </Button>
            <Button
              variant="secondary"
              className="bg-green-700 hover:bg-green-800 text-white inline-flex items-center justify-center"
              onClick={() => handleDownloadPrescription(selectedPrescription)}
            >
              Download PDF
            </Button>
          </div>
        }
      >
        {selectedPrescription && (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium">Doctor: Dr. {selectedPrescription.doctorId?.name || "Unknown"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                <span className="text-sm">Issued: {formatDate(selectedPrescription.dateIssued)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-orange-600" />
                <span className="text-sm">Valid until: {formatDate(selectedPrescription.validUntil)}</span>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-md font-semibold">Prescribed Medicines</h3>
              {selectedPrescription.medicines.map((medicine, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg text-sm">
                  <h4 className="font-medium mb-2">{medicine.medicineName}</h4>
                  <div className="space-y-1">
                    <p><span className="text-gray-500">Dosage:</span> {medicine.dosage}</p>
                    <p><span className="text-gray-500">Quantity:</span> {medicine.quantity}</p>
                    <p><span className="text-gray-500">Frequency:</span> {medicine.frequency}</p>
                    <p><span className="text-gray-500">Instructions:</span> {medicine.instructions}</p>
                  </div>
                </div>
              ))}
            </div>

            <div>
              <h3 className="text-md font-semibold mb-2">Additional Notes</h3>
              <p className="text-sm bg-gray-50 p-3 rounded-lg">
                {selectedPrescription.notes || "No additional notes"}
              </p>
            </div>
          </div>
        )}
      </Modal>

      <div className="container mx-auto px-4">
        <div className="bg-white rounded-lg shadow p-6">
          {loading || linkLoading ? (
            <div className="flex items-center justify-center py-8">
              <svg className="animate-spin h-8 w-8 text-blue-600" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </div>
          ) : error || linkError ? (
            <div className="text-red-600 text-center py-8">
              {error || linkError}
            </div>
          ) : (
            <div className="w-full space-y-4">
              <div className="flex justify-between items-center mb-6">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-gray-800">
                    Prescriptions for {patientName}
                  </h2>
                  <p className="text-sm text-gray-500">
                    Total Prescriptions: {prescriptions.length}
                    {linkedRecordIds && linkedRecordIds.length > 1 && ` (From ${linkedRecordIds.length} linked records)`}
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <div className="w-96">
                  <Input
                    type="text"
                    placeholder="Search by doctor name or medicine..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              {filteredPrescriptions.length === 0 ? (
                <div className="text-gray-500 text-center py-8">
                  {prescriptions.length === 0 ? "No prescriptions found" : "No prescriptions match your search"}
                </div>
              ) : (
                <div className="w-full">
                  <div className="bg-gray-50">
                    <div className="grid grid-cols-5 gap-4 px-6 py-3 text-sm font-medium text-gray-500">
                      <div 
                        onClick={() => handleSort("dateIssued")} 
                        className="cursor-pointer"
                      >
                        Date Issued {getSortIcon("dateIssued")}
                      </div>
                      <div 
                        onClick={() => handleSort("validUntil")} 
                        className="cursor-pointer"
                      >
                        Valid Until {getSortIcon("validUntil")}
                      </div>
                      <div 
                        onClick={() => handleSort("doctorName")} 
                        className="cursor-pointer"
                      >
                        Doctor {getSortIcon("doctorName")}
                      </div>
                      <div>Status</div>
                      <div className="text-right">Actions</div>
                    </div>
                  </div>

                  <div className="divide-y divide-gray-100">
                    {filteredPrescriptions.map((prescription) => (
                      <div
                        key={prescription._id}
                        className="grid grid-cols-5 gap-4 px-6 py-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center text-sm text-gray-900">
                          <Calendar className="w-4 h-4 text-blue-600 mr-2" />
                          {formatDate(prescription.dateIssued)}
                        </div>
                        <div className="flex items-center text-sm text-gray-900">
                          <Clock className="w-4 h-4 text-orange-600 mr-2" />
                          {formatDate(prescription.validUntil)}
                        </div>
                        <div className="flex items-center text-sm text-gray-900">
                          <User className="w-4 h-4 text-blue-600 mr-2" />
                          Dr. {prescription.doctorId?.name || "Unknown"}
                        </div>
                        <div>
                          {new Date(prescription.validUntil) > new Date() ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              Expired
                            </span>
                          )}
                        </div>
                        <div className="text-right">
                          <Button
                            variant="secondary"
                            size="sm"
                            icon={<Eye className="w-4 h-4" />}
                            onClick={() => handleViewPrescription(prescription)}
                          >
                            View Details
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}