import React, { useState } from 'react';
import './CharacterSelection.css';

function CharacterSelection({ tribe, onSelectCharacter, onBack }) {
    const [selectedChar, setSelectedChar] = useState(null);
    const [hoveredChar, setHoveredChar] = useState(null);

    const currentChar = hoveredChar || selectedChar || tribe.characters[0];
    const displayImage = currentChar.evolutions[2] || currentChar.evolutions[0]; // Use Stage 3 for maximum epicness

    return (
        <div className="character-selection-screen" style={{
            backgroundImage: `url("${encodeURI(tribe.background)}")`
        }}>
            <div className="char-bg-overlay"></div>

            <header className="char-select-header">
                <button className="back-btn" onClick={onBack}>
                    <i className="fa-solid fa-chevron-left"></i> {tribe.name.toUpperCase()}
                </button>
                <div style={{ flex: 1 }}></div>
            </header>

            <div className="char-selection-container">
                {/* 1. LEFT PANEL: STATS & LORE */}
                <div className="char-info-panel">
                    <h1 className="char-name-huge">{currentChar.name}</h1>
                    <div className="char-tagline" style={{ color: tribe.color }}>
                        {currentChar.species} • {currentChar.weapon}
                    </div>

                    <div className="stat-row">
                        <span className="stat-label">Tuổi (Age)</span>
                        <span className="stat-val">{currentChar.age}</span>
                    </div>
                    <div className="stat-row">
                        <span className="stat-label">Hệ (Class)</span>
                        <span className="stat-val">{currentChar.house}</span>
                    </div>
                    <div className="stat-row">
                        <span className="stat-label">Tính Cách</span>
                        <span className="stat-val">{currentChar.personality}</span>
                    </div>

                    <div className="char-story">
                        "{currentChar.description}"
                    </div>
                </div>

                {/* 2. CENTER: GIANT ARTWORK */}
                <div className="char-art-stage">
                    <img
                        src={encodeURI(displayImage)}
                        alt={currentChar.name}
                        className="main-art-img"
                        key={currentChar.name} // Force re-render animation
                    />
                </div>

                {/* 3. CENTER FLOATING BUTTON */}
                <button
                    className="confirm-fab"
                    onClick={() => onSelectCharacter(currentChar)}
                >
                    CHỌN <i className="fa-solid fa-arrow-right"></i>
                </button>

                {/* 4. BOTTOM RIGHT: SELECTOR STRIP */}
                <div className="char-selector-strip">
                    {tribe.characters.map((char) => (
                        <div
                            key={char.name}
                            className={`strip-item ${currentChar.name === char.name ? 'active' : ''}`}
                            onClick={() => setSelectedChar(char)}
                            onMouseEnter={() => setHoveredChar(char)}
                            onMouseLeave={() => setHoveredChar(null)}
                        >
                            <img src={encodeURI(char.evolutions[0])} alt={char.name} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default CharacterSelection;
