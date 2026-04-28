const express = require("express");
const router = express.Router();

const {
  createSession,
  getSessions,
  getSessionsByPatientId,
  getDoctors,
  getPatients,
  updateSessionStatus,
} = require("../controllers/telemedicineController");

router.post("/sessions", createSession);
router.get("/sessions", getSessions);
router.get("/sessions/patient/:patientId", getSessionsByPatientId);
router.get("/doctors", getDoctors);
router.get("/patients", getPatients);
router.patch("/sessions/:id", updateSessionStatus);

module.exports = router;