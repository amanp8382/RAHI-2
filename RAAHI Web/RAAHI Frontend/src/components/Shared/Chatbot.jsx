import React, { useState } from 'react';
import apiService from '../../services/api';
import geminiService from '../../services/geminiService';

const Chatbot = () => {
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      text: "Hi there! How can I help you today? I can tell you about our features, safety tips, or famous destinations in India.",
      sender: 'bot'
    }
  ]);
  const [userInput, setUserInput] = useState('');

  // Remove hardcoded API keys - now using backend

  const toggleChatbot = () => {
    setIsChatbotOpen(!isChatbotOpen);
  };

  const handleSend = async () => {
    if (userInput.trim() === '') return;

    const newUserMessage = { text: userInput.trim(), sender: 'user' };
    setMessages(prevMessages => [...prevMessages, newUserMessage]);
    setUserInput('');

    // Add typing indicator
    const typingIndicator = { text: '...', sender: 'bot', isTyping: true };
    setMessages(prevMessages => [...prevMessages, typingIndicator]);

    try {
      // First try the backend API
      const response = await apiService.ai.getChatbotResponse(newUserMessage.text);
      const botText = response.message || "I'm sorry, I'm having trouble connecting right now. Please try again later.";
      
      setMessages(prevMessages => 
        prevMessages.filter(msg => !msg.isTyping).concat({ text: botText, sender: 'bot' })
      );

    } catch (backendError) {
      console.log("Backend unavailable, trying Gemini AI directly:", backendError.message);
      
      // If backend fails, try Gemini AI directly
      try {
        if (geminiService.isAvailable()) {
          const geminiResponse = await geminiService.generateResponse(newUserMessage.text);
          const botText = geminiResponse.message || "I'm sorry, I couldn't generate a response right now.";
          
          setMessages(prevMessages => 
            prevMessages.filter(msg => !msg.isTyping).concat({ 
              text: botText, 
              sender: 'bot'
            })
          );
        } else {
          throw new Error('Gemini AI service not available');
        }
      } catch (geminiError) {
        console.error("Error with Gemini AI:", geminiError);
        
        // Final fallback message
        setMessages(prevMessages => 
          prevMessages.filter(msg => !msg.isTyping).concat({ 
            text: "I'm sorry, I'm experiencing technical difficulties right now. Please try again later or contact support if the issue persists.", 
            sender: 'bot' 
          })
        );
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <>
      <button id="chatbot-toggler" className="chatbot-toggler" onClick={toggleChatbot}>
        <span className="material-symbols-rounded">smart_toy</span>
      </button>
      <div id="chatbot-popup" className={`chatbot-popup ${isChatbotOpen ? 'show' : ''}`}>
        <header className="chat-header">
          <h3 className="header-text">Rahi</h3>
          <button id="close-btn" className="close-btn" onClick={toggleChatbot}>
            <span className="material-symbols-rounded">close</span>
          </button>
        </header>
        <div className="chat-body" id="chat-body">
          {messages.map((msg, index) => (
            <div key={index} className={`message ${msg.sender}`}>
              {msg.isTyping ? '...' : msg.text}
            </div>
          ))}
        </div>
        <footer className="chat-footer">
          <input 
            type="text" 
            id="user-input" 
            placeholder="Type a message..." 
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <button id="send-btn" onClick={handleSend}>
            <span className="material-symbols-rounded">send</span>
          </button>
        </footer>
      </div>
    </>
  );
};

export default Chatbot;