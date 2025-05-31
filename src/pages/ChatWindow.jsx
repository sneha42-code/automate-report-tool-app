// src/components/ChatWindow.jsx
import React, { useState, useRef, useEffect } from "react";
import "../styles/ChatWindow.css";

const ChatWindow = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm your AI assistant for HR analytics. How can I help you today?",
      sender: "bot",
      timestamp: new Date(),
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Sample responses for demonstration
  const botResponses = {
    attrition: "I can help you understand attrition patterns. Upload your employee data to get insights on turnover rates, demographic breakdowns, and predictive risk analysis.",
    predictive: "Our predictive analytics uses machine learning to identify employees at risk of leaving. The model analyzes factors like tenure, function, grade, and location to predict attrition probability.",
    upload: "To upload your data, simply drag and drop your Excel file (.xlsx) into the upload area, or click to browse. Make sure your file includes columns for Employee Name, Gender, Function, Job Location, Grade, Action Date, Date of Joining, and Action Type.",
    help: "I can assist you with:\n• Understanding attrition analysis\n• Navigating the predictive analytics tool\n• Interpreting your results\n• Troubleshooting file uploads\n• Explaining model insights",
    data: "Your data should include employee information with separation records. Required columns are: Employee Name, Gender, Function, Job Location, Grade, Date of Joining, Action Date, and Action Type. The system automatically identifies separated employees and builds a predictive model.",
    accuracy: "Our Random Forest model typically achieves 85-95% accuracy depending on your data quality and size. The model uses cross-validation and provides feature importance scores to show which factors most influence attrition in your organization.",
    features: "The predictive model considers several key features:\n• Demographics (Gender, Age, Tenure)\n• Job characteristics (Function, Grade, Location)\n• Employment history (Date of joining, tenure length)\n• These are automatically processed and encoded for machine learning analysis."
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsTyping(true);

    // Simulate bot response
    setTimeout(() => {
      const botResponse = generateBotResponse(inputMessage.toLowerCase());
      const botMessage = {
        id: Date.now() + 1,
        text: botResponse,
        sender: "bot",
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const generateBotResponse = (userInput) => {
    // Simple keyword matching for demo purposes
    if (userInput.includes("attrition") || userInput.includes("turnover")) {
      return botResponses.attrition;
    } else if (userInput.includes("predictive") || userInput.includes("predict") || userInput.includes("ml") || userInput.includes("machine learning")) {
      return botResponses.predictive;
    } else if (userInput.includes("upload") || userInput.includes("file") || userInput.includes("data")) {
      return botResponses.upload;
    } else if (userInput.includes("help") || userInput.includes("what can you")) {
      return botResponses.help;
    } else if (userInput.includes("column") || userInput.includes("format") || userInput.includes("structure")) {
      return botResponses.data;
    } else if (userInput.includes("accuracy") || userInput.includes("performance") || userInput.includes("reliable")) {
      return botResponses.accuracy;
    } else if (userInput.includes("feature") || userInput.includes("factor") || userInput.includes("variable")) {
      return botResponses.features;
    } else if (userInput.includes("hello") || userInput.includes("hi") || userInput.includes("hey")) {
      return "Hello! I'm here to help you with HR analytics and predictive modeling. What would you like to know?";
    } else if (userInput.includes("thank")) {
      return "You're welcome! Feel free to ask if you have any other questions about the analytics platform.";
    } else {
      return "I'd be happy to help! You can ask me about:\n• Attrition analysis and predictions\n• File upload requirements\n• Model accuracy and features\n• How to interpret results\n\nWhat specific topic interests you?";
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const formatTimestamp = (timestamp) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <div className={`chat-toggle ${isOpen ? 'open' : ''}`} onClick={toggleChat}>
        {isOpen ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
        )}
      </div>

      {/* Chat Window */}
      <div className={`chat-window ${isOpen ? 'open' : ''}`}>
        <div className="chat-header">
          <div className="chat-header-info">
            <div className="bot-avatar">🤖</div>
            <div className="bot-info">
              <div className="bot-name">HR Analytics Assistant</div>
              <div className="bot-status">Online</div>
            </div>
          </div>
          <button className="chat-close" onClick={toggleChat}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="chat-messages">
          {messages.map((message) => (
            <div key={message.id} className={`message ${message.sender}`}>
              {message.sender === 'bot' && <div className="message-avatar">🤖</div>}
              <div className="message-content">
                <div className="message-text">{message.text}</div>
                <div className="message-timestamp">
                  {formatTimestamp(message.timestamp)}
                </div>
              </div>
              {message.sender === 'user' && <div className="message-avatar">👤</div>}
            </div>
          ))}
          
          {isTyping && (
            <div className="message bot">
              <div className="message-avatar">🤖</div>
              <div className="message-content">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="chat-input-container">
          <div className="quick-questions">
            <button 
              className="quick-question"
              onClick={() => setInputMessage("How does predictive analysis work?")}
            >
              How does predictive analysis work?
            </button>
            <button 
              className="quick-question"
              onClick={() => setInputMessage("What data do I need to upload?")}
            >
              What data do I need?
            </button>
          </div>
          
          <div className="chat-input">
            <textarea
              ref={inputRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me about HR analytics..."
              rows="1"
              className="message-input"
            />
            <button 
              className="send-button"
              onClick={handleSendMessage}
              disabled={!inputMessage.trim()}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22,2 15,22 11,13 2,9 22,2"></polygon>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ChatWindow;