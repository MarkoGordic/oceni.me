import React from 'react';
import './singleTestConfig.css';

function SingleTestConfig({ testId, input, filename }) {
    return (
        <div className="testconfig-item">
            <i className="fi fi-br-menu-dots-vertical"></i>
            <div className='testconfig-details'>
                <div className='testconfig-name'>{filename}</div>
                <div className='testconfig-input'>{input}</div>
            </div>
            <div className='testconfig-points'>
                <input type='number' min='0' max='100' step='1' />
            </div>
        </div>
    );
}

export default SingleTestConfig;