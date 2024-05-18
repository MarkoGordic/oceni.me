import React from 'react';
import './sidebarRoute.css';
import { NavLink, useNavigate } from 'react-router-dom';

function SidebarRoute({ icon, text, path, exact }) {
    const navigate = useNavigate();

    const handleRouteClick = (e) => {
        e.preventDefault(); // Prevent default link behavior
        navigate(path); // Use navigate with the provided path
    };

    return (
        <NavLink 
            to={path}
            end={exact} // This ensures the link is only active when the location is exactly this path.
            className={({ isActive }) => isActive ? "sidebar-route active" : "sidebar-route"}
            onClick={handleRouteClick}
        >
            <i className={icon}></i>
            <span className='sidebar-route-text'>{text}</span>
        </NavLink>
    );
}

export default SidebarRoute;
