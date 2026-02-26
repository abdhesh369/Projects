/**
 * Simple keyword-based categorization service
 */
const CATEGORY_KEYWORDS = {
    'housing': ['rent', 'mortgage', 'landlord', 'apartment', 'property', 'hoa', 'zillow', 'loft', 'condo'],
    'food': ['uber eats', 'doordash', 'starbucks', 'mcdonalds', 'restaurant', 'cafe', 'grocery', 'walmart', 'kroger', 'whole foods', 'instacart', 'chipotle', 'subway', 'dunkin', 'tacobell', 'wendys', 'burger king', 'safeway', 'publix', 'aldi', 'trader joe'],
    'transportation': ['uber', 'lyft', 'gas', 'shell', 'chevron', 'train', 'bus', 'subway', 'parking', 'dmv', 'auto', 'tesla', 'shell', 'exxon', 'bp', 'mobil', 'amtrak', 'hertz', 'enterprise', 'lime', 'bird'],
    'entertainment': ['netflix', 'spotify', 'hulu', 'disney+', 'cinema', 'theater', 'game', 'steam', 'ticket', 'concert', 'spotify', 'twitch', 'xbox', 'playstation', 'nintendo', 'paramount', 'hbo'],
    'utilities': ['electric', 'water', 'gas bill', 'internet', 'comcast', 'verizon', 'at&t', 't-mobile', 'utility', 'energy', 'xfinity', 'spectrum', 'clp', 'coned'],
    'shopping': ['amazon', 'ebay', 'target', 'best buy', 'apple', 'fashion', 'clothing', 'zara', 'h&m', 'nike', 'adidas', 'mall', 'walmart', 'costco', 'etsy', 'homedepot', 'lowes'],
    'health': ['pharmacy', 'cvs', 'walgreens', 'doctor', 'hospital', 'gym', 'fitness', 'medicare', 'dentist', 'clinic', 'rite aid', 'blue cross', 'aetna'],
    'education': ['tuition', 'school', 'university', 'college', 'course', 'udemy', 'coursera', 'bookstore', 'chegg', 'khan academy'],
    'investments': ['fidelity', 'schwab', 'vanguard', 'robinhood', 'coinbase', 'e*trade', 'investment', 'stock', 'td ameritrade', 'betterment', 'wealthfront'],
    'income': ['salary', 'payroll', 'deposit', 'dividend', 'bonus', 'paycheck', 'venmo from', 'zelle from', 'stripe payout']
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

        // Sort categories by number of keywords to try and match more specific ones first?
        // Actually, the current structure is fine for a simple matcher.
        for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
            if (keywords.some(keyword => {
                // Prioritize exact word match via word boundaries
                // This ensures "gas" matches "gas station" but not "glass" or "gasoline"
                const regex = new RegExp(`\\b${keyword}\\b`, 'i');
                return regex.test(desc);
            })) {
                return category;
            }
        }

        return null;
    }
};

module.exports = categorizationService;
