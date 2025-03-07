import React, { useState, useRef, useEffect } from 'react';

import { FaRegSun, FaRegMoon, FaRegTrashAlt, FaArrowRight } from 'react-icons/fa';
// Remove these incorrect imports
// import CareerForm from './Components/Careerform'

const CareerForm = ({ onSubmit }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    education: '',
    interests: [],
    experience_level: '',
    preferred_work_style: 'hybrid'
  });

  const questions = {
    1: {
      question: "What is your highest level of education?",
      type: "select",
      options: ["High School", "Bachelor's", "Master's", "PhD", "Self-taught/Bootcamp"]
    },
    2: {
      question: "What areas of AI/technology interest you the most?",
      type: "multiSelect",
      options: ["Machine Learning", "Computer Vision", "NLP", "Robotics", "Data Science", "Cloud Computing"]
    },
    3: {
      question: "What is your current experience level?",
      type: "select",
      options: ["Entry Level", "Mid Level", "Senior Level"]
    }
  };

  const handleNext = () => {
    const currentResponse = step === 1 ? formData.education : 
                          step === 2 ? formData.interests.join(', ') :
                          formData.experience_level;

    onSubmit({
      question: questions[step].question,
      answer: currentResponse,
      showResponse: true
    });

    if (step < 3) {
      setStep(step + 1);
    } else {
      onSubmit({
        education: formData.education,
        interests: formData.interests,
        skills: formData.interests,
        experience_level: formData.experience_level,
        preferred_work_style: 'hybrid'
      });
    }
  };

  const renderQuestionInput = () => {
    const currentQ = questions[step];
    
    if (currentQ.type === "select") {
      return (
        <select 
          className="form-select"
          value={formData[step === 1 ? 'education' : 'experience_level']}
          onChange={(e) => {
            setFormData({
              ...formData,
              [step === 1 ? 'education' : 'experience_level']: e.target.value
            });
          }}
        >
          <option value="">Select an option</option>
          {currentQ.options.map((opt, i) => (
            <option key={i} value={opt}>{opt}</option>
          ))}
        </select>
      );
    } else if (currentQ.type === "multiSelect") {
      return (
        <div className="form-multi-select">
          {currentQ.options.map((opt, i) => (
            <label key={i}>
              <input 
                type="checkbox" 
                value={opt}
                checked={formData.interests.includes(opt)}
                onChange={(e) => {
                  const newInterests = e.target.checked 
                    ? [...formData.interests, opt] 
                    : formData.interests.filter(interest => interest !== opt);
                  setFormData({
                    ...formData,
                    interests: newInterests
                  });
                }}
              />
              {opt}
            </label>
          ))}
        </div>
      );
    }
  };

  return (
    <div className="career-form">
      <h2>Career Assessment</h2>
      <div className="form-question">
        <p>{questions[step].question}</p>
        {renderQuestionInput()}
      </div>
      <button className="form-next-btn" onClick={handleNext}>
        {step < 3 ? 'Next' : 'Submit'}
      </button>
    </div>
  );
};

function ChatGPTClone() {
    // Manage conversation and state
    const [messages, setMessages] = useState([
        { role: 'assistant', content: "Hi! I'm your AI Career Advisor. Let's find the best AI career path for you!" }
    ]);
    const [inputText, setInputText] = useState('');
    const [theme, setTheme] = useState('dark');
    const [conversations, setConversations] = useState([]);
    const [showCareerForm, setShowCareerForm] = useState(false);
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
            const updateMessage = (content) => {
                setMessages((prev) => {
                    const newMessages = [...prev];
                    newMessages[newMessages.length - 1] = { role: 'assistant', content };
                    return newMessages;
                });
            };
            while (!done) {
                const { value, done: doneReading } = await reader.read();
                done = doneReading;
                const chunk = decoder.decode(value);
                fullResponse += chunk;
                // Update the last message with the new chunk
                updateMessage(fullResponse);
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

    // Add this function to handle career advice
    const handleCareerFormSubmit = async (data) => {
        if (data.showResponse) {
            // Add user's response to chat without AI response
            setMessages(prev => [...prev,
                { role: 'user', content: `${data.answer}` }
            ]);
            return;
        }

        // If it's the final submission
        try {
            const response = await fetch('http://localhost:5000/career_recommendation', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const result = await response.json();
            setMessages(prev => [...prev,
                { role: 'assistant', content: formatCareerAdvice(result) }
            ]);
            setShowCareerForm(false);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    // Add this to format the career advice response
    const formatCareerAdvice = (advice) => `
    Career Recommendations:
    ${advice.recommended_roles.join(', ')}
    Career Path:
    ${advice.career_path}
    Skills to Develop:
    ${advice.skill_gaps.join(', ')}
    Action Items:
    ${advice.action_items.join('\n')}
    Rationale:
    ${advice.rationale}
    `;

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
                        <button 
                            className="career-form-btn" 
                            onClick={() => setShowCareerForm(true)}
                        >
                            Start Career Assessment
                        </button>
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
                {showCareerForm && (
                    <div className="career-form-overlay">
                        <CareerForm onSubmit={handleCareerFormSubmit} />
                    </div>
                )}
            </main>
        </div>
    );
}

export default ChatGPTClone;