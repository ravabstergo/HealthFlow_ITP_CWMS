import { useState, useEffect } from "react"
import { ArrowRight, File, ImageIcon, X, ChevronDown } from "lucide-react"
import Button from "./button"
import Input from "./input"
import DropdownMenu, { DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "./dropdown-menu"
import { useAuthContext } from "../../context/AuthContext"

export default function DocumentUpload({ 
  isOpen, 
  onClose, 
  mode = "create", 
  documentData = null,
  isPatientView = false 
}) {
  const { activeRole } = useAuthContext();
  const isDoctor = activeRole?.name === "sys_doctor";
  const isBulkUpdate = mode === "bulk-update";
  
  const [attachments, setAttachments] = useState([])
  const [documentName, setDocumentName] = useState("")
  const [documentType, setDocumentType] = useState("Lab Report")
  const [dragActive, setDragActive] = useState(false)
  const [status, setStatus] = useState("reviewed")

  useEffect(() => {
    if ((mode === "edit" || mode === "bulk-update") && documentData) {
      if (isBulkUpdate) {
        // For bulk update, use the first document's values as defaults
        const firstDoc = Array.isArray(documentData) ? documentData[0] : documentData;
        setDocumentName(firstDoc.name || "")
        setDocumentType(firstDoc.type || "Lab Report")
        setStatus(firstDoc.status?.toLowerCase() || "reviewed")
      } else {
        setDocumentName(documentData.name || "")
        setDocumentType(documentData.type || "Lab Report")
        setStatus(documentData.status?.toLowerCase() || "reviewed")
      }
      if (documentData.attachments) {
        setAttachments(Array.isArray(documentData.attachments) ? documentData.attachments : [documentData.attachments])
      }
    }
  }, [mode, documentData, isBulkUpdate])

  // If doctor is trying to modify in patient view, or modal is not open, don't render
  if (!isOpen || (isPatientView && isDoctor)) {
    return null;
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(Array.from(e.dataTransfer.files))
    }
  }

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(Array.from(e.target.files))
    }
  }

  const handleFiles = (files) => {
    const newAttachments = files.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file: file,
      name: file.name,
      type: file.type,
      size: file.size,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
      hasNotes: false
    }))
    setAttachments(prev => [...prev, ...newAttachments])
  }

  const removeAttachment = (id) => {
    setAttachments(prev => {
      const filtered = prev.filter(att => att.id !== id)
      const removed = prev.find(att => att.id === id)
      if (removed?.preview) {
        URL.revokeObjectURL(removed.preview)
      }
      return filtered
    })
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const handleAddNotes = (id) => {
    setAttachments(
      attachments.map((attachment) => (attachment.id === id ? { ...attachment, hasNotes: true } : attachment)),
    )
  }

  const handleStatusChange = (value) => {
    setStatus(value)
  }

  const handleSubmit = () => {
    const updatedDocument = {
      name: documentName,
      type: documentType,
      status: status,
      attachments
    }
    
    if (isBulkUpdate) {
      console.log("Bulk updating documents:", documentData.map(doc => doc.id), "with:", updatedDocument)
    } else {
      console.log(mode === "create" ? "Creating document:" : "Updating document:", updatedDocument)
    }
    onClose(true)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="flex w-full max-w-5xl bg-white rounded-lg shadow-lg overflow-hidden relative h-[80vh]">
        {/* Left sidebar - Attachments */}
        <div className="w-1/3 border-r border-gray-200 flex flex-col">
          <div className="p-2 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-sm font-medium text-gray-600">Attachments ({attachments.length})</h2>
            <button className="text-gray-400">
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
          <div className="flex-1 p-2 overflow-y-auto">
            <div className="space-y-2">
              {attachments.map((attachment) => (
                <div key={attachment.id} className="border border-gray-200 rounded-md overflow-hidden">
                  <div className="relative">
                    {attachment.preview ? (
                      <img
                        src={attachment.preview}
                        alt={attachment.name}
                        className="w-full h-24 object-cover"
                      />
                    ) : (
                      <div className="w-full h-24 bg-gray-50 flex items-center justify-center">
                        <File className="h-10 w-10 text-gray-400" />
                      </div>
                    )}
                    <button 
                      className="absolute top-1 right-1 bg-white rounded-full p-1 shadow-sm hover:bg-gray-100"
                      onClick={() => removeAttachment(attachment.id)}
                    >
                      <X className="h-3 w-3 text-gray-500" />
                    </button>
                  </div>
                  <div className="p-2 bg-gray-50">
                    <p className="text-xs font-medium text-gray-900 truncate">{attachment.name}</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-gray-500">{formatFileSize(attachment.size)}</span>
                      <span className="text-xs text-gray-500">{attachment.type.split('/')[1].toUpperCase()}</span>
                    </div>
                    <button
                      className="text-xs text-cyan-600 flex items-center mt-1 hover:text-cyan-700"
                      onClick={() => handleAddNotes(attachment.id)}
                    >
                      <ImageIcon className="h-3 w-3 mr-1" />
                      Add notes
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right content - Document details */}
        <div className="w-2/3 flex flex-col">
          {/* Header */}
          <div className="p-2 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">
                {isBulkUpdate ? "Bulk Update Documents" : mode === "edit" ? `Document ID: ${documentData?.id}` : "New Document"}
              </span>
              {isBulkUpdate && (
                <span className="text-xs text-gray-400">
                  ({documentData?.length} documents selected)
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <button className="text-gray-400" onClick={() => onClose(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Patient info */}
          <div className="p-2 flex items-center space-x-3 border-b border-gray-200">
            <div className="h-8 w-8 rounded-full bg-purple-500 flex items-center justify-center text-white text-sm font-medium">
              CJ
            </div>
            <div>
              <div className="text-xs text-gray-500">Patient name</div>
              <div className="text-sm font-medium">Chamara Janakantha</div>
            </div>
            <div className="ml-auto flex items-center space-x-2">
              <span className="text-sm text-gray-500">Status:</span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 px-2 flex justify-between items-center min-w-[100px]">
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                    <ChevronDown className="h-4 w-4 opacity-50 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => handleStatusChange("reviewed")}>Reviewed</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleStatusChange("pending")}>Pending</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleStatusChange("approved")}>Approved</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1 p-3">
            <div className="grid grid-cols-2 gap-3 mb-3">
              {/* Left column */}
              <div>
                <div className="mb-3">
                  <h3 className="text-xs font-medium text-gray-500 mb-1">TREATMENT</h3>
                  <p className="text-sm">Endodontic</p>
                </div>

                <div>
                  <h3 className="text-xs font-medium text-gray-500 mb-1">General info</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <div className="text-xs text-gray-500">FULL NAME</div>
                      <div>Chamara Janakantha</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">AGE</div>
                      <div>32</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">GENDER</div>
                      <div>Male</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right column */}
              <div>
                <div className="mb-3">
                  <h3 className="text-xs font-medium text-gray-500 mb-1">DATE AND TIME</h3>
                  <div className="text-sm">Jul 26, 2023</div>
                  <div className="text-xs text-gray-500">10:30 AM</div>
                </div>

                <div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <div className="text-xs text-gray-500">PHONE</div>
                      <div>+44 77 12345678</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">EMAIL</div>
                      <div className="truncate">chamara@example.com</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Upload area with inline document details */}
            <div className="mt-2">
              <div className="flex space-x-4">
                <div className="flex-1">
                  <div
                    className={`border-2 border-dashed rounded-md p-4 flex flex-col items-center justify-center h-[180px] ${
                      dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300"
                    }`}
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                  >
                    <input
                      type="file"
                      id="file-upload"
                      multiple
                      className="hidden"
                      onChange={handleFileSelect}
                      accept="image/*,.pdf,.doc,.docx"
                    />
                    <File className="h-6 w-6 text-blue-500 mb-2" />
                    <p className="text-sm text-gray-600 mb-1">Select files or drag and drop here</p>
                    <p className="text-xs text-gray-400 mb-2">PNG, JPG, PDF or DOC (max. 10MB each)</p>
                    <label htmlFor="file-upload">
                      <Button size="sm" variant="secondary" className="bg-blue-100 text-blue-600 hover:bg-blue-200">
                        Browse Files
                      </Button>
                    </label>
                  </div>
                </div>

                <div className="w-64 space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Document Name</label>
                    <Input
                      placeholder="Document Name"
                      value={documentName}
                      onChange={(e) => setDocumentName(e.target.value)}
                      className="w-full h-9 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Document Type</label>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="w-full h-9 flex justify-between items-center text-sm">
                          {documentType}
                          <ChevronDown className="h-4 w-4 opacity-50" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-64">
                        {["Lab Report", "X-Ray", "Scan Report", "Prescription", "Medical Certificate"].map(type => (
                          <DropdownMenuItem 
                            key={type}
                            onClick={() => setDocumentType(type)}
                          >
                            {type}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-gray-200">
            <div className="flex justify-end space-x-2">
              <Button variant="outline" className="px-3 h-8" onClick={() => onClose(false)}>
                Cancel
              </Button>
              <Button 
                className="px-3 h-8 bg-blue-600 hover:bg-blue-700"
                onClick={handleSubmit}
                disabled={mode !== "bulk-update" && attachments.length === 0}
              >
                {isBulkUpdate ? "Update Selected" : mode === "create" ? "Upload" : "Save Changes"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}