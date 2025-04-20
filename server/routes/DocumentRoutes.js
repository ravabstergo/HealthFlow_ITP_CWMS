const express = require("express");
const {
  insertDocument,
  getDocumentById,
  getAllDocuments,
  updateDocument,
  deleteDocument,
  statusUpdate,
} = require("../controllers/DocumentController");

const router = express.Router();

router.post("/", insertDocument);
router.get("/:id", getDocumentById);
router.get("/", getAllDocuments);
router.put("/:id", updateDocument);
router.delete("/:id", deleteDocument);
router.put("/:patentid/status", statusUpdate);

module.exports = router;
