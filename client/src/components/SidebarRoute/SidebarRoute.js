import React from 'react';
import './sidebarRoute.css';
import { useNavigate } from 'react-router-dom'; // Import useNavigate instead of useHistory

function SidebarRoute({ icon, text, path }) {
    const navigate = useNavigate();

    const handleRouteClick = () => {
        navigate(path); // Use navigate with the provided path
    };

    return (
        <div className='sidebar-route active' onClick={handleRouteClick}>
            <i className={icon}></i>
            <span className='sidebar-route-text'>{text}</span> {/* Changed from <a> to <span> */}
        </div>
    );
}

export default SidebarRoute;
