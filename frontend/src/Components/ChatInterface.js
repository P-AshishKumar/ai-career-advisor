import React, { useState, useEffect } from 'react';

const ChatInterface = ({ assessmentData }) => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');

    useEffect(() => {
        // Initialize chat with assessment data
        if (assessmentData) {
            setMessages([
                {
                    role: 'assistant',
                    content: `Based on your profile with skills in ${assessmentData.profile.skills.join(', ')} 
                             and interest in ${assessmentData.profile.interests.join(', ')}, 
                             I can help guide your career path. What would you like to know?`
                }
            ]);
        }
    }, [assessmentData]);

    const handleSend = async () => {
        if (!input.trim()) return;

        // Add user message
        setMessages(prev => [...prev, { role: 'user', content: input }]);

        try {
            const response = await fetch('http://localhost:5000/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: input,
                    context: assessmentData
                })
            });

            const data = await response.json();
            setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
        } catch (error) {
            console.error('Error:', error);
        }

        setInput('');
    };

    return (
        <div className="chat-interface">
            {/* Chat messages */}
            <div className="messages">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`message ${msg.role}`}>
                        {msg.content}
                    </div>
                ))}
            </div>

            {/* Input area */}
            <div className="input-area">
                <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Ask about your career path..."
                />
                <button onClick={handleSend}>Send</button>
            </div>
        </div>
    );
};

export default ChatInterface;