import { GoogleGenerativeAI } from '@google/generative-ai';

class GeminiService {
  constructor() {
    this.apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    this.genAI = null;
    this.model = null;
    this.initialized = false;
    
    this.initialize();
  }

  initialize() {
    try {
      if (!this.apiKey) {
        console.error('Gemini API key not found in environment variables');
        return;
      }

      this.genAI = new GoogleGenerativeAI(this.apiKey);
      this.model = this.genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE",
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE",
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE",
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE",
          },
        ],
      });
      
      this.initialized = true;
      console.log('Gemini AI service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Gemini AI service:', error);
    }
  }

  async generateResponse(userMessage) {
    if (!this.initialized || !this.model) {
      throw new Error('Gemini AI service not initialized');
    }

    try {
      // Create a context-aware prompt for the RAAHI tourist safety app
      const contextualPrompt = `
You are RAAHI, an AI assistant for a tourist safety application. Your role is to help travelers with:
- Safety tips and recommendations for destinations
- Emergency assistance information
- Travel safety guidelines
- Information about tourist destinations in India
- General travel advice and support

Please respond to the following user message in a helpful, friendly, and informative way. Keep responses concise but informative, and always prioritize safety:

User message: "${userMessage}"
`;

      const result = await this.model.generateContent(contextualPrompt);
      const response = await result.response;
      const text = response.text();

      if (!text || text.trim().length === 0) {
        throw new Error('Empty response from Gemini AI');
      }

      return {
        message: text.trim(),
        source: 'gemini'
      };
    } catch (error) {
      console.error('Error generating Gemini response:', error);
      throw error;
    }
  }

  isAvailable() {
    return this.initialized && this.model !== null;
  }

  getStatus() {
    return {
      initialized: this.initialized,
      hasApiKey: !!this.apiKey,
      hasModel: !!this.model
    };
  }
}

// Create and export a singleton instance
const geminiService = new GeminiService();
export default geminiService;