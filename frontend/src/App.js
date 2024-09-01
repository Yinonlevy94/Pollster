import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginForm from './components/LoginForm';
import VotePage from './components/VotePage';
import ThankYouPage from './components/Thankyou';
import AlreadyVoted from './components/AlreadyVoted';
import Results from './components/Results';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<LoginForm />} />
                <Route path="/vote" element={<VotePage />} />
                <Route path="/thankyou" element={<ThankYouPage />} />
                <Route path="/alreadyvoted" element={<AlreadyVoted />} />
                <Route path="/results" element={<Results />} />
            </Routes>
        </Router>
    );
}

export default App;
