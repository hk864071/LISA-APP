import React, { useState } from 'react';
import { tribes } from '../data';
import './TribeSelection.css';

function TribeSelection({ onSelectTribe }) {
    const [hoveredTribe, setHoveredTribe] = useState(null);

    return (
        <div
            className="tribe-selection-screen"
            style={{
                backgroundImage: hoveredTribe
                    ? `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url("${encodeURI(hoveredTribe.background)}")`
                    : `linear-gradient(rgba(0,0,0,0.8), rgba(0,0,0,0.8)), url("${encodeURI(tribes[1].background)}")`
            }}
        >
            <h1 className="gold-text tribe-title">CHỌN MÔN PHÁI</h1>
            <p className="tribe-subtitle">Chọn tộc hệ mà bạn muốn gia nhập để bắt đầu tu luyện tiếng Anh.</p>

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
                        <div className="orb" style={{ background: tribe.color, boxShadow: `0 0 10px ${tribe.color}` }}></div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default TribeSelection;
