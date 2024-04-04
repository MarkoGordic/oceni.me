import React from 'react';
import './singleTestConfig.css';

function SingleTestConfig({ testId, input, filename, onPointsChange }) {
    const handleChange = (e) => {
        const newPoints = parseInt(e.target.value, 10) || 0;
        onPointsChange(newPoints);
    };

    return (
        <div className="testconfig-item">
            <i className="fi fi-br-menu-dots-vertical"></i>
            <div className='testconfig-details'>
                <div className='testconfig-name'>{filename}</div>
                <div className='testconfig-input'>{input}</div>
            </div>
            <div className='testconfig-points'>
                <input type='number' min='0' max='100' step='1' onChange={handleChange} />
            </div>
        </div>
    );
}

export default SingleTestConfig;