import React, { useState, useEffect } from 'react';

const ChatInterface = ({ assessmentData }) => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');

    useEffect(() => {
        if (assessmentData && assessmentData.initial_advice) {
            // Initialize chat with assessment data and initial advice
            setMessages([
                {
                    role: 'assistant',
                    content: `Based on your profile with skills in ${assessmentData.profile.skills.join(', ')} 
                            and interest in ${assessmentData.profile.interests.join(', ')}, here's my advice:
                            
                            Career Recommendations:
                            ${assessmentData.initial_advice.recommended_roles.join(', ')}
                            
                            Suggested Career Path:
                            ${assessmentData.initial_advice.career_path}
                            
                            What would you like to know more about?`
                }
            ]);
        }
    }, [assessmentData]);

    const handleSend = async () => {
        if (!input.trim()) return;

        // Add user message
        const userMessage = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        const currentInput = input;
        setInput('');

        try {
            const response = await fetch('http://localhost:5000/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: currentInput,
                    context: assessmentData
                })
            });

            const data = await response.json();
            if (data.response) {
                setMessages(prev => [...prev, 
                    { role: 'assistant', content: data.response }
                ]);
            }
        } catch (error) {
            console.error('Error:', error);
            setMessages(prev => [...prev, 
                { role: 'assistant', content: "Sorry, I couldn't process your request." }
            ]);
        }
    };

    return (
        <div className="chat-interface">
            <div className="messages">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`message ${msg.role}`}>
                        <div className="message-content">{msg.content}</div>
                    </div>
                ))}
            </div>
            <div className="input-area">
                <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Ask about your career path..."
                />
                <button className="send-button" onClick={handleSend}>Send</button>
            </div>
        </div>
    );
};

export default ChatInterface;