import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Confetti from 'react-confetti';
import './Results.css'; 

const Results = () => {
  const [results, setResults] = useState(null);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [windowHeight, setWindowHeight] = useState(window.innerHeight);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const response = await axios.get('http://localhost:5000/results');
        setResults(response.data);
      } catch (error) {
        console.error('Error fetching results:', error);
      }
    };

    fetchResults();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      setWindowHeight(window.innerHeight);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  if (!results) {
    return <div className="loading">Loading...</div>;
  }

  const { winner, secondPlace, thirdPlace } = results;

  return (
    <div className="results-container">
      <Confetti
        width={windowWidth}
        height={windowHeight}
        numberOfPieces={200}
      />
      <h1>Election Results</h1>
      <div className="result">
        <h2>Winner</h2>
        <img src={winner.img} alt={winner.name} />
        <h1>Congratulations, {winner.name}!</h1>
        <p>You have won the election with {winner.votes} votes ({winner.percentage}%) and {winner.mandates} mandates.</p>
      </div>
      <div className="result second-place">
        <h2>Second Place</h2>
        <img src={secondPlace.img} alt={secondPlace.name} />
        <p>{secondPlace.name} received {secondPlace.votes} votes ({secondPlace.percentage}%) and {secondPlace.mandates} mandates.</p>
      </div>
      <div className="result third-place">
        <h2>Third Place</h2>
        <img src={thirdPlace.img} alt={thirdPlace.name} />
        <p>{thirdPlace.name} received {thirdPlace.votes} votes ({thirdPlace.percentage}%) and {thirdPlace.mandates} mandates.</p>
      </div>
    </div>
  );
};

export default Results;
