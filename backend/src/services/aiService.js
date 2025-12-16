/**
 * AI Service using Google Gemini AI
 * Falls back to rule-based system if API is unavailable
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini AI (uses GEMINI_API_KEY from .env)
const genAI = process.env.GEMINI_API_KEY
    ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    : null;

/**
 * Predict complaint category using Gemini AI
 */
exports.predictCategory = async (text) => {
    if (!text) return 'General';

    // Try Gemini AI first
    if (genAI) {
        try {
            const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

            const prompt = `Analyze this civic complaint and categorize it into ONE of these categories:
- Garbage & Sanitation
- Roads & Infrastructure
- Water Supply
- Electricity & Power
- Public Safety
- General

Complaint: "${text}"

Respond with ONLY the category name, nothing else.`;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const category = response.text().trim();

            console.log('✅ Gemini AI Category:', category);
            return category;
        } catch (error) {
            console.warn('⚠️ Gemini AI failed, using fallback:', error.message);
        }
    }

    // Fallback to rule-based
    return predictCategoryFallback(text);
};

/**
 * Analyze urgency level using Gemini AI
 */
exports.analyzeUrgency = async (text) => {
    if (!text) return 1;

    // Try Gemini AI first
    if (genAI) {
        try {
            const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

            const prompt = `Analyze this civic complaint and rate its urgency from 1 to 5:
1 = Low urgency (minor issues, can wait weeks)
2 = Medium-low (needs attention within days)
3 = Medium (should be addressed within 1-2 days)
4 = High (urgent, needs immediate attention)
5 = Critical (emergency, life-threatening, requires instant action)

Complaint: "${text}"

Respond with ONLY a number from 1 to 5, nothing else.`;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const urgency = parseInt(response.text().trim());

            if (urgency >= 1 && urgency <= 5) {
                console.log('✅ Gemini AI Urgency:', urgency);
                return urgency;
            }
        } catch (error) {
            console.warn('⚠️ Gemini AI failed, using fallback:', error.message);
        }
    }

    // Fallback to rule-based
    return analyzeUrgencyFallback(text);
};

/**
 * Fallback: Rule-based category prediction
 */
function predictCategoryFallback(text) {
    const lowerText = text.toLowerCase();

    const categories = {
        'Garbage & Sanitation': ['garbage', 'trash', 'rubbish', 'dustbin', 'waste', 'clean', 'smell', 'dump'],
        'Roads & Infrastructure': ['pothole', 'road', 'street', 'asphalt', 'crack', 'bump', 'traffic', 'highway'],
        'Water Supply': ['water', 'leak', 'pipe', 'drainage', 'supply', 'sewage', 'flood'],
        'Electricity & Power': ['electricity', 'light', 'pole', 'wire', 'power', 'outage', 'current', 'lamp'],
        'Public Safety': ['accident', 'unsafe', 'crime', 'theft', 'police', 'danger'],
    };

    for (const [category, keywords] of Object.entries(categories)) {
        if (keywords.some(keyword => lowerText.includes(keyword))) {
            return category;
        }
    }

    return 'General';
}

/**
 * Fallback: Rule-based urgency analysis
 */
function analyzeUrgencyFallback(text) {
    const lowerText = text.toLowerCase();
    const urgencyKeywords = {
        5: ['fire', 'explosion', 'gas leak', 'collapsed', 'life threatening', 'emergency'],
        4: ['spark', 'short circuit', 'flood', 'blocked', 'accident', 'danger'],
        3: ['leak', 'broken', 'damage', 'smell', 'overflow'],
        2: ['pothole', 'garbage', 'trash', 'light', 'pole'],
    };

    for (const [level, keywords] of Object.entries(urgencyKeywords).reverse()) {
        if (keywords.some(keyword => lowerText.includes(keyword))) {
            return parseInt(level);
        }
    }

    return 1;
}
