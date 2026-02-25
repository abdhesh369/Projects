/**
 * Simple keyword-based categorization service
 */
const CATEGORY_KEYWORDS = {
    'food': ['uber eats', 'doordash', 'starbucks', 'mcdonalds', 'restaurant', 'cafe', 'grocery', 'walmart', 'kroger', 'whole foods'],
    'transportation': ['uber', 'lyft', 'gas', 'shell', 'chevron', 'train', 'bus', 'subway', 'parking'],
    'entertainment': ['netflix', 'spotify', 'hulu', 'disney+', 'cinema', 'theater', 'game', 'steam'],
    'utilities': ['electric', 'water', 'gas bill', 'internet', 'comcast', 'verizon', 'at&t'],
    'shopping': ['amazon', 'ebay', 'target', 'best buy', 'apple', 'fashion', 'clothing'],
    'health': ['pharmacy', 'cvs', 'walgreens', 'doctor', 'hospital', 'gym', 'fitness']
};

const categorizationService = {
    /**
     * Auto-categorize a transaction based on its description
     * @param {string} description 
     * @returns {string|null} categoryName
     */
    categorize(description) {
        if (!description) return null;

        const desc = description.toLowerCase();

        for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
            if (keywords.some(keyword => desc.includes(keyword))) {
                return category;
            }
        }

        return null;
    }
};

module.exports = categorizationService;
