import React, { useState } from 'react';

function CharacterSelection({ tribe, onSelectCharacter, onBack }) {
    const [selectedChar, setSelectedChar] = useState(null);
    const [hoveredChar, setHoveredChar] = useState(null);

    const currentChar = hoveredChar || selectedChar || tribe.characters[0];

    return (
        <div className="character-selection-screen" style={{
            backgroundImage: `linear-gradient(rgba(0,0,0,0.8), rgba(0,0,0,0.8)), url("${tribe.background}")`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column'
        }}>
            <header style={{ padding: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button className="gold-text" onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                    ← QUAY LẠI
                </button>
                <h1 className="gold-text">{tribe.name}: CHỌN NHÂN VẬT</h1>
                <div style={{ width: '80px' }}></div>
            </header>

            <div className="selection-container" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', padding: '2rem', flex: 1 }}>

                {/* Left: Character List */}
                <div className="character-side" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {tribe.characters.map((char) => (
                        <div
                            key={char.name}
                            className={`char-item glass ${currentChar.name === char.name ? 'active' : ''}`}
                            onMouseEnter={() => setHoveredChar(char)}
                            onMouseLeave={() => setHoveredChar(null)}
                            onClick={() => setSelectedChar(char)}
                            style={{ display: 'flex', alignItems: 'center', padding: '1rem', cursor: 'pointer', border: currentChar.name === char.name ? `1px solid ${tribe.color}` : '1px solid rgba(255,255,255,0.1)' }}
                        >
                            <img src={encodeURI(char.evolutions[0])} alt={char.name} style={{ width: '60px', height: '60px', objectFit: 'contain', marginRight: '1rem' }} />
                            <div>
                                <h3 style={{ margin: 0, color: tribe.color }}>{char.name.toUpperCase()}</h3>
                                <small style={{ color: '#888' }}>{char.species} • {char.weapon}</small>
                            </div>
                        </div>
                    ))}

                    <button
                        className="wuxia-btn btn-pulse"
                        style={{ marginTop: '2rem', padding: '1rem' }}
                        onClick={() => onSelectCharacter(currentChar)}
                    >
                        XÁC NHẬN NHẬP THẾ
                    </button>
                </div>

                {/* Right: Profile Panel & Evolutions */}
                <div className="profile-side glass" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', animation: 'fadeIn 0.5s' }}>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <div className="evolution-display" style={{ display: 'flex', gap: '0.5rem' }}>
                            {currentChar.evolutions.map((img, idx) => (
                                <div key={idx} className="evolve-box" style={{ border: '1px solid #444', padding: '5px', borderRadius: '4px' }}>
                                    <img src={encodeURI(img)} alt={`lv${idx + 1}`} style={{ width: '60px', height: '60px', objectFit: 'contain', opacity: 1 }} />
                                    <div style={{ fontSize: '0.6rem', textAlign: 'center', color: '#666' }}>Cấp {idx + 1}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="profile-header">
                        <h2 className="gold-text" style={{ fontSize: '2rem', margin: 0 }}>{currentChar.name.toUpperCase()}</h2>
                        <div style={{ color: tribe.color, fontWeight: 'bold' }}>{currentChar.species} | Nhà {currentChar.house}</div>
                    </div>

                    <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className="stat-box">
                            <label style={{ color: '#666', fontSize: '0.8rem' }}>TUỔI</label>
                            <div style={{ color: '#eee' }}>{currentChar.age}</div>
                        </div>
                        <div className="stat-box">
                            <label style={{ color: '#666', fontSize: '0.8rem' }}>PHÁP KHÍ</label>
                            <div style={{ color: '#eee' }}>{currentChar.weapon}</div>
                        </div>
                    </div>

                    <div className="personality-box">
                        <label style={{ color: '#666', fontSize: '0.8rem' }}>TÍNH CÁCH</label>
                        <p style={{ color: '#eee', margin: '0.5rem 0' }}>{currentChar.personality}</p>
                    </div>

                    <div className="description-box">
                        <label style={{ color: '#666', fontSize: '0.8rem' }}>TRUYỀN THUYẾT</label>
                        <p style={{ color: '#ccc', fontStyle: 'italic', fontSize: '0.9rem', lineHeight: '1.4' }}>{currentChar.description}</p>
                    </div>

                    <div style={{ position: 'relative', flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <img
                            className="floating-char"
                            src={encodeURI(currentChar.evolutions[2])}
                            alt="Full"
                            style={{ maxHeight: '250px', objectFit: 'contain', filter: `drop-shadow(0 0 10px ${tribe.color})` }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CharacterSelection;
