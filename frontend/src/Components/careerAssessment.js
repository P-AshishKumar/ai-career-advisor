import React, { useState } from 'react';
import './CareerAssessment.css';
import ChatGPTClone from '../ChatGPTClone';
import ChatInterface from './ChatInterface';

const CareerAssessment = () => {
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [selectedInterest, setSelectedInterest] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [assessmentData, setAssessmentData] = useState(null);

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
      interests: [selectedInterest],
      experience_level: "",
      education: "",
      preferred_work_style: "hybrid"
    };

    try {
      const response = await fetch('http://localhost:5000/initial_assessment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const result = await response.json();
      setAssessmentData(result);
      setShowChat(true);
    } catch (error) {
      console.error('Error:', error);
    }
    setIsSubmitting(false);
  };

  if (showChat) {
    return <ChatInterface assessmentData={assessmentData} />;
  }

  return (
    <div className="assessment-container">
      <h1>AI Career Path Assessment</h1>
      
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
  );
};

export default CareerAssessment;