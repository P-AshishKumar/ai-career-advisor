import React, { useState, useEffect } from 'react';
import './CareerAssessment.css';
import ChatInterface from './ChatInterface';

const CareerAssessment = () => {
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [selectedInterest, setSelectedInterest] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [assessmentData, setAssessmentData] = useState(null);
  const [step, setStep] = useState(0);

  const skills = [
    "Python", "JavaScript", "SQL", "TensorFlow", 
    "PyTorch", "Data Analysis", "Cloud Computing",
    "Docker", "Git", "REST APIs"
  ];

  const interests = [
    "Artificial Intelligence",
    "Machine Learning",
    "Deep Learning"
  ];

  const introMessages = [
    "Wondering which AI career direction is right for you?",
    "Let's figure it out together!",
    "Tell me more about your background.I'll help you navigate your options."
  ];

  const handleSkillClick = (skill) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter(s => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const data = {
        skills: selectedSkills,
        interests: [selectedInterest]
    };

    try {
        console.log('Submitting data:', data);

        const response = await fetch('http://localhost:5000/initial_assessment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(data)
        });

        // Check if response is JSON
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            throw new Error("Server returned non-JSON response");
        }

        const result = await response.json();
        console.log('Response:', result);

        if (!response.ok) {
            throw new Error(result.error || 'Failed to get career advice');
        }

        setAssessmentData(result);
        setShowChat(true);
    } catch (error) {
        console.error('Error:', error);
        alert('Server error: Please make sure the backend is running and try again');
    } finally {
        setIsSubmitting(false);
    }
  };

  // Add useEffect to initialize Spline
  useEffect(() => {
    // Spline will automatically initialize when the component mounts
    // because we've added the script to index.html
  }, []);

  const renderIntro = () => (
    <div className="intro-container">
      {introMessages.map((message, index) => (
        <div 
          key={index}
          className={`intro-text message-${index + 1}`}
        >
          {message}
        </div>
      ))}
      <button 
        className="start-button"
        onClick={() => setStep(1)}
      >
        Let's Begin
      </button>
    </div>
  );

  return (
    <>
      {!showChat ? (
        <div className="assessment-container">
          {/* Spline viewer needs to be outside mainarea */}
          <spline-viewer
            url="https://prod.spline.design/5IIfpnS2Au7TjtFN/scene.splinecode"
            class="background"
          ></spline-viewer>

          {step === 0 ? renderIntro() : (
            <div className="mainarea">
              <h1 className="text1">AI Career Advisor</h1>
              <div className="question-section">
                  <h2>What technical skills do you have?</h2>
                  <div className="skills-grid">
                  {skills.map((skill) => (
                      <button
                      key={skill}
                      className={`skill-button ${selectedSkills.includes(skill) ? 'selected' : ''}`}
                      onClick={() => handleSkillClick(skill)}
                      >
                      {skill}
                      </button>
                  ))}
                  </div>
              </div>

              <div className="question-section">
                  <h2>Which area interests you the most?</h2>
                  <div className="interests-list">
                  {interests.map((interest) => (
                      <button
                      key={interest}
                      className={`interest-button ${selectedInterest === interest ? 'selected' : ''}`}
                      onClick={() => setSelectedInterest(interest)}
                      >
                      {interest}
                      </button>
                  ))}
                  </div>
              </div>

              <button 
                  className="submit-button"
                  onClick={handleSubmit}
                  disabled={!selectedInterest || selectedSkills.length === 0 || isSubmitting}
              >
                  {isSubmitting ? 'Processing...' : 'Get Career Advice'}
              </button>
            </div>
          )}
        </div>
      ) : (
        <ChatInterface assessmentData={assessmentData} />
      )}
    </>
  );
};

export default CareerAssessment;