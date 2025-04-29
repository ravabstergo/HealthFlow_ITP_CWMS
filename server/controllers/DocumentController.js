const Document = require("../models/DocumentModel");
const cloudinary = require("../middleware/CloudinaryConfig");
const upload = require("../middleware/MulterConfig");
const fs = require('fs');



const insertDocument = async (req, res) => {
  upload.single("document")(req, res, async (err) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "File upload failed", error: err.message });
    }

    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      // Determine if the file is a PDF
      const isPdf = req.file.mimetype === 'application/pdf';
      
      // Upload to Cloudinary with appropriate resource_type
      const cloudinaryResult = await cloudinary.uploader.upload(req.file.path, {
        folder: "HealthFlow",
        resource_type: isPdf ? "auto" : "auto",
        format: isPdf ? "pdf" : undefined,
        transformation: isPdf ? [{ flags: 'attachment' }] : undefined
      });

      // Remove temporary file
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Error deleting temporary file:', err);
      });

      const document = new Document({
        patentid: null,
        doctorid: null,
        documentName: req.body.documentName,
        documentUrl: cloudinaryResult.secure_url,
        documentType: req.body.documentType.trim(),
        status: "Pending",
        modifiedAt: null,
      });

      await document.save();

      res.status(201).json({
        message: "Document uploaded and inserted successfully",
        document,
      });
    } catch (error) {
      console.error(error);
      // Clean up temporary file in case of error
      if (req.file) {
        fs.unlink(req.file.path, (err) => {
          if (err) console.error('Error deleting temporary file:', err);
        });
      }
      res.status(500).json({
        message: "Failed to save document metadata",
        error: error.message,
      });
    }
  });
};

const updateDocument = async (req, res) => {
  upload.single("document")(req, res, async (err) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "File upload failed", error: err.message });
    }

    try {
      const { id } = req.params;

      const document = await Document.findById(id);

      if (!document) {
        return res
          .status(404)
          .json({ message: "Document not found for the given id" });
      }

      if (req.body.documentName) document.documentName = req.body.documentName;
      if (req.body.documentType) document.documentType = req.body.documentType;

      document.status = "Pending";

      if (req.file) {
        // Determine if the file is a PDF
        const isPdf = req.file.mimetype === 'application/pdf';
        
        const cloudinaryResult = await cloudinary.uploader.upload(req.file.path, {
          folder: "HealthFlow",
          resource_type: isPdf ? "auto" : "auto",
          format: isPdf ? "pdf" : undefined,
          transformation: isPdf ? [{ flags: 'attachment' }] : undefined
        });
        
        document.documentUrl = cloudinaryResult.secure_url;

        // Remove temporary file
        fs.unlink(req.file.path, (err) => {
          if (err) console.error('Error deleting temporary file:', err);
        });
      }

      document.modifiedAt = new Date();

      await document.save();

      res.status(200).json({
        message: "Document updated successfully",
        document,
      });
    } catch (error) {
      console.error(error);
      // Clean up temporary file in case of error
      if (req.file) {
        fs.unlink(req.file.path, (err) => {
          if (err) console.error('Error deleting temporary file:', err);
        });
      }
      res.status(500).json({
        message: "Failed to update document",
        error: error.message,
      });
    }
  });
};

const getDocumentById = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    res.status(200).json({ document });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Failed to get document", error: error.message });
  }
};

const getAllDocuments = async (req, res) => {
  try {
    const documents = await Document.find();

    if (!documents || documents.length === 0) {
      return res.status(404).json({ message: "No documents found" });
    }

    res.status(200).json({ documents });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Failed to get documents", error: error.message });
  }
};

const deleteDocument = async (req, res) => {
  try {
    const document = await Document.findByIdAndDelete(req.params.id);

    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    res.status(200).json({
      message: "Document deleted successfully",
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Failed to delete document", error: error.message });
  }
};

const statusUpdate = async (req, res) => {
  try {
    const { doctorid, status } = req.body;

    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    const validStatuses = ["Pending", "Doctor Review", "Approved", "Rejected"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status provided" });
    }

    document.doctorid = doctorid;
    document.status = status;
    document.modifiedAt = new Date();

    await document.save();

    res.status(200).json({
      message: "Document status updated successfully",
      document,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to update document status",
      error: error.message,
    });
  }
};

const downloadDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    // Check if the document URL exists
    if (!document.documentUrl) {
      return res.status(404).json({ message: "Document URL not found" });
    }

    // Get the file extension from documentUrl
    const fileExtension = document.documentUrl.split('.').pop().toLowerCase();

    // Set appropriate content type
    const contentTypes = {
      'pdf': 'application/pdf',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png'
    };

    const contentType = contentTypes[fileExtension] || 'application/octet-stream';

    // Format filename for download
    const filename = `${document.documentName}${fileExtension ? '.' + fileExtension : ''}`;

    // For Cloudinary URLs, ensure we're getting a download URL
    let downloadUrl = document.documentUrl;
    if (downloadUrl.includes('cloudinary.com')) {
      // Add fl_attachment flag for Cloudinary URLs to force download
      downloadUrl = downloadUrl.replace('/upload/', '/upload/fl_attachment/');
    }

    res.json({
      url: downloadUrl,
      filename: filename,
      contentType: contentType
    });
  } catch (error) {
    console.error('[DocumentController] Download document error:', error);
    res.status(500).json({ message: "Error downloading document", error: error.message });
  }
};

module.exports = {
  insertDocument,
  updateDocument,
  getDocumentById,
  getAllDocuments,
  deleteDocument,
  statusUpdate,
  downloadDocument
};
