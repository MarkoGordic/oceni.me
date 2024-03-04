import React from 'react';
import './sidebarRoute.css';

function SidebarRoute({ icon, text, path }) {
    return (
        <div className='sidebar-route active'>
            <i className={icon}></i>
            <a className='sidebar-route-text' href={path}>{text}</a>
        </div>
    );
}

export default SidebarRoute;