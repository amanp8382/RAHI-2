import React, { useState } from 'react';
import apiService from '../../services/api';

const Chatbot = () => {
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      text: 'Ask me only about tourist safety and travel. I can help with destinations, transport, weather, scams, emergency help, and trip planning.',
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
      const response = await apiService.ai.getChatbotResponse(newUserMessage.text);
      const botText = response.message || "I'm sorry, I'm having trouble connecting right now. Please try again later.";
      
      setMessages(prevMessages => 
        prevMessages.filter(msg => !msg.isTyping).concat({ text: botText, sender: 'bot' })
      );
    } catch (backendError) {
      console.error('Chatbot request failed:', backendError);
      setMessages(prevMessages =>
        prevMessages.filter(msg => !msg.isTyping).concat({
          text: 'The chatbot is temporarily unavailable. It only answers tourist safety and travel questions, so please try again in a moment.',
          sender: 'bot'
        })
      );
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
            placeholder="Ask a travel or tourist safety question..." 
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
