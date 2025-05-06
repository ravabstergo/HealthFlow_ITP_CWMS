import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Search, Plus, ChevronDown, Download, Eye, Filter } from "lucide-react";
import Card from "../ui/card";
import Button from "../ui/button";
import Input from "../ui/input";
import DropdownMenu, { DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "../ui/dropdown-menu";
import DocumentUpload from "../ui/DocumentUpload";
import Toast from "../ui/toast";
import ConfirmDialog from "../ui/confirm-dialog";
import { useAuthContext } from "../../context/AuthContext";
import DocumentService from "../../services/DocumentService";

export default function PatientDocumentList() {
  const { id: patientId } = useParams();
  const { activeRole, user } = useAuthContext();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDocuments, setSelectedDocuments] = useState([]);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [editingDocument, setEditingDocument] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: "", type: "info" });
  const [isBulkUpdateModalOpen, setIsBulkUpdateModalOpen] = useState(false);
  const [bulkUpdateDocuments, setBulkUpdateDocuments] = useState(null);
  const [previewModal, setPreviewModal] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const isDoctor = activeRole?.name === "sys_doctor";

  const statusOptions = ["All", "Pending", "Doctor Review", "Approved", "Rejected"];

  useEffect(() => {
    fetchDocuments();
  }, [patientId]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const data = await DocumentService.getAllDocuments(patientId, user?._id);
      setDocuments(data || []);
    } catch (error) {
      setToast({
        visible: true,
        message: "Failed to load documents",
        type: "error"
      });
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadSuccess = (document) => {
    if (!document) {
      setToast({
        visible: true,
        message: "Failed to upload document",
        type: "error"
      });
      return;
    }

    setDocuments(prev => [...prev, document]);
    setToast({
      visible: true,
      message: "Document uploaded successfully",
      type: "success"
    });
    setIsUploadModalOpen(false);
  };

  const handleUpdateSuccess = (updatedDoc) => {
    if (!updatedDoc) {
      setToast({
        visible: true,
        message: "Failed to update document",
        type: "error"
      });
      return;
    }

    setDocuments(prev => prev.map(doc => 
      doc._id === updatedDoc._id ? updatedDoc : doc
    ));
    setToast({
      visible: true,
      message: "Document updated successfully",
      type: "success"
    });
    setIsUploadModalOpen(false);
    setEditingDocument(null);
  };

  const handleDeleteConfirm = async () => {
    try {
      await Promise.all(selectedDocuments.map(id => DocumentService.deleteDocument(id)));
      setToast({
        visible: true,
        message: "Documents deleted successfully",
        type: "success"
      });
      setSelectedDocuments([]);
      fetchDocuments();
    } catch (error) {
      setToast({
        visible: true,
        message: "Failed to delete documents",
        type: "error"
      });
    }
    setIsDeleteDialogOpen(false);
  };

  const handleDownload = async (doc) => {
    try {
      const downloadInfo = await DocumentService.downloadDocument(doc._id);
      if (!downloadInfo || !downloadInfo.url) {
        throw new Error('Download URL not available');
      }
      
      const link = document.createElement('a');
      const downloadUrl = downloadInfo.url.includes('cloudinary.com') 
        ? downloadInfo.url.replace('/upload/', '/upload/fl_attachment/') 
        : downloadInfo.url;
        
      link.href = downloadUrl;
      link.setAttribute('download', downloadInfo.filename || doc.documentName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setToast({
        visible: true,
        message: "Download started successfully",
        type: "success"
      });
    } catch (error) {
      console.error('Download failed:', error);
      setToast({
        visible: true,
        message: "Failed to download document",
        type: "error"
      });
    }
  };

  const handleViewDocument = (documentUrl) => {
    if (!documentUrl) {
      setToast({
        visible: true,
        message: "Document URL is not available",
        type: "error"
      });
      return;
    }

    const extension = documentUrl.split('.').pop().toLowerCase();
    if (extension === 'pdf') {
      window.open(documentUrl, '_blank', 'noopener,noreferrer');
      return;
    } else if (['jpg', 'jpeg', 'png'].includes(extension)) {
      setPreviewModal({ isOpen: true, url: documentUrl, type: 'image' });
    } else if (extension === 'doc' || extension === 'docx') {
      const viewerUrl = `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(documentUrl)}`;
      window.open(viewerUrl, '_blank', 'noopener,noreferrer');
    } else {
      window.location.href = documentUrl;
    }
  };

  const toggleSelectDocument = (id) => {
    setSelectedDocuments(prev => 
      prev.includes(id) ? prev.filter(docId => docId !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    setSelectedDocuments(prev => 
      prev.length === documents.length ? [] : documents.map(doc => doc._id)
    );
  };

  const handleUpdateSelected = () => {
    const selectedDocs = documents.filter(doc => selectedDocuments.includes(doc._id));
    if (selectedDocs.length === 0) {
      setToast({
        visible: true,
        message: "Please select a document",
        type: "warning"
      });
      return;
    }
    
    setBulkUpdateDocuments(selectedDocs);
    setIsUploadModalOpen(true);
    setEditingDocument(null);
  };

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch = doc.documentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.documentType.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = !selectedStatus || selectedStatus === "All" || doc.status === selectedStatus;

    const docDate = new Date(doc.createdAt);
    const matchesDateRange = (!startDate || docDate >= new Date(startDate)) &&
                            (!endDate || docDate <= new Date(endDate));

    return matchesSearch && matchesStatus && matchesDateRange;
  });

  if (loading) {
    return (
      <>
        <h1 className="text-2xl font-bold mb-6">Documents</h1>
        <Card>Loading documents...</Card>
      </>
    );
  }

  return (
    <>
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

      <h1 className="text-2xl font-bold mb-6">Documents</h1>

      <Card>
        <div className="space-y-4">
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
            <div className="flex space-x-2">
              <Button
                variant="secondary"
                icon={<Filter className="h-4 w-4" />}
                onClick={() => setShowFilters(!showFilters)}
              >
                {showFilters ? "Hide Filters" : "Show Filters"}
              </Button>
              <Button 
                className="bg-blue-600 hover:bg-blue-700"
                onClick={() => setIsUploadModalOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Document
              </Button>
            </div>
          </div>

          {showFilters && (
            <div className="flex space-x-4 items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-between">
                      {selectedStatus || "All Status"}
                      <ChevronDown className="h-4 w-4 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-[200px]">
                    {statusOptions.map((status) => (
                      <DropdownMenuItem 
                        key={status}
                        onClick={() => setSelectedStatus(status === "All" ? "" : status)}
                      >
                        {status}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  setStartDate("");
                  setEndDate("");
                  setSelectedStatus("");
                }}
              >
                Clear Filters
              </Button>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      checked={selectedDocuments.length === documents.length}
                      onChange={toggleSelectAll}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Document Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredDocuments.map((doc) => (
                  <tr key={doc._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedDocuments.includes(doc._id)}
                        onChange={() => toggleSelectDocument(doc._id)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{doc.documentName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{doc.documentType}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${doc.status === 'Approved' ? 'bg-green-100 text-green-800' : 
                          doc.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                          doc.status === 'Doctor Review' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'}`}>
                        {doc.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(doc.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDocument(doc.documentUrl)}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownload(doc)}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
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
              onClick={() => setIsDeleteDialogOpen(true)}
            >
              DELETE
            </Button>
          </div>
        </div>

        <DocumentUpload 
          isOpen={isUploadModalOpen}
          onClose={() => {
            setIsUploadModalOpen(false);
            setEditingDocument(null);
            setBulkUpdateDocuments(null);
          }}
          mode={editingDocument ? "edit" : bulkUpdateDocuments ? "bulk-update" : "create"}
          documentData={editingDocument || bulkUpdateDocuments}
          patientId={patientId}
          doctorId={user?._id}
          onUploadSuccess={handleUploadSuccess}
          onUpdateSuccess={(updatedDocs) => {
            if (Array.isArray(updatedDocs)) {
              fetchDocuments();
              setToast({
                visible: true,
                message: "Documents updated successfully",
                type: "success"
              });
            } else {
              handleUpdateSuccess(updatedDocs);
            }
            setIsUploadModalOpen(false);
            setBulkUpdateDocuments(null);
            setSelectedDocuments([]);
          }}
        />
      </Card>
    </>
  );
}