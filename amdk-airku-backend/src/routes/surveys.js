
const express = require('express');
const router = express.Router();
const { getSurveys, createSurvey, analyzeFeedback } = require('../controllers/surveyController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, getSurveys)
    .post(protect, createSurvey);

router.get('/analyze-feedback', protect, admin, analyzeFeedback);


module.exports = router;
