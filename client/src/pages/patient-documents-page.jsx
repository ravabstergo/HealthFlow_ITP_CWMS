import React, { useState, useEffect } from 'react';
import { useAuthContext } from '../context/AuthContext';
import api from '../services/api';
import { File, Download, Eye, Search, Filter, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Input from '../components/ui/input';
import Button from '../components/ui/button';
import Card from '../components/ui/card';
import Toast from '../components/ui/toast';
import DocumentUpload from '../components/ui/DocumentUpload';
import DocumentService from '../services/DocumentService';

export default function PatientDocumentsPage() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const { currentUser } = useAuthContext();
  const navigate = useNavigate();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: "", type: "info" });

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/api/document?patientId=${currentUser.id}`);
        setDocuments(response.data.documents || []);
      } catch (err) {
        setError('Failed to fetch documents');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (currentUser?.id) {
      fetchDocuments();
    }
  }, [currentUser?.id]);

  const handleDownload = async (documentId) => {
    try {
      const downloadInfo = await DocumentService.downloadDocument(documentId);
      if (!downloadInfo || !downloadInfo.url) {
        throw new Error('Download URL not available');
      }
      
      const link = document.createElement('a');
      const downloadUrl = downloadInfo.url.includes('cloudinary.com') 
        ? downloadInfo.url.replace('/upload/', '/upload/fl_attachment/') 
        : downloadInfo.url;
        
      link.href = downloadUrl;
      link.setAttribute('download', downloadInfo.filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setToast({
        visible: true,
        message: "Download started successfully",
        type: "success"
      });
    } catch (err) {
      console.error('Error downloading document:', err);
      setToast({
        visible: true,
        message: "Failed to download document",
        type: "error"
      });
    }
  };

  const handleView = async (documentId) => {
    try {
      const doc = await DocumentService.getDocumentById(documentId);
      if (!doc || !doc.documentUrl) {
        setToast({
          visible: true,
          message: "Document URL is not available",
          type: "error"
        });
        return;
      }

      const extension = doc.documentUrl.split('.').pop().toLowerCase();
      
      // Handle different file types
      if (extension === 'pdf') {
        // Open PDFs in new window
        window.open(doc.documentUrl, '_blank', 'noopener,noreferrer');
      } else if (['jpg', 'jpeg', 'png'].includes(extension)) {
        // For images, open directly in new tab
        window.open(doc.documentUrl, '_blank', 'noopener,noreferrer');
      } else if (extension === 'doc' || extension === 'docx') {
        // For Word documents, use Office Online Viewer
        const viewerUrl = `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(doc.documentUrl)}`;
        window.open(viewerUrl, '_blank', 'noopener,noreferrer');
      } else {
        // For other file types, trigger download
        window.location.href = doc.documentUrl;
      }
    } catch (error) {
      console.error("Error viewing document:", error);
      setToast({
        visible: true,
        message: "Failed to view document. Please try again.",
        type: "error"
      });
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

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch = doc.documentName?.toLowerCase().includes(searchTerm.toLowerCase());
    const docDate = new Date(doc.createdAt);
    const matchesDateRange = (!startDate || docDate >= new Date(startDate)) &&
                            (!endDate || docDate <= new Date(endDate));
    return matchesSearch && matchesDateRange;
  });

  const getFileIcon = (documentUrl) => {
    if (!documentUrl) return <File className="h-5 w-5 text-gray-500" />;
    const extension = documentUrl.split('.').pop().toLowerCase();
    
    switch(extension) {
      case 'pdf':
        return <File className="h-5 w-5 text-red-500" />;
      case 'doc':
      case 'docx':
        return <File className="h-5 w-5 text-blue-500" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
        return <File className="h-5 w-5 text-green-500" />;
      default:
        return <File className="h-5 w-5 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Toast 
        isVisible={toast.visible}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, visible: false })}
      />

      <DocumentUpload 
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        patientId={currentUser?.id}
        onUploadSuccess={handleUploadSuccess}
      />

      <h1 className="text-2xl font-bold mb-6">My Documents</h1>
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
              <Button
                variant="outline"
                onClick={() => {
                  setStartDate("");
                  setEndDate("");
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
                    Document Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredDocuments.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                      No documents found
                    </td>
                  </tr>
                ) : (
                  filteredDocuments.map((document) => (
                    <tr key={document._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getFileIcon(document.documentUrl)}
                          <span className="ml-2 text-sm font-medium text-gray-900">
                            {document.documentName || 'Untitled Document'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {new Date(document.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {document.documentType || 'Unknown'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleView(document._id)}
                            className="text-gray-600 hover:text-gray-900"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownload(document._id)}
                            className="text-gray-600 hover:text-gray-900"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Card>
    </div>
  );
}