const express = require("express");
const router = express.Router();
const { protect, checkPermission } = require("../middleware/authMiddleware");
const {
  createPatientRecord,
  getRecordsByDoctor,
  getRecordById,
  deleteRecord,
  updateRecord,
  // createEncounter,
  // getPatientRecords,
  // getRecordByPatientId,
  // deleteEncounter,
  // searchPatientRecord,
} = require("../controllers/recordController");

// create a patient record
router.post(
  "/",
  protect,
  (req, res, next) => {
    console.log("POST request to create patient record received");
    next();
  },
  createPatientRecord
);

router.get(
  "/doctor",
  protect,
  (req, res, next) => {
    console.log("GET request for records by doctor received");
    next();
  },
  getRecordsByDoctor
);

router.get(
  "/:recordId",
  protect,
  (req, res, next) => {
    console.log(
      "GET request for record details received, recordId:",
      req.params.recordId
    );
    next();
  },
  getRecordById
);

// delete a patient record
router.delete(
  "/:recordId",
  protect,
  (req, res, next) => {
    console.log("DELETE request to delete patient record received");
    next();
  },
  deleteRecord
);

// delete a patient record
router.patch(
  "/:recordId",
  protect,
  (req, res, next) => {
    console.log("PATCH request to delete patient record received");
    next();
  },
  updateRecord
);

// // create an encounter
// router.post("/encounters", createEncounter);

// // update a patient record
// router.patch("/:recordId", updatePatientRecord);

// // delete an encounter
// router.delete("/encounters/:encounterId", deleteEncounter);

// // search for records by name
// router.get("/search/patient-record", searchPatientRecord);

module.exports = router;
