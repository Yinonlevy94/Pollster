import React from 'react';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import LoginForm from './components/LoginForm'; 
import VotePage from './components/VotePage';
import './App.css';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
   <Route path="/" element={<LoginForm />} />
  <Route path="/login" element={<LoginForm />} /> 
  <Route path="/api/vote" element={<VotePage />} />
</Routes>
    </BrowserRouter>
  );
};

export default App;
