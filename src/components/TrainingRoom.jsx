import React, { useState, useEffect } from 'react';
import './TrainingRoom.css';

function TrainingRoom({ character, userAvatar, tribe, level, xp, onGainXP, onLevelUp, onLeave, roomInfo, isHost }) {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [aiSuggestion, setAiSuggestion] = useState(`Topics on ${roomInfo?.topic || 'General Info'}`);
    const [participants, setParticipants] = useState([
        { id: 1, name: 'AI Sensei', avatar: 'https://cdn-icons-png.flaticon.com/512/4712/4712027.png', speaking: false, isMuted: false, role: 'sensei' },
        { id: 2, name: 'Hàn Lập', avatar: '/assets/Tribe 1 - COREFIRE/tribe 1 - character/Sparky/Sparky 3.png', speaking: true, isMuted: false, role: 'student' },
        { id: 3, name: 'Nam Cung', avatar: '/assets/Tribe 1 - THAROK/Tribe 1- Character/TATO/TATO LV 3.png', speaking: false, isMuted: false, role: 'student' },
    ]);
    const [reactions, setReactions] = useState([]);

    // Simulated talking effect for other users
    useEffect(() => {
        const interval = setInterval(() => {
            setParticipants(prev => prev.map(p => ({
                ...p,
                speaking: !p.isMuted && Math.random() > 0.7
            })));
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    // Simulated XP gain when speaking
    useEffect(() => {
        let interval;
        if (isSpeaking) {
            interval = setInterval(() => {
                onGainXP(5); // 5 XP per second
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isSpeaking, onGainXP]);

    // Cycle AI suggestions related to topic
    useEffect(() => {
        const topics = {
            'Technology': ["AI Ethics", "Future of Coding", "VR/AR Impact"],
            'Business': ["Negotiation Skills", "Market Trends", "Leadership"],
            'General': ["Daily Hobbies", "Travel Plans", "Food & Culture"],
            'IELTS': ["Describe a photo", "Opinion Essay", "Speaking Part 2"]
        };
        const currentTopicList = topics[roomInfo?.topic === 'Technology' || roomInfo?.topic === 'Business' || roomInfo?.topic === 'IELTS' ? roomInfo.topic : 'General'];

        const interval = setInterval(() => {
            const randomSuggestion = currentTopicList[Math.floor(Math.random() * currentTopicList.length)];
            setAiSuggestion(randomSuggestion);
        }, 8000);
        return () => clearInterval(interval);
    }, [roomInfo]);

    const toggleMic = () => {
        setIsSpeaking(!isSpeaking);
        if (!isSpeaking) {
            addReaction('🎤', 'You');
        }
    };

    // Moderator functions
    const toggleMuteUser = (id) => {
        if (!isHost) return;
        setParticipants(prev => prev.map(p => p.id === id ? { ...p, isMuted: !p.isMuted } : p));
    };

    const addReaction = (emoji, sender = 'You') => {
        const id = Date.now();
        setReactions(prev => [...prev, { id, emoji, sender, x: Math.random() * 80 + 10 }]);
        setTimeout(() => {
            setReactions(prev => prev.filter(r => r.id !== id));
        }, 3000);
    };

    const maxXP = level * 100; // XP needed for next level
    const progress = Math.min((xp / maxXP) * 100, 100);
    const charImage = userAvatar || character.evolutions[level - 1] || character.evolutions[character.evolutions.length - 1];

    return (
        <div className="training-room" style={{
            backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.2)), url('${encodeURI(tribe.background)}')`,
            backgroundSize: 'cover',
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            position: 'relative'
        }}>
            {/* --- Reactions Overlay --- */}
            {reactions.map(r => (
                <div key={r.id} className="floating-reaction" style={{ left: `${r.x}%` }}>
                    <span style={{ fontSize: '2rem' }}>{r.emoji}</span>
                    <span style={{ fontSize: '0.8rem', background: 'rgba(0,0,0,0.5)', padding: '2px 5px', borderRadius: '4px' }}>{r.sender}</span>
                </div>
            ))}

            {/* --- TOP HUD: Topic & AI --- */}
            <div className="room-header">
                {/* Empty left side or just logo */}
                <div className="room-logo">
                    <span className="gold-text" style={{ fontSize: '0.9rem' }}>LISA AI</span>
                </div>

                <div className="topic-scroll-container">
                    <div className="topic-scroll-content">
                        <div className="topic-label">CHỦ ĐỀ THẢO LUẬN</div>
                        <div className="topic-title gold-text-glow">{roomInfo?.topic || 'TỰ DO'}</div>
                    </div>
                </div>

                <div className="room-info-badge">
                    <span>👥 {participants.length + 1}/5</span>
                    {isHost && <i className="fa-solid fa-crown gold-text"></i>}
                </div>
            </div>

            {/* --- MAIN STAGE --- */}
            <div className="room-stage">

                {/* AI Sensei Floating */}
                <div className="ai-sensei-float">
                    <div className="ai-avatar-glow">
                        <img src={participants[0].avatar} alt="Sensei" />
                    </div>
                    <div className="ai-bubble">
                        <div className="ai-label">AI SENSEI GỢI Ý:</div>
                        "{aiSuggestion}"
                    </div>
                </div>

                {/* Other Participants (Avatars) */}
                <div className="participants-grid">
                    {participants.slice(1).map(p => (
                        <div key={p.id} className={`participant-card ${p.speaking ? 'speaking' : ''} ${p.isMuted ? 'muted' : ''}`}>
                            <div className="p-avatar">
                                <img src={p.avatar} alt={p.name} />
                                {p.isMuted && <div className="mute-overlay"><i className="fa-solid fa-microphone-slash"></i></div>}
                            </div>
                            <div className="p-info">
                                <span className="p-name">{p.name}</span>
                                {isHost && (
                                    <button
                                        className="mod-mute-btn"
                                        onClick={() => toggleMuteUser(p.id)}
                                        title={p.isMuted ? "Unmute" : "Mute Chat"}
                                    >
                                        <i className={`fa-solid ${p.isMuted ? 'fa-microphone' : 'fa-ban'}`}></i>
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* --- HERO CHARACTER (YOU) - CINEMATIC VIEW --- */}
                <div className="hero-container">
                    <div className={`hero-model ${isSpeaking ? 'hero-speaking' : ''}`}>
                        <img src={encodeURI(charImage)} alt="My Character" />
                        <div className="hero-aura"></div>
                    </div>

                    <div className="hero-name-plate">
                        <span className="hero-level-badge">{level}</span>
                        <span className="hero-name">ĐẠI HIỆP (BẠN)</span>
                    </div>
                </div>
            </div>

            {/* --- BOTTOM CONTROLS --- */}
            <div className="room-controls-bar glass-premium">

                {/* XP Bar Local */}
                <div className="room-xp-container">
                    <div className="xp-label">CÔNG LỰC ({Math.floor(xp)}/{maxXP})</div>
                    <div className="xp-bar-bg">
                        <div className="xp-bar-fill" style={{ width: `${progress}%` }}></div>
                        <div className="xp-bar-glow" style={{ left: `${progress}%` }}></div>
                    </div>
                </div>

                <div className="control-actions">
                    <button className="reaction-btn" onClick={() => addReaction('❤️')}>
                        ❤️
                    </button>
                    <button className="reaction-btn" onClick={() => addReaction('✋')}>
                        ✋
                    </button>

                    <button
                        className={`main-mic-btn ${isSpeaking ? 'active' : ''}`}
                        onClick={toggleMic}
                    >
                        <i className={`fa-solid ${isSpeaking ? 'fa-microphone' : 'fa-microphone-slash'}`}></i>
                    </button>

                    <button
                        className="hangup-btn"
                        onClick={onLeave}
                        title="Rời Phòng"
                    >
                        <i className="fa-solid fa-phone-slash"></i>
                    </button>
                </div>
            </div>

            {/* Dev Only: Level Up Button */}
            <button
                onClick={onLevelUp}
                style={{ position: 'absolute', bottom: '1rem', right: '1rem', opacity: 0.1, zIndex: 1000, fontSize: '2rem' }}
                title="Dev: Force Level Up"
            >
                🆙
            </button>
        </div>
    );
}

export default TrainingRoom;
