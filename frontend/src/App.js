import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CareerAssessment from './Components/careerAssessment';
import ChatGPTClone from './ChatGPTClone';
import './App.css'; // Ensure styles are applied

const App = () => {
  return (
    <div className="App"> {/* Ensures App.css styles are applied */}
      <Router>
        <Routes>
          <Route path="/" element={<CareerAssessment />} />
          <Route path="/chat" element={<ChatGPTClone />} />
        </Routes>
      </Router>
    </div>
  );
};

export default App;
