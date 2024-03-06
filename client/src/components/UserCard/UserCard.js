import React from 'react';
import './userCard.css';

function UserCard(props) {
    const { profile_image, name, email, role, onClick } = props;

    return (
        <div className="user-card" onClick={onClick}>
            <div className="user-card-info">
                <img className='user-card-avatar' src={profile_image} alt="user's Avatar" />
                <div className='user-card-info-details'>
                    <p className='user-card-full-name'>{name}</p>
                    <p className='user-card-email'>{email}</p>
                    <p className='user-card-role'>{role}</p>
                </div>
            </div>
        </div>
    );
}


export default UserCard;