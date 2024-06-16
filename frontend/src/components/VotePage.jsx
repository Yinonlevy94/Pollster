import React, { useState, useEffect } from 'react';
import './VotePage.css'; 
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const candidates = [
    { id: 1, name: "Benny Gantz", description: "Benny Gantz, leader of the Blue and White party and former IDF Chief of Staff, emphasizes strong defense, pragmatic diplomacy, economic stability, and social equity. He aims to revive the peace process while ensuring Israel's security and addressing societal disparities.", imgSrc: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Benny_Gantz_2019_%28cropped%29.jpg/220px-Benny_Gantz_2019_%28cropped%29.jpg" },
    { id: 2, name: "Bibi Netanyahu", description: "Benjamin Netanyahu, leader of the Likud party, is Israel's longest-serving Prime Minister. He focuses on strong national security, free-market economics, and close US-Israel ties, with a cautious approach to the Israeli-Palestinian peace process.", imgSrc: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/74/Benjamin_Netanyahu%2C_February_2023.jpg/220px-Benjamin_Netanyahu%2C_February_2023.jpg" },
    { id: 3, name: "Naftali Bennet", description: "Naftali Bennett, leader of the New Right party and former Prime Minister, is a tech entrepreneur and ex-elite soldier. He advocates for tough security, free-market policies, education reform, and expanding West Bank settlements.", imgSrc: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/96/Naftali_Bennett_official_portrait.jpg/220px-Naftali_Bennett_official_portrait.jpg" }
];

function VotePage() {
    const [showModal, setShowModal] = useState(false);
    const [selectedCandidate, setSelectedCandidate] = useState(null);
    const [confirmationChecked, setConfirmationChecked] = useState(false);
    const navigate = useNavigate();
    const username = useSelector((state) => state.username);


    const handleVoteClick = candidate => {
        setSelectedCandidate(candidate);
        setShowModal(true);
        setConfirmationChecked(false);
    };

    const handleVote = async () => {
        if (confirmationChecked && selectedCandidate) {
            try {
                const response = await axios.post('http://localhost:5000/api/votepage', {
                    username: username,
                    vote: selectedCandidate.name
                });
                console.log('Vote registered:', response.data);
                setShowModal(false); 
                setConfirmationChecked(false); 
                navigate('/thankyou'); 
            } catch (error) {
                console.error('Error submitting vote:', error);
            }
        } else {
            alert("Please check the confirmation box if you're sure.");
        }
    };

    return (
        <div className="vote-container">
            {candidates.map(candidate => (
                <button key={candidate.id} className="candidate" onClick={() => handleVoteClick(candidate)}>
                    <img src={candidate.imgSrc} alt={candidate.name} />
                    <h3>{candidate.name}</h3>
                    <p>{candidate.description}</p>
                </button>
            ))}

            {showModal && selectedCandidate && (
                <div className="modal">
                    <div className="modal-content">
                        <span className="close-button" onClick={() => setShowModal(false)}>&times;</span>
                        <h2>Are you sure you want to pick {selectedCandidate.name}?</h2>
                        <label>
                            <input type="checkbox" checked={confirmationChecked} onChange={e => setConfirmationChecked(e.target.checked)} />
                            I'm sure
                        </label>
                        <button onClick={handleVote} disabled={!confirmationChecked}>OK</button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default VotePage;
