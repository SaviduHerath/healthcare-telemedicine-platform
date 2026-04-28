const express = require('express');
const router = express.Router();
const { analyzeSymptoms, getPatients } = require('../controllers/symptomController');

router.post('/analyze', analyzeSymptoms);

//get patients
router.get('/analyze/users', getPatients);

module.exports = router;