import React, { useState, useEffect } from 'react';
import { getRankTitle, getEvolutionIndex } from '../utils/levelSystem';
import './LevelUpModal.css';

function LevelUpModal({ oldLevel, newLevel, character, onClose, isEvolution }) {
    // Determine which image to show based on new level. 
    // evolutions array is 0-indexed. lv 1 -> index 0, lv 2 -> index 1, etc.
    const newCharImage = character.evolutions[getEvolutionIndex(newLevel)] || character.evolutions.at(-1);
    const oldCharImage = character.evolutions[getEvolutionIndex(oldLevel)] || character.evolutions.at(0);

    const isStageUp = isEvolution || (newLevel === 31 || newLevel === 61 || newLevel === 101); // Fallback check

    useEffect(() => {
        // Auto close after some time or let user click
        // For game feel, let them click to continue
    }, []);

    // --- RENDER: EVOLUTION ---
    if (isStageUp) {
        return (
            <div className="levelup-overlay" onClick={onClose}>
                <div className="evolution-container">
                    {/* Shockwave Effect */}
                    <div className="shockwave"></div>
                    <div className="thunder-strike"></div>

                    {/* Character Transition */}
                    <div className="old-char-container" style={{ position: 'relative' }}>
                        <img
                            src={encodeURI(oldCharImage)}
                            alt="Old Form"
                            className="old-char" // Animated to fade out 
                        />
                        <img
                            src={encodeURI(newCharImage)}
                            alt="New Form"
                            className="new-char" // Animated to pop in dramatically
                        />
                    </div>
                </div>

                <div style={{ position: 'absolute', bottom: '15%', textAlign: 'center', width: '100%' }}>
                    <div className="evolution-text glow-text">
                        ĐỘT PHÁ CẢNH GIỚI
                    </div>
                    <div className="rank-text">
                        Thăng cấp lên {getRankTitle(newLevel)}
                    </div>
                    <button className="wuxia-btn-premium" style={{ marginTop: '2rem', animation: 'fadeIn 2s 3s forwards', opacity: 0 }}>
                        TIẾP TỤC HÀNH TRÌNH
                    </button>
                </div>
            </div>
        );
    }

    // --- RENDER: NORMAL LEVEL UP ---
    return (
        <div className="levelup-overlay" onClick={onClose}>
            <div className="levelup-container">
                <div className="levelup-normal-title">Mở Rộng Kinh Mạch!</div>
                <h1 className="levelup-normal-text">LEVEL {newLevel}</h1>
                <p style={{ color: '#aaa', fontSize: '1rem' }}>Sức chứa kiến thức +10%</p>
                <div style={{ marginTop: '2rem', fontSize: '0.8rem', color: '#666' }}>
                    (Nhấn để tiếp tục)
                </div>
            </div>
        </div>
    );
}

export default LevelUpModal;
