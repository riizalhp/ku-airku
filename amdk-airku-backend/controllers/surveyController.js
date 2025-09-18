
const Survey = require('../models/surveyModel');
const { analyzeSurveyFeedback } = require('../services/geminiService');

const getSurveys = async (req, res) => {
    try {
        let surveys;
        if (req.user.role === 'Admin') {
            surveys = await Survey.getAll();
        } else {
            surveys = await Survey.getBySalesPersonId(req.user.id);
        }
        res.json(surveys);
    } catch (error) {
        console.error('Error getting surveys:', error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
    }
};

const createSurvey = async (req, res) => {
    try {
        const surveyData = {
            ...req.body,
            salesPersonId: req.user.id // Always attribute to the logged-in user
        };
        const newSurvey = await Survey.create(surveyData);
        res.status(201).json(newSurvey);
    } catch (error) {
        console.error('Error creating survey:', error);
        res.status(500).json({ message: 'Gagal mengirimkan laporan survei.' });
    }
};

const analyzeFeedback = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const feedbackList = await Survey.getAllWithFeedback(startDate, endDate);
        
        if (feedbackList.length === 0) {
            return res.json({
                summary: 'Tidak ada data feedback yang tersedia untuk periode yang dipilih.',
                sentiment: 'Netral',
                themes: [],
                totalAnalyzed: 0
            });
        }
        
        const analysisResult = await analyzeSurveyFeedback(feedbackList);
        res.json({ ...analysisResult, totalAnalyzed: feedbackList.length });

    } catch (error) {
        console.error('Error analyzing feedback:', error);
        res.status(500).json({ message: error.message || 'Gagal menganalisis feedback.' });
    }
};

module.exports = { getSurveys, createSurvey, analyzeFeedback };