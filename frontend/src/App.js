import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CareerAssessment from './Components/CareerAssessment'
import ChatGPTClone from './ChatGPTClone';
import './App.css';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<CareerAssessment />} />
        <Route path="/chat" element={<ChatGPTClone />} />
      </Routes>
    </Router>
  );
};

export default App;