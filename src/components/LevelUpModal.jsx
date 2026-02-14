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
    // --- RENDER: EVOLUTION ---
    if (isStageUp) {
        // Determine rank color
        let rankColor = '#4dff88'; // Green (default/early)
        if (newLevel >= 60) rankColor = '#b14dff'; // Purple
        if (newLevel >= 90) rankColor = '#ffd700'; // Gold

        return (
            <div className="levelup-overlay" onClick={onClose} style={{ flexDirection: 'column' }}>
                <div className="evolution-container">
                    {/* Shockwave & Thunder */}
                    <div className="shockwave"></div>
                    <div className="thunder-strike"></div>

                    {/* Mystical Aura */}
                    <div className="aura-ring" style={{ borderColor: rankColor, boxShadow: `0 0 50px ${rankColor}33` }}></div>

                    {/* Character Transition */}
                    <div className="old-char-container" style={{ position: 'relative' }}>
                        <img
                            src={encodeURI(oldCharImage)}
                            alt="Old Form"
                            className="old-char"
                        />
                        <img
                            src={encodeURI(newCharImage)}
                            alt="New Form"
                            className="new-char"
                        />
                    </div>
                </div>

                <div style={{ textAlign: 'center', width: '100%', marginTop: '2rem', zIndex: 30 }}>
                    <div className="evolution-text glow-text">
                        ĐỘT PHÁ CẢNH GIỚI
                    </div>
                    <div className="rank-text">
                        Thăng cấp lên <span className="rank-highlight" style={{ color: rankColor, textShadow: `0 0 20px ${rankColor}` }}>{getRankTitle(newLevel)}</span>
                    </div>
                    <button className="wuxia-btn-premium" style={{
                        marginTop: '3rem',
                        animation: 'fadeIn 2s 3s forwards',
                        opacity: 0,
                        fontSize: '1rem',
                        fontWeight: 'bold',
                        padding: '0.8rem 2rem', // Plumper look (more vertical padding)
                        width: 'auto',
                        minWidth: '0',
                        letterSpacing: '0.5px',
                        borderRadius: '50px' // Pill shape for extra plumpness
                    }}>
                        Tiếp tục hành trình
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
