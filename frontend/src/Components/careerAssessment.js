import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CareerAssessment.css'; // Import your old CSS file

const CareerAssessment = () => {
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [selectedInterest, setSelectedInterest] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('');
  const [educationLevel, setEducationLevel] = useState('');
  const [preferredWorkStyle, setPreferredWorkStyle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

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

  const experienceLevels = ["Beginner", "Intermediate", "Advanced"];
  const educationLevels = ["High School", "Bachelor's", "Master's", "PhD"];
  const workStyles = ["Remote", "Hybrid", "On-site"];

  const handleSkillClick = (skill) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter(s => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const handleSubmit = async () => {
    if (!selectedInterest || selectedSkills.length === 0 || !experienceLevel || !educationLevel || !preferredWorkStyle) {
      setError('Please fill out all fields.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    const data = {
      skills: selectedSkills,
      interests: [selectedInterest],
      experience_level: experienceLevel,
      education: educationLevel,
      preferred_work_style: preferredWorkStyle
    };

    try {
      const response = await fetch('http://localhost:5000/career_recommendation', {
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
      navigate('/chat', { state: { assessmentData: result } });
    } catch (error) {
      console.error('Error:', error);
      setError('Failed to submit the form. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

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

      <div className="question-section">
        <h2>What is your experience level?</h2>
        <div className="options-list">
          {experienceLevels.map((level) => (
            <button
              key={level}
              className={`option-button ${experienceLevel === level ? 'selected' : ''}`}
              onClick={() => setExperienceLevel(level)}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      <div className="question-section">
        <h2>What is your highest level of education?</h2>
        <div className="options-list">
          {educationLevels.map((level) => (
            <button
              key={level}
              className={`option-button ${educationLevel === level ? 'selected' : ''}`}
              onClick={() => setEducationLevel(level)}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      <div className="question-section">
        <h2>What is your preferred work style?</h2>
        <div className="options-list">
          {workStyles.map((style) => (
            <button
              key={style}
              className={`option-button ${preferredWorkStyle === style ? 'selected' : ''}`}
              onClick={() => setPreferredWorkStyle(style)}
            >
              {style}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="error-message">{error}</p>}

      <button
        className={`submit-button ${isSubmitting ? 'loading' : ''}`}
        onClick={handleSubmit}
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Processing...' : 'Get Career Advice'}
      </button>
    </div>
  );
};

export default CareerAssessment;