import React, { useState } from 'react';
import { tribes } from '../data';

function TribeSelection({ onSelectTribe }) {
    const [hoveredTribe, setHoveredTribe] = useState(null);

    const mainStyle = {
        backgroundImage: hoveredTribe ? `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url("${encodeURI(hoveredTribe.background)}")` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        transition: 'background-image 0.5s ease-in-out',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '2rem'
    };

    return (
        <div style={mainStyle}>
            <h1 className="gold-text" style={{ fontSize: '3rem', marginTop: '2rem' }}>CHỌN MÔN PHÁI</h1>
            <p style={{ color: '#ccc', marginBottom: '3rem' }}>Chọn tộc hệ mà bạn muốn gia nhập để bắt đầu tu luyện tiếng Anh.</p>

            <div className="tribe-grid">
                {tribes.map((tribe) => (
                    <div
                        key={tribe.id}
                        className={`tribe-card glass ${hoveredTribe?.id === tribe.id ? 'active' : ''}`}
                        onMouseEnter={() => setHoveredTribe(tribe)}
                        onMouseLeave={() => setHoveredTribe(null)}
                        onClick={() => onSelectTribe(tribe)}
                    >
                        <div className="tribe-image-container">
                            <img src={encodeURI(tribe.image)} alt={tribe.name} />
                        </div>
                        <h2 style={{ color: tribe.color }}>{tribe.name}</h2>
                        <p>{tribe.description}</p>
                        <div className="orb" style={{ background: tribe.color }}></div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default TribeSelection;
