import { useState, useEffect } from "react";
import { useAuthContext } from "../context/AuthContext";
import TokenService from "../services/TokenService";
import Button from "../components/ui/button";
import Input from "../components/ui/input";
import Modal from "../components/ui/modal";
import { Plus, Calendar, User, Clock, Eye } from "lucide-react";

export default function PrescriptionPage() {
  const { currentUser } = useAuthContext();
  const doctorId = currentUser?.id;

  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [doctorDetails, setDoctorDetails] = useState(null);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = TokenService.getAccessToken();

        const doctorResponse = await fetch(`/api/auth/users/${doctorId}`, {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });

        if (doctorResponse.ok) {
          const doctorData = await doctorResponse.json();
          setDoctorDetails(doctorData);
        }

        const response = await fetch(`/api/prescriptions/doctor/${doctorId}`, {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch prescriptions");
        }

        const data = await response.json();
        setPrescriptions(data);
      } catch (err) {
        console.error("Error fetching prescriptions:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (doctorId) {
      fetchData();
    }
  }, [doctorId]);

  const handleViewPrescription = (prescription) => {
    setSelectedPrescription(prescription);
    setViewModalOpen(true);
  };

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
          <div className="flex justify-end w-full">
            <Button
              variant="secondary"
              onClick={() => {
                setViewModalOpen(false);
                setSelectedPrescription(null);
              }}
            >
              Close
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
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-gray-400" />
                <span className="text-sm">Patient: {selectedPrescription.patientId?.name || "Unknown"}</span>
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
                {selectedPrescription.notes}
              </p>
            </div>
          </div>
        )}
      </Modal>

      <div className="container mx-auto px-4">
        <div className="bg-white rounded-lg shadow p-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <svg className="animate-spin h-8 w-8 text-blue-600" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </div>
          ) : error ? (
            <div className="text-red-600 text-center py-8">
              {error}
            </div>
          ) : (
            <div className="w-full space-y-4">
              <div className="flex justify-between items-center mb-6">
                <div className="space-y-1">
                  <h2 className="text-2xl font-bold text-gray-800">
                    Dr. {doctorDetails?.name}
                  </h2>
                  <p className="text-sm text-gray-500">
                    Total Prescriptions: {prescriptions.length}
                  </p>
                </div>
              </div>

              {prescriptions.length === 0 ? (
                <div className="text-gray-500 text-center py-8">
                  No prescriptions found
                </div>
              ) : (
                <div className="w-full">
                  <div className="bg-gray-50">
                    <div className="grid grid-cols-6 gap-4 px-6 py-3 text-sm font-medium text-gray-500">
                      <div>Date Issued</div>
                      <div>Valid Until</div>
                      <div>Patient Name</div>
                      <div>Status</div>
                      <div>Notes</div>
                      <div className="text-right">Actions</div>
                    </div>
                  </div>

                  <div className="divide-y divide-gray-100">
                    {prescriptions.map((prescription) => (
                      <div
                        key={prescription._id}
                        className="grid grid-cols-6 gap-4 px-6 py-4 hover:bg-gray-50 transition-colors"
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
                          {prescription.patientId?.name || "Unknown Patient"}
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
                        <div className="text-sm text-gray-500 truncate">
                          {prescription.notes}
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