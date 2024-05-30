import React, { useState, useEffect } from 'react';
import './testReviewHeader.css';
import { useUser } from '../../../contexts/UserContext';

const TestReviewHeader = () => {
    const [currentTime, setCurrentTime] = useState(new Date());
    const { user } = useUser();

    setInterval(() => {
        setCurrentTime(new Date());
    }, 1000);

    return (
        <div className="review-header">
            <h1 className="review-header-banner">oceni.me</h1>

            <div className="review-header-center">
                <h3>REŽIM PREGLEDANJA STUDENTSKIH RADOVA</h3>
                <h4 className="current-time">{currentTime.toLocaleDateString('sr-Latn-RS', { weekday: 'long'})} {currentTime.toLocaleTimeString('sr-Latn-RS', {hour: '2-digit', minute: '2-digit', second: '2-digit'})}</h4>
            </div>

            <div className="review-header-student">
                <img className="review-header-student-pfp" src={user.avatar}></img>
                <div className="review-header-student-info">
                    <p className="review-header-student-name">{user.firstName} {user.lastName}</p>
                    <p className="review-header-student-email">{user.email}</p>
                </div>
            </div>
        </div>
    );
}

export default TestReviewHeader;