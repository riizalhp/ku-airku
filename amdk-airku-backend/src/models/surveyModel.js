
const pool = require('../config/db');
const { randomUUID } = require('crypto');

const transformRow = (row) => {
    if (!row) return undefined;
    const transformed = { ...row };
    const jsonFields = ['mostSoughtProducts', 'popularAirkuVariants', 'competitorPrices', 'competitorVolumes'];
    for (const field of jsonFields) {
        if (typeof transformed[field] === 'string') {
            try {
                transformed[field] = JSON.parse(transformed[field]);
            } catch (e) {
                console.error(`Failed to parse JSON for field ${field} in survey ${row.id}`);
                transformed[field] = []; // Default to empty array on parse error
            }
        }
    }
    return transformed;
};


const Survey = {
    getAll: async () => {
        const [rows] = await pool.query('SELECT * FROM survey_responses ORDER BY surveyDate DESC');
        return rows.map(transformRow);
    },
    getAllWithFeedback: async (startDate, endDate) => {
        let query = "SELECT feedback FROM survey_responses WHERE feedback IS NOT NULL AND TRIM(feedback) <> ''";
        const params = [];
        if (startDate) {
            query += " AND surveyDate >= ?";
            params.push(startDate);
        }
        if (endDate) {
            query += " AND surveyDate <= ?";
            params.push(endDate);
        }
        const [rows] = await pool.query(query, params);
        return rows.map(r => r.feedback);
    },
    getBySalesPersonId: async (salesPersonId) => {
        const [rows] = await pool.query('SELECT * FROM survey_responses WHERE salesPersonId = ? ORDER BY surveyDate DESC', [salesPersonId]);
        return rows.map(transformRow);
    },
    getById: async (id) => {
        const [rows] = await pool.query('SELECT * FROM survey_responses WHERE id = ?', [id]);
        return transformRow(rows[0]);
    },
    create: async (surveyData) => {
        const {
            salesPersonId, surveyDate, storeName, storeAddress, storePhone,
            mostSoughtProducts, popularAirkuVariants, competitorPrices,
            competitorVolumes, feedback, proofOfSurveyImage
        } = surveyData;
        
        const id = randomUUID();
        const query = `
            INSERT INTO survey_responses (
                id, salesPersonId, surveyDate, storeName, storeAddress, storePhone,
                mostSoughtProducts, popularAirkuVariants, competitorPrices,
                competitorVolumes, feedback, proofOfSurveyImage
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        const params = [
            id, salesPersonId, surveyDate, storeName, storeAddress, storePhone,
            JSON.stringify(mostSoughtProducts || []),
            JSON.stringify(popularAirkuVariants || []),
            JSON.stringify(competitorPrices || []),
            JSON.stringify(competitorVolumes || []),
            feedback || null,
            proofOfSurveyImage || null
        ];
        
        await pool.query(query, params);
        return await Survey.getById(id);
    },
};

module.exports = Survey;
