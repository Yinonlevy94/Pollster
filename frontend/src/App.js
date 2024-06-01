import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import LoginForm from './components/LoginForm'; 
import VotePage from './components/VotePage';
import ThankYouPage from './components/Thankyou'; // Adjusted to match Thankyou.jsx
import './App.css';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginForm />} />
        <Route path="/login" element={<LoginForm />} /> 
        <Route path="api/vote" element={<VotePage />} />
        <Route path="/thankyou" element={<ThankYouPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
