const express = require("express");
const {
  insertDocument,
  getDocumentById,
  getAllDocuments,
  updateDocument,
  deleteDocument,
  statusUpdate,
  downloadDocument,
  getAllDocumentsByDoctor
} = require("../controllers/DocumentController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", insertDocument);
// Move specific routes before wildcard routes
router.get("/doctor/documents", getAllDocumentsByDoctor);
router.get("/", getAllDocuments);
// Wildcard routes after specific routes
router.get("/:id", getDocumentById);
router.put("/:id", updateDocument);
router.delete("/:id", deleteDocument);
router.put("/:patentid/status", statusUpdate);
router.get("/:id/download", downloadDocument);

module.exports = router;
