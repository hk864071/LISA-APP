import React, { useState, useEffect } from 'react';

function LevelUpModal({ oldLevel, newLevel, character, onClose }) {
    // Determine which image to show based on new level. 
    // evolutions array is 0-indexed. lv 1 -> index 0, lv 2 -> index 1, etc.
    const charImage = character.evolutions[newLevel - 1] || character.evolutions[character.evolutions.length - 1];

    useEffect(() => {
        // Auto close after some time or let user click
        // For game feel, let them click to continue
    }, []);

    return (
        <div className="levelup-overlay" onClick={onClose}>
            <div className="levelup-burst"></div>

            <div className="levelup-container">
                <div style={{ fontSize: '1.5rem', color: '#fff', letterSpacing: '5px', marginBottom: '1rem', opacity: 0.8 }}>
                    ĐỘT PHÁ CẢNH GIỚI
                </div>
                <h1 className="levelup-text">LEVEL {newLevel}</h1>

                <div className="levelup-char-container">
                    <div className="levelup-rays"></div>
                    <img src={encodeURI(charImage)} alt="Level Up" className="levelup-char" />
                </div>

                <div style={{ marginTop: '2rem' }}>
                    <p style={{ color: '#ccc', fontSize: '1.2rem', marginBottom: '0.5rem' }}>
                        Công Lực Tăng Cường • Mở Khoá Kỹ Năng Mới
                    </p>
                    <button className="wuxia-btn-premium" style={{ width: 'auto', padding: '1rem 3rem', marginTop: '2rem' }}>
                        TIẾP TỤC TU LUYỆN
                    </button>
                </div>
            </div>
        </div>
    );
}

export default LevelUpModal;
