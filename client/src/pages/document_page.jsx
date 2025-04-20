import { useState } from "react";
import { useLocation } from "react-router-dom";
import { Search, Plus, ChevronDown, Download, Printer, MoreVertical } from "lucide-react";
import Button from "../components/ui/button";
import Input from "../components/ui/input";
import DropdownMenu from "../components/ui/dropdown-menu";
import { DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "../components/ui/dropdown-menu";
import DocumentUpload from "../components/ui/DocumentUpload";
import Toast from "../components/ui/toast";
import ConfirmDialog from "../components/ui/confirm-dialog";
import { useAuthContext } from "../context/AuthContext";

// Sample document data
const documents = [
  {
    id: "DOC00234",
    created: "April 14, 2023",
    creator: "Charles Williamson",
    patientName: "Robert Johnson",
    status: "Completed",
    type: "Lab report",
  },
  {
    id: "DOC00235",
    created: "October 10, 2023",
    creator: "Samantha Anderson",
    patientName: "Emily Parker",
    status: "Completed",
    type: "Scan Report",
  },
  {
    id: "DOC00236",
    created: "October 14, 2023",
    creator: "Michael Anderson",
    patientName: "David Miller",
    status: "Completed",
    type: "Scan Report",
  },
  {
    id: "DOC00237",
    created: "March 28, 2023",
    creator: "Samantha Rodriguez",
    patientName: "Sarah Williams",
    status: "Completed",
    type: "Lab report",
  },
  {
    id: "DOC00238",
    created: "February 17, 2023",
    creator: "Charles Williamson",
    patientName: "James Thompson",
    status: "Completed",
    type: "Prescription",
  },
  {
    id: "DOC00239",
    created: "October 31, 2023",
    creator: "Patricia Morgenson",
    patientName: "Lisa Garcia",
    status: "Completed",
    type: "Prescription",
  },
];

export default function DocumentList() {
  const location = useLocation();
  const { activeRole } = useAuthContext();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDocuments, setSelectedDocuments] = useState([]);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [editingDocument, setEditingDocument] = useState(null);
  const [toast, setToast] = useState({ visible: false, message: "", type: "info" });
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isBulkUpdateModalOpen, setIsBulkUpdateModalOpen] = useState(false);
  const [bulkUpdateDocuments, setBulkUpdateDocuments] = useState(null);

  // Check if we're in the patient's document view
  const isPatientView = location.pathname.includes("/patients/");
  // Check if user is a doctor
  const isDoctor = activeRole?.name === "sys_doctor";

  const toggleSelectDocument = (id) => {
    if (selectedDocuments.includes(id)) {
      setSelectedDocuments(selectedDocuments.filter((docId) => docId !== id));
    } else {
      setSelectedDocuments([...selectedDocuments, id]);
    }
  };

  const toggleSelectAll = () => {
    if (selectedDocuments.length === documents.length) {
      setSelectedDocuments([]);
    } else {
      setSelectedDocuments(documents.map((doc) => doc.id));
    }
  };

  const handleEdit = (document) => {
    // Prevent doctors from editing documents in patient view
    if (isPatientView && isDoctor) {
      setToast({
        visible: true,
        message: "Doctors cannot modify documents in patient view",
        type: "warning"
      });
      return;
    }
    setEditingDocument(document);
    setIsUploadModalOpen(true);
  };

  const handleUpdateSelected = () => {
    const selectedDocs = documents.filter(doc => selectedDocuments.includes(doc.id));
    if (selectedDocs.length === 0) {
      setToast({
        visible: true,
        message: "Please select a document",
        type: "warning"
      });
      return;
    }
    
    setBulkUpdateDocuments(selectedDocs);
    setIsBulkUpdateModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    console.log("Deleting documents:", selectedDocuments);
    setSelectedDocuments([]);
    setToast({
      visible: true,
      message: "Documents deleted successfully",
      type: "success"
    });
  };

  const handleCloseModal = () => {
    setIsUploadModalOpen(false);
    setEditingDocument(null);
  };

  const handleCloseBulkUpdate = () => {
    setIsBulkUpdateModalOpen(false);
    setBulkUpdateDocuments(null);
  };

  // Filter documents based on search term
  const filteredDocuments = documents.filter(
    (doc) =>
      doc.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <Toast 
        isVisible={toast.visible}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, visible: false })}
      />

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Confirm Delete"
        message="Are you sure you want to delete the selected documents?"
      />

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-xl font-semibold text-gray-900 mb-6">Document List</h1>

          <div className="flex justify-between items-center">
            <div className="max-w-md w-full">
              <Input
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                icon={<Search className="h-4 w-4 text-gray-400" />}
                className="w-full"
              />
            </div>
            {(!isPatientView || !isDoctor) && (
              <Button 
                className="bg-blue-600 hover:bg-blue-700"
                onClick={() => setIsUploadModalOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Document
              </Button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 text-gray-700 text-sm">
              <tr>
                <th className="px-6 py-3 text-left font-medium">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                      checked={selectedDocuments.length === documents.length && documents.length > 0}
                      onChange={toggleSelectAll}
                    />
                    DOCUMENT ID
                    <ChevronDown className="ml-1 h-4 w-4" />
                  </div>
                </th>
                <th className="px-6 py-3 text-left font-medium">
                  <div className="flex items-center">
                    CREATED
                    <ChevronDown className="ml-1 h-4 w-4" />
                  </div>
                </th>
                <th className="px-6 py-3 text-left font-medium">
                  <div className="flex items-center">
                    PATIENT NAME
                    <ChevronDown className="ml-1 h-4 w-4" />
                  </div>
                </th>
                <th className="px-6 py-3 text-left font-medium">
                  <div className="flex items-center">
                    STATUS
                    <ChevronDown className="ml-1 h-4 w-4" />
                  </div>
                </th>
                <th className="px-6 py-3 text-left font-medium">
                  <div className="flex items-center">
                    DOCUMENT TYPE
                    <ChevronDown className="ml-1 h-4 w-4" />
                  </div>
                </th>
                <th className="px-6 py-3 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredDocuments.map((doc) => (
                <tr key={doc.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                        checked={selectedDocuments.includes(doc.id)}
                        onChange={() => toggleSelectDocument(doc.id)}
                      />
                      <span className="text-sm text-gray-900">{doc.id}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{doc.created}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{doc.patientName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex text-xs font-medium px-2.5 py-0.5 rounded-full bg-green-100 text-green-800">
                      {doc.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{doc.type}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button className="text-gray-400 hover:text-gray-500">
                        <Download className="h-5 w-5" />
                      </button>
                      <button className="text-gray-400 hover:text-gray-500">
                        <Printer className="h-5 w-5" />
                      </button>
                      {(!isPatientView || !isDoctor) && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="text-gray-400 hover:text-gray-500">
                              <MoreVertical className="h-5 w-5" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>View</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEdit(doc)}>
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                              setSelectedDocuments([doc.id]);
                              setIsDeleteDialogOpen(true);
                            }}>
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 flex justify-end space-x-3 border-t border-gray-200">
          {(!isPatientView || !isDoctor) && (
            <>
              <Button 
                variant="outline" 
                className="text-sm font-medium"
                onClick={handleUpdateSelected}
                disabled={selectedDocuments.length === 0}
                title={selectedDocuments.length === 0 ? "Please select a document" : "Update selected documents"}
              >
                UPDATE
              </Button>
              <Button 
                variant="outline" 
                className="text-sm font-medium bg-red-50 text-red-600 hover:bg-red-100 border-red-200"
                disabled={selectedDocuments.length === 0}
                title={selectedDocuments.length === 0 ? "Please select a document" : "Delete selected documents"}
                onClick={() => setIsDeleteDialogOpen(true)}
              >
                DELETE
              </Button>
            </>
          )}
        </div>
      </div>

      <DocumentUpload 
        isOpen={isUploadModalOpen} 
        onClose={handleCloseModal}
        mode={editingDocument ? "edit" : "create"}
        documentData={editingDocument}
        isPatientView={isPatientView}
      />

      <DocumentUpload 
        isOpen={isBulkUpdateModalOpen}
        onClose={handleCloseBulkUpdate}
        mode="bulk-update"
        documentData={bulkUpdateDocuments}
        isPatientView={isPatientView}
      />
    </div>
  );
}
