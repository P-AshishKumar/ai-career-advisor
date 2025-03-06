import React, { useState, useRef, useEffect } from 'react';
import './ChatGPTClone.css';
import { FaRegSun, FaRegMoon, FaRegTrashAlt, FaArrowRight } from 'react-icons/fa';

function ChatGPTClone() {
    // Manage conversation and state
    const [messages, setMessages] = useState([
        { role: 'assistant', content: "Hi! I'm your AI Career Advisor. Let's find the best AI career path for you!" }
    ]);
    const [inputText, setInputText] = useState('');
    const [theme, setTheme] = useState('dark');
    const [conversations, setConversations] = useState([]);
    const chatEndRef = useRef(null); // Ref for auto-scrolling

    // Scroll to bottom when messages change
    useEffect(() => {
        if (chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    // Function to simulate streaming the response using Fetch streaming
    const streamResponse = async (currentInput) => {
        try {
            // Use fetch for streaming (Axios doesn't support streaming out-of-the-box)
            const response = await fetch('http://localhost:5000/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: currentInput })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            // Initialize a reader to process the streaming response
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let done = false;
            let fullResponse = "";

            // Create a temporary message to update as chunks come in
            const tempMessage = { role: 'assistant', content: "" };
            setMessages((prev) => [...prev, tempMessage]);

            while (!done) {
                const { value, done: doneReading } = await reader.read();
                done = doneReading;
                const chunk = decoder.decode(value);
                fullResponse += chunk;
                // Update the last message with the new chunk
                setMessages((prev) => {
                    const newMessages = [...prev];
                    newMessages[newMessages.length - 1] = { ...tempMessage, content: fullResponse };
                    return newMessages;
                });
            }
        } catch (error) {
            console.error('Error:', error);
            setMessages((prev) => [
                ...prev,
                {
                    role: 'assistant',
                    content: "Sorry, something went wrong. Please try again."
                }
            ]);
        }
    };

    // Handle sending a message
    const handleSend = async () => {
        if (!inputText.trim()) return;

        // Add user message
        const userMessage = { role: 'user', content: inputText };
        setMessages((prev) => [...prev, userMessage]);
        const currentInput = inputText;
        setInputText('');

        // Uncomment one of the following approaches:

        // 1. If your backend supports streaming:
        // await streamResponse(currentInput);

        // 2. Or, if you want a simple non-streaming approach using Axios or fetch:
        
        try {
          const response = await fetch('http://localhost:5000/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: currentInput })
          });
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const data = await response.json();
          if (data.response) {
            setMessages((prev) => [
              ...prev,
              { role: 'assistant', content: data.response }
            ]);
          } else {
            throw new Error('API did not return a valid response');
          }
        } catch (error) {
          console.error('Error:', error);
          setMessages((prev) => [
            ...prev,
            {
              role: 'assistant',
              content: "Sorry, something went wrong. Please try again."
            }
          ]);
        }
        
    };

    // New Chat: Save current conversation and start fresh
    const handleNewChat = () => {
        if (messages.length > 0) {
            setConversations((prev) => [...prev, messages]);
        }
        setMessages([
            { role: 'assistant', content: "Hi! I'm your AI Career Advisor. Let's find the best AI career path for you!" }
        ]);
    };

    // Clear conversation history
    const handleClearConversations = () => {
        setConversations([]);
    };

    // Toggle theme modes
    const setLightMode = () => setTheme('light');
    const setDarkMode = () => setTheme('dark');

    return (
        <div className={`chatgpt-container ${theme}`}>
            {/* Sidebar */}
            <aside className="chatgpt-sidebar">
                <button className="new-chat-btn" onClick={handleNewChat}>
                    + New Chat
                </button>
                <div className="chat-history">
                    {conversations.map((conversation, index) => (
                        <div key={index} className="history-item">
                            Conversation {index + 1}
                        </div>
                    ))}
                </div>
                <div className="sidebar-footer">
                    <div className="footer-item" onClick={setLightMode}>
                        <FaRegSun style={{ marginRight: '0.5rem' }} />
                        Light Mode
                    </div>
                    <div className="footer-item" onClick={setDarkMode}>
                        <FaRegMoon style={{ marginRight: '0.5rem' }} />
                        Dark Mode
                    </div>
                    <div className="footer-item" onClick={handleClearConversations}>
                        <FaRegTrashAlt style={{ marginRight: '0.5rem' }} />
                        Clear Conversations
                    </div>
                </div>
            </aside>

            {/* Main Chat Area */}
            <main className="chatgpt-main">
                <div className="chat-container">
                    {/* Chat messages */}
                    <div className="chat-area">
                        {messages.map((msg, i) => (
                            <div key={i} className={`message ${msg.role}`}>
                                <div className="message-content">{msg.content}</div>
                            </div>
                        ))}
                        {/* Element to scroll into view */}
                        <div ref={chatEndRef} />
                    </div>
                    {/* Input Box */}
                    <div className="chat-input-area">
                        <textarea
                            className="chat-input"
                            placeholder="Send a message..."
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSend();
                                }
                            }}
                        ></textarea>
                        <button className="send-btn" onClick={handleSend}>
                            <FaArrowRight />
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default ChatGPTClone;
