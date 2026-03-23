const { GoogleGenerativeAI } = require('@google/generative-ai');

class AIService {
  constructor() {
    this.genAI = null;
    this.model = null;
    this.initialized = false;
    this.initialize();
  }

  initialize() {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      
      if (!apiKey || apiKey === 'your_gemini_api_key_here') {
        console.warn('⚠️ Gemini API key not configured. Chatbot will use fallback responses.');
        return;
      }

      this.genAI = new GoogleGenerativeAI(apiKey);
      this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
      this.initialized = true;
      console.log('✅ Gemini AI service initialized');
    } catch (error) {
      console.error('❌ Failed to initialize Gemini AI service:', error.message);
    }
  }

  async generateChatbotResponse(userMessage) {
    try {
      // If API is not initialized, return fallback response
      if (!this.initialized) {
        return this.getFallbackResponse(userMessage);
      }

      // Enhanced prompt for tourism context
      const prompt = this.buildTourismPrompt(userMessage);

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return {
        success: true,
        message: text.trim(),
        source: 'gemini',
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('Error generating chatbot response:', error);
      
      // Return fallback response on error
      return this.getFallbackResponse(userMessage);
    }
  }

  buildTourismPrompt(userMessage) {
    const context = `
You are Rahi, a smart tourism assistant for India. Your role is to help travelers with:
- Safety tips and recommendations for Indian destinations
- Information about famous tourist places in India
- Cultural insights and travel advice
- Emergency assistance guidance
- Local customs and etiquette
- Weather and seasonal travel advice
- Transportation options
- Food and accommodation recommendations

Always provide helpful, accurate, and safety-focused advice. Be friendly and conversational.
Keep responses concise but informative (max 200 words).

User message: "${userMessage}"

Please respond as Rahi, the helpful tourism assistant:`;

    return context;
  }

  getFallbackResponse(userMessage) {
    const message = userMessage.toLowerCase();
    
    // Pattern-based responses for common queries
    if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
      return {
        success: true,
        message: "Hello! I'm Rahi, your smart tourism assistant. I can help you with information about Indian destinations, safety tips, and travel advice. What would you like to know?",
        source: 'fallback',
        timestamp: new Date().toISOString()
      };
    }

    if (message.includes('safety') || message.includes('safe')) {
      return {
        success: true,
        message: "Safety is our top priority! Here are some general safety tips: Always inform someone about your travel plans, carry emergency contacts, stay in well-lit areas at night, and keep important documents secure. For specific destination safety advice, please tell me where you're planning to visit.",
        source: 'fallback',
        timestamp: new Date().toISOString()
      };
    }

    if (message.includes('destination') || message.includes('place') || message.includes('visit')) {
      return {
        success: true,
        message: "India has amazing destinations! Popular places include the Taj Mahal in Agra, beaches of Goa, hill stations like Shimla and Manali, Kerala backwaters, Rajasthan palaces, and spiritual sites like Varanasi. Which type of destination interests you - historical, natural, spiritual, or adventure?",
        source: 'fallback',
        timestamp: new Date().toISOString()
      };
    }

    if (message.includes('emergency') || message.includes('help') || message.includes('panic')) {
      return {
        success: true,
        message: "In case of emergency, call 112 (National Emergency Number) or 100 (Police). For tourist helpline, dial 1363. Stay calm, share your location with trusted contacts, and seek help from nearby police stations or tourist information centers. Is this an urgent situation?",
        source: 'fallback',
        timestamp: new Date().toISOString()
      };
    }

    if (message.includes('weather') || message.includes('climate')) {
      return {
        success: true,
        message: "India has diverse weather patterns. Best time to visit: October to March for most regions. Summer (April-June) can be very hot. Monsoon (July-September) brings heavy rains. Hill stations are pleasant in summer. Which destination are you planning to visit so I can give specific weather advice?",
        source: 'fallback',
        timestamp: new Date().toISOString()
      };
    }

    // Default response
    return {
      success: true,
      message: "I'm here to help you with your travel queries about India! I can provide information about destinations, safety tips, weather advice, and emergency assistance. Could you please be more specific about what you'd like to know?",
      source: 'fallback',
      timestamp: new Date().toISOString()
    };
  }

  async getSafetyRecommendations(location) {
    try {
      if (!this.initialized) {
        return {
          success: true,
          recommendations: [
            "Always inform someone about your travel plans",
            "Carry emergency contacts and important documents",
            "Stay in well-lit, populated areas",
            "Use reliable transportation options",
            "Keep emergency numbers handy"
          ],
          source: 'fallback'
        };
      }

      const prompt = `Provide 5 specific safety recommendations for travelers visiting ${location}, India. Focus on practical, actionable advice.`;
      
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Parse the response into recommendations array
      const recommendations = text.split('\n')
        .filter(line => line.trim())
        .map(line => line.replace(/^\d+\.?\s*/, '').trim())
        .slice(0, 5);

      return {
        success: true,
        recommendations: recommendations.length > 0 ? recommendations : ["Stay safe and enjoy your travels!"],
        source: 'gemini'
      };

    } catch (error) {
      console.error('Error generating safety recommendations:', error);
      return {
        success: false,
        error: 'Unable to generate safety recommendations at this time'
      };
    }
  }

  async analyzeRisk(data) {
    try {
      // Basic risk analysis based on provided data
      const { location, timeOfDay, weather, crowdLevel } = data;
      
      let riskLevel = 'low';
      let factors = [];

      if (timeOfDay === 'night') {
        riskLevel = 'medium';
        factors.push('Nighttime travel requires extra caution');
      }

      if (weather === 'stormy' || weather === 'heavy_rain') {
        riskLevel = 'high';
        factors.push('Severe weather conditions present risks');
      }

      if (crowdLevel === 'very_high') {
        riskLevel = 'medium';
        factors.push('Very crowded areas may have pickpocket risks');
      }

      return {
        success: true,
        riskLevel,
        factors,
        recommendations: this.getRiskBasedRecommendations(riskLevel),
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('Error analyzing risk:', error);
      return {
        success: false,
        error: 'Unable to analyze risk at this time'
      };
    }
  }

  getRiskBasedRecommendations(riskLevel) {
    const recommendations = {
      low: [
        "Enjoy your trip and stay aware of your surroundings",
        "Keep valuables secure",
        "Follow local guidelines"
      ],
      medium: [
        "Exercise extra caution",
        "Avoid isolated areas",
        "Travel in groups when possible",
        "Keep emergency contacts readily available"
      ],
      high: [
        "Consider postponing non-essential travel",
        "If you must travel, inform others of your plans",
        "Stay in touch regularly with trusted contacts",
        "Have emergency evacuation plan ready"
      ]
    };

    return recommendations[riskLevel] || recommendations.low;
  }
}

module.exports = new AIService();