// src/ChatWindow.jsx
import React from 'react';

const ChatWindow = () => {
  return (
    <div className="chat-window">
      <div className="chat-messages">
        {/* Assistant's question */}
        <div className="message assistant">
          <div className="message-content">
            What is your highest level of education?
          </div>
        </div>

        {/* User's response */}
        <div className="message user">
          <div className="message-content">
            Bachelor's
          </div>
        </div>

        {/* Next question */}
        <div className="message assistant">
          <div className="message-content">
            What areas of AI/technology interest you the most?
          </div>
        </div>

        {/* And so on for the step-by-step conversation */}
      </div>
    </div>
  );
};

export default ChatWindow;