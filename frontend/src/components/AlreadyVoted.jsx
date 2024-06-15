import React from 'react';
import './AlreadyVoted.css';

const AlreadyVoted = () => (
  <div className="already-voted-container">
    <div className="already-voted-content">
      <h1>🚫 You Have Already Voted</h1>
      <p>Thank you for participating in the voting process. Your vote has already been recorded and counted.</p>
      <div className="already-voted-icon">
        <svg className="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
          <circle className="checkmark-circle" cx="26" cy="26" r="25" fill="none" />
          <path className="checkmark-check" fill="none" d="M16 16 36 36" />
          <path className="checkmark-check" fill="none" d="M36 16 16 36" />
        </svg>
      </div>
    </div>
  </div>
);

export default AlreadyVoted;
