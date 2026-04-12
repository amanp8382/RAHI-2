const { GoogleGenerativeAI } = require('@google/generative-ai');

class AIService {
  constructor() {
    this.genAI = null;
    this.model = null;
    this.initialized = false;
    this.allowedTopicPattern =
      /\b(travel|travelling|trip|tour|tourist|tourism|visit|visiting|destination|itinerary|route|hotel|stay|accommodation|hostel|flight|train|bus|taxi|cab|metro|transport|packing|passport|visa|airport|station|weather|season|local|custom|culture|food|restaurant|emergency|helpline|police|ambulance|hospital|safe|safety|crime|scam|pickup|pickpocket|crowd|monsoon|landslide|beach|trek|hill station|temple|museum|fort|beach|shopping|guide)\b/i;
    this.initialize();
  }

  initialize() {
    try {
      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey || apiKey === 'your_gemini_api_key_here') {
        console.warn('Gemini API key not configured. Chatbot will use fallback responses.');
        return;
      }

      this.genAI = new GoogleGenerativeAI(apiKey);
      this.model = this.genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 350
        }
      });
      this.initialized = true;
      console.log('Gemini AI service initialized');
    } catch (error) {
      console.error('Failed to initialize Gemini AI service:', error.message);
    }
  }

  isAllowedTopic(userMessage = '') {
    return this.allowedTopicPattern.test(userMessage);
  }

  getOutOfScopeResponse() {
    return {
      success: true,
      message:
        'I can only help with tourist safety and travel questions. Ask me about destinations, transport, weather, local safety, scams, emergency numbers, packing, or trip planning.',
      source: 'guardrail',
      timestamp: new Date().toISOString()
    };
  }

  async generateChatbotResponse(userMessage) {
    try {
      if (!this.isAllowedTopic(userMessage)) {
        return this.getOutOfScopeResponse();
      }

      if (!this.initialized) {
        return this.getFallbackResponse(userMessage);
      }

      const prompt = this.buildTourismPrompt(userMessage);
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      if (!text || !text.trim()) {
        return this.getFallbackResponse(userMessage);
      }

      return {
        success: true,
        message: text.trim(),
        source: 'gemini',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error generating chatbot response:', error.message);
      return this.getFallbackResponse(userMessage);
    }
  }

  buildTourismPrompt(userMessage) {
    return `
You are Rahi, a tourist travel and safety assistant for India.

Rules:
- Answer only tourist safety and travel-related questions.
- If the user asks about anything outside travel or tourist safety, reply: "I can only help with tourist safety and travel questions."
- Focus on practical help for tourists: destinations, transport, local safety, scams, emergency support, weather, packing, etiquette, accommodation areas, and basic itinerary guidance.
- Keep the answer concise, helpful, and action-oriented.
- Do not invent unavailable live facts. If a live detail is needed, say it may change and advise the user to verify locally.
- For emergencies, prioritize immediate steps and include Indian emergency numbers when relevant: 112, 100, 101, 108, 1363.
- Keep replies under 160 words when possible.

User message: "${userMessage}"
`;
  }

  getFallbackResponse(userMessage) {
    const message = (userMessage || '').toLowerCase();

    if (!this.isAllowedTopic(userMessage)) {
      return this.getOutOfScopeResponse();
    }

    if (/(hello|hi|hey)/.test(message)) {
      return {
        success: true,
        message:
          "Hello! I answer only tourist safety and travel questions. Ask me about destinations, local safety, transport, weather, emergency help, or trip planning in India.",
        source: 'fallback',
        timestamp: new Date().toISOString()
      };
    }

    if (/(safety|safe|crime|scam|pickpocket|danger)/.test(message)) {
      return {
        success: true,
        message:
          'For safer travel, stay in busy well-lit areas, use trusted transport, avoid sharing live location publicly, keep copies of documents, and watch for scam offers that feel rushed or unofficial. Tell me your destination for more specific safety advice.',
        source: 'fallback',
        timestamp: new Date().toISOString()
      };
    }

    if (/(destination|place|visit|itinerary|trip|travel)/.test(message)) {
      return {
        success: true,
        message:
          'I can help with destination ideas, itinerary planning, transport, the best time to visit, and local safety tips. Tell me where you want to go and how many days you have.',
        source: 'fallback',
        timestamp: new Date().toISOString()
      };
    }

    if (/(emergency|help|panic|police|ambulance|hospital)/.test(message)) {
      return {
        success: true,
        message:
          'If this is urgent, call 112 now. You can also use 100 for police, 101 for fire, 108 for ambulance, and 1363 for the tourist helpline. Move to a safe public place, share your location with a trusted person, and ask nearby authorities for help.',
        source: 'fallback',
        timestamp: new Date().toISOString()
      };
    }

    if (/(weather|climate|season|monsoon)/.test(message)) {
      return {
        success: true,
        message:
          'Weather affects travel safety a lot in India. October to March is usually comfortable for many destinations, summers can be intense, and monsoon can disrupt roads and trekking routes. Tell me your destination and month for better travel advice.',
        source: 'fallback',
        timestamp: new Date().toISOString()
      };
    }

    if (/(hotel|stay|accommodation|hostel|transport|taxi|cab|train|flight|bus)/.test(message)) {
      return {
        success: true,
        message:
          'I can help with safer stay and transport choices. In general, book well-reviewed accommodation, confirm driver and vehicle details before boarding, and avoid unlicensed transport late at night. Share your city for more specific guidance.',
        source: 'fallback',
        timestamp: new Date().toISOString()
      };
    }

    return {
      success: true,
      message:
        'I can help only with tourist safety and travel queries. Ask about destinations, safety tips, weather, transport, accommodation areas, or emergency guidance.',
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
            'Stay in populated, well-reviewed areas.',
            'Keep emergency contacts and ID copies ready.',
            'Use trusted transport and avoid isolated routes at night.',
            'Watch for local scam patterns around tourist hotspots.',
            'Check weather and local advisories before heading out.'
          ],
          source: 'fallback'
        };
      }

      const prompt = `Provide 5 specific tourist safety recommendations for travelers visiting ${location}, India. Focus only on practical travel safety.`;
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      const recommendations = text
        .split('\n')
        .filter((line) => line.trim())
        .map((line) => line.replace(/^\d+\.?\s*/, '').trim())
        .slice(0, 5);

      return {
        success: true,
        recommendations:
          recommendations.length > 0
            ? recommendations
            : ['Stay alert, plan ahead, and use trusted local services.'],
        source: 'gemini'
      };
    } catch (error) {
      console.error('Error generating safety recommendations:', error.message);
      return {
        success: false,
        error: 'Unable to generate safety recommendations at this time'
      };
    }
  }

  async analyzeRisk(data) {
    try {
      const { timeOfDay, weather, crowdLevel } = data;

      let riskLevel = 'low';
      const factors = [];

      if (timeOfDay === 'night') {
        riskLevel = 'medium';
        factors.push('Night travel can increase safety risk.');
      }

      if (weather === 'stormy' || weather === 'heavy_rain') {
        riskLevel = 'high';
        factors.push('Severe weather can disrupt safe movement.');
      }

      if (crowdLevel === 'very_high') {
        riskLevel = riskLevel === 'high' ? 'high' : 'medium';
        factors.push('Heavy crowds can increase theft and separation risk.');
      }

      return {
        success: true,
        riskLevel,
        factors,
        recommendations: this.getRiskBasedRecommendations(riskLevel),
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error analyzing risk:', error.message);
      return {
        success: false,
        error: 'Unable to analyze risk at this time'
      };
    }
  }

  getRiskBasedRecommendations(riskLevel) {
    const recommendations = {
      low: [
        'Stay aware of your surroundings.',
        'Keep valuables secure.',
        'Follow local travel guidance.'
      ],
      medium: [
        'Use extra caution and avoid isolated areas.',
        'Prefer group travel or trusted transport.',
        'Keep emergency contacts easy to access.'
      ],
      high: [
        'Avoid non-essential movement if possible.',
        'Inform someone about your route and check in regularly.',
        'Move to a safer public area and monitor official alerts.'
      ]
    };

    return recommendations[riskLevel] || recommendations.low;
  }
}

module.exports = new AIService();
