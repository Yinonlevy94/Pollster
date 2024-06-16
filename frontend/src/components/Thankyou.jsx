import React from 'react';
import './ThankYou.css';

function ThankYouPage() {
    return (
        <div className="thank-you-container">
            <div className="thank-you-content">
                <h1>Thank You for Your Vote!</h1>
                <p>Your vote has been successfully recorded.</p>
                <div className="checkmark-container">
                    <svg className="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
                        <circle className="checkmark-circle" cx="26" cy="26" r="25" fill="none"/>
                        <path className="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
                    </svg>
                </div>
            </div>
        </div>
    );
}

export default ThankYouPage;
