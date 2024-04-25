import React, { useState, useEffect } from 'react';
import './testReviewHeader.css';

const TestReviewHeader = () => {
    const [currentTime, setCurrentTime] = useState(new Date());

    setInterval(() => {
        setCurrentTime(new Date());
    }, 1000);

    return (
        <div className="review-header">
            <h1 className="review-header-banner">oceni.me</h1>

            <div className="review-header-center">
                <h3>T1234 - Arhitektura računara 2023</h3>
                <h4 className="current-time">{currentTime.toLocaleDateString('sr-Latn-RS', { weekday: 'long'})} {currentTime.toLocaleTimeString('sr-Latn-RS', {hour: '2-digit', minute: '2-digit', second: '2-digit'})}</h4>
            </div>

            <div className="review-header-student">
                <img className="review-header-student-pfp" src="http://localhost:8000/user_pfp/1.jpg"></img>
                <div className="review-header-student-info">
                    <p className="review-header-student-name">Nađa Jakšić</p>
                    <p className="review-header-student-email">nadjajaksice34@gmail.com</p>
                </div>
            </div>
        </div>
    );
}

export default TestReviewHeader;