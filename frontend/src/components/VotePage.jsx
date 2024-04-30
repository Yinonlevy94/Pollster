import React, { useState } from 'react';
import './VotePage.css'; 
import axios from 'axios';

const candidates = [
    { id: 1, name: "Benny Gantz", description: "Lorem ipsum dolor...", imgSrc: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Benny_Gantz_2019_%28cropped%29.jpg/220px-Benny_Gantz_2019_%28cropped%29.jpg" },
    { id: 2, name: "Bibi Netanyahu", description: "Lorem ipsum dolor...", imgSrc: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/74/Benjamin_Netanyahu%2C_February_2023.jpg/220px-Benjamin_Netanyahu%2C_February_2023.jpg" },
    { id: 3, name: "Naftali Bennet", description: "Lorem ipsum dolor...", imgSrc: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/96/Naftali_Bennett_official_portrait.jpg/220px-Naftali_Bennett_official_portrait.jpg" }
];

function VotePage() {
    const [showModal, setShowModal] = useState(false);
    const [selectedCandidate, setSelectedCandidate] = useState(null);
    const [confirmationChecked, setConfirmationChecked] = useState(false);

    const handleVoteClick = candidate => {
        setSelectedCandidate(candidate);
        setShowModal(true);
        setConfirmationChecked(false); // Reset checkbox state each time the modal opens
    };

    const handleVote = async () => {
        if (confirmationChecked && selectedCandidate) {
            try {
                const response = await axios.post('http://localhost:5000/api/vote', { name: selectedCandidate.name });
                console.log('Vote registered:', response.data);
                setShowModal(false); // Close the modal on successful vote
                setConfirmationChecked(false); // Reset checkbox state
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
                    <img src={candidate.imgSrc} alt={`Picture of ${candidate.name}`} />
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
