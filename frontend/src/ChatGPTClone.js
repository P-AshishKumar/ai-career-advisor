import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import './ChatGPTClone.css';

const ChatGPTClone = () => {
    const location = useLocation();
    const { assessmentData } = location.state || {};
    const [messages, setMessages] = useState([
        { role: 'assistant', content: "Hi! Based on your profile, let's discuss your career path in more detail." }
    ]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatEndRef = useRef(null);
    const hasRun = useRef(false);

    console.log("Received assessmentData:", assessmentData);

    useEffect(() => {
        if (!hasRun.current && assessmentData && assessmentData.recommended_roles && assessmentData.career_path) {
            const formattedMessage = (
                <div className="chat-response">
                    <h3 className="message-heading">Based on your assessment, here are your career recommendations:</h3>

                    <div className="message-section">
                        <strong>🔹 Recommended Roles:</strong>
                        <ul className="styled-list">
                            {assessmentData.recommended_roles.map((role, index) => (
                                <li key={index}>{role}</li>
                            ))}
                        </ul>
                    </div>

                    <div className="message-section">
                        <strong>📌 Career Path:</strong>
                        <ul className="styled-list">
                            {assessmentData.career_path.split("->").map((step, index) => (
                                <li key={index}>{step.trim()}</li>
                            ))}
                        </ul>
                    </div>

                    <div className="message-section">
                        <strong>📖 Skill Gaps to Work On:</strong>
                        <ul className="styled-list">
                            {assessmentData.skill_gaps.map((skill, index) => (
                                <li key={index}>{skill}</li>
                            ))}
                        </ul>
                    </div>

                    <div className="message-section">
                        <strong>✅ Next Steps:</strong>
                        <ul className="styled-list">
                            {assessmentData.action_items.map((action, index) => (
                                <li key={index}>{action}</li>
                            ))}
                        </ul>
                    </div>

                    <p className="message-footer">Would you like more guidance on any of these areas?</p>
                </div>
            );

            setMessages(prev => [...prev, { role: 'assistant', content: formattedMessage }]);
            hasRun.current = true;
        }
    }, [assessmentData]);

    useEffect(() => {
        if (chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    const handleSend = async () => {
        if (!inputText.trim()) return;

        const userMessage = { role: 'user', content: inputText };
        setMessages(prev => [...prev, userMessage]);
        setInputText('');
        setIsLoading(true);

        try {
            const response = await fetch('http://localhost:5000/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: inputText })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            setMessages(prev => [...prev, { role: 'assistant', content: result.response }]);
        } catch (error) {
            console.error('Error:', error);
            setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, something went wrong. Please try again." }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="chatgpt-container">
            <spline-viewer
                url="https://prod.spline.design/5IIfpnS2Au7TjtFN/scene.splinecode"
                className="background"
            ></spline-viewer>

            <div className="chat-area">
                {messages.map((msg, i) => (
                    <div key={i} className={`message ${msg.role}`}>
                        <div className="message-content">{msg.content}</div>
                    </div>
                ))}
                {isLoading && (
                    <div className="message assistant">
                        <div className="message-content">Thinking...</div>
                    </div>
                )}
                <div ref={chatEndRef} />
            </div>

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
                <button className="send-button" onClick={handleSend}>
                    Send
                </button>
            </div>
        </div>
    );
};

export default ChatGPTClone;
