
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useGameStore from '../store/useGameStore';
import { sendReaction, toggleRaiseHand, db } from '../lib/firebaseClient';
import { ref, onChildAdded, onValue, off } from 'firebase/database';
import './TrainingRoom.css';

// Mock Vocabulary (Khẩu Quyết) for demo - In real app this comes from Supabase 'lessons'
const MOCK_VOCAB = {
    beginner: ["Hello", "Good Morning", "My name is...", "Thank you", "Sorry", "Family", "Friend", "Happy"],
    intermediate: ["However", "Therefore", "Although", "Opportunity", "Challenge", "Decision", "Experience"],
    advanced: ["Nevertheless", "Furthermore", "Consequence", "Perspective", "Philosophy", "Transformation"]
};

function TrainingRoom({ character, userAvatar, tribe, level, xp, onGainXP, onLevelUp, onLeave, roomInfo, isHost }) {
    // Zustand Store
    const updateSpeakingTime = useGameStore(state => state.updateSpeakingTime);
    const setMuted = useGameStore(state => state.setMuted);
    const { characterInfo } = useGameStore(state => state);

    // Local State
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [aiSuggestion, setAiSuggestion] = useState(`Topics on ${roomInfo?.topic || 'General Info'}`);
    const [floatingWord, setFloatingWord] = useState(null);
    const [reactions, setReactions] = useState([]);
    const [participants, setParticipants] = useState([
        { id: 1, name: 'AI Sensei', avatar: 'https://cdn-icons-png.flaticon.com/512/4712/4712027.png', speaking: false, isMuted: false, role: 'sensei' },
        { id: 2, name: 'Hàn Lập', avatar: '/assets/Tribe 1 - COREFIRE/tribe 1 - character/Sparky/Sparky 3.png', speaking: true, isMuted: false, role: 'student' },
    ]);
    const [isRaisingHand, setIsRaisingHand] = useState(false);

    const roomId = roomInfo?.id || 'demo_room';
    const timerRef = useRef(null);

    // --- 1. LOGIC: KHẨU QUYẾT (Vocabulary Cycle) ---
    useEffect(() => {
        const vocabList = level < 30 ? MOCK_VOCAB.beginner : level < 60 ? MOCK_VOCAB.intermediate : MOCK_VOCAB.advanced;

        const showWord = () => {
            const word = vocabList[Math.floor(Math.random() * vocabList.length)];
            setFloatingWord(word);
            // Hide word after 10s
            setTimeout(() => setFloatingWord(null), 10000);
        };

        // Initial word after 5s
        const initialTimeout = setTimeout(showWord, 5000);

        // Then every 60s
        const interval = setInterval(showWord, 60000);

        return () => {
            clearTimeout(initialTimeout);
            clearInterval(interval);
        };
    }, [level]);

    // --- 2. LOGIC: SPEAKING TIMER & ZUSTAND UI ---
    useEffect(() => {
        if (isSpeaking) {
            timerRef.current = setInterval(() => {
                // Update local UI XP
                onGainXP(1);
                // Update Store ("Nội công" - Silent Evolution)
                updateSpeakingTime(1);
            }, 1000);
        } else {
            clearInterval(timerRef.current);
        }
        return () => clearInterval(timerRef.current);
    }, [isSpeaking, onGainXP, updateSpeakingTime]);

    // --- 3. LOGIC: FIREBASE REALTIME ---
    useEffect(() => {
        // Listen for reactions
        const reactionsRef = ref(db, `rooms/${roomId}/reactions`);
        const unsubscribeReaction = onChildAdded(reactionsRef, (snapshot) => {
            const data = snapshot.val();
            if (data && (Date.now() - data.timestamp < 5000)) { // Only show recent
                addVisualReaction(data.emoji, data.sender);
            }
        });

        // Listen for hands (Optional: could show list of raisers)
        // const handsRef = ref(db, `rooms/${roomId}/hands`);
        // ...

        return () => {
            off(reactionsRef);
        };
    }, [roomId]);

    const addVisualReaction = (emoji, sender) => {
        const id = Date.now() + Math.random();
        setReactions(prev => [...prev, { id, emoji, sender, x: Math.random() * 80 + 10 }]);
        setTimeout(() => {
            setReactions(prev => prev.filter(r => r.id !== id));
        }, 3000);
    };

    const handleReaction = (emoji) => {
        // Optimistic UI update removed to avoid double rendering if listener is fast, 
        // or keep meaningful optimistic UI if desired. Let's rely on listener or optimistic?
        // Let's do optimistic for immediate feedback
        addVisualReaction(emoji, 'You');
        sendReaction(roomId, emoji, characterInfo.nickname || 'Guest');
    };

    const handleRaiseHand = () => {
        const newState = !isRaisingHand;
        setIsRaisingHand(newState);
        toggleRaiseHand(roomId, characterInfo.nickname || 'User', characterInfo.nickname || 'Guest', newState);
        if (newState) {
            handleReaction('✋');
        }
    };

    const toggleMic = () => {
        const newStatus = !isSpeaking;
        setIsSpeaking(newStatus);
        setMuted(!newStatus); // Update Store mute state
        if (newStatus) {
            handleReaction('🎙️');
        }
    };

    // --- RENDER HELPERS ---
    const maxXP = level * 100;
    const progress = Math.min((xp / maxXP) * 100, 100);
    // Use avatar based on level or passed prop
    const charImage = userAvatar || character.evolutions[level - 1] || character.evolutions[0];

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
            {/* --- Floating Vocabulary (Khẩu Quyết) --- */}
            <AnimatePresence>
                {floatingWord && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.8 }}
                        animate={{ opacity: 1, y: -100, scale: 1.2 }}
                        exit={{ opacity: 0, y: -200, scale: 1 }}
                        transition={{ duration: 8, ease: "easeOut" }}
                        className="floating-vocab gold-text-dynamic"
                        style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            zIndex: 20,
                            fontSize: '3rem',
                            textShadow: '0 0 20px rgba(255, 215, 0, 0.8)',
                            pointerEvents: 'none' // Click through
                        }}
                    >
                        {floatingWord}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* --- Reactions Overlay --- */}
            {reactions.map(r => (
                <div key={r.id} className="floating-reaction" style={{ left: `${r.x}%` }}>
                    <span style={{ fontSize: '2rem' }}>{r.emoji}</span>
                    <span style={{ fontSize: '0.8rem', background: 'rgba(0,0,0,0.5)', padding: '2px 5px', borderRadius: '4px' }}>{r.sender}</span>
                </div>
            ))}

            {/* --- TOP HUD --- */}
            <div className="room-header">
                <div className="room-logo">
                    <span className="gold-text" style={{ fontSize: '0.9rem' }}>LISA AI</span>
                </div>

                <div className="topic-scroll-container">
                    <div className="topic-scroll-content">
                        <div className="topic-label">CHỦ ĐỀ: {roomInfo?.topic || 'TỰ DO'}</div>
                    </div>
                </div>

                <div className="room-info-badge">
                    <span>👥 {participants.length + 1}/5</span>
                    {isHost && <i className="fa-solid fa-crown gold-text"></i>}
                </div>
            </div>

            {/* --- MAIN STAGE --- */}
            <div className="room-stage">
                {/* AI Sensei */}
                <div className="ai-sensei-float">
                    <div className="ai-avatar-glow">
                        <img src={participants[0].avatar} alt="Sensei" />
                    </div>
                    <div className="ai-bubble">
                        <div className="ai-label">SENSEI:</div>
                        "{aiSuggestion}"
                    </div>
                </div>

                {/* Participants */}
                <div className="participants-grid">
                    {participants.slice(1).map(p => (
                        <div key={p.id} className={`participant-card ${p.speaking ? 'speaking' : ''}`}>
                            <div className="p-avatar">
                                <img src={p.avatar} alt={p.name} />
                            </div>
                            <div className="p-info">
                                <span className="p-name">{p.name}</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* HERO CHARACTER (YOU) */}
                <div className="hero-container">
                    <div className={`hero-model ${isSpeaking ? 'hero-speaking' : ''}`}>
                        <img src={encodeURI(charImage)} alt="My Character" />
                        <div className="hero-aura"></div>
                    </div>
                    <div className="hero-name-plate">
                        <span className="hero-level-badge">{characterInfo.evolutionStage || 1}</span>
                        <span className="hero-name">{characterInfo.nickname || 'Đại Hiệp'}</span>
                    </div>
                </div>
            </div>

            {/* --- BOTTOM CONTROLS --- */}
            <div className="room-controls-bar glass-premium">
                {/* XP Bar Local */}
                <div className="room-xp-container">
                    <div className="xp-label">CÔNG LỰC ({characterInfo.totalSpeakingSeconds}s)</div>
                    <div className="xp-bar-bg">
                        <div className="xp-bar-fill" style={{ width: `${progress}%` }}></div>
                        <div className="xp-bar-glow" style={{ left: `${progress}%` }}></div>
                    </div>
                </div>

                <div className="control-actions">
                    <button className="reaction-btn" onClick={() => handleReaction('❤️')}>❤️</button>
                    <button className="reaction-btn" onClick={() => handleReaction('😂')}>😂</button>
                    <button
                        className={`reaction-btn ${isRaisingHand ? 'active-hand' : ''}`}
                        onClick={handleRaiseHand}
                        style={{ border: isRaisingHand ? '2px solid gold' : 'none' }}
                    >
                        ✋
                    </button>

                    <button
                        className={`main-mic-btn ${isSpeaking ? 'active' : ''}`}
                        onClick={toggleMic}
                    >
                        <i className={`fa-solid ${isSpeaking ? 'fa-microphone' : 'fa-microphone-slash'}`}></i>
                    </button>

                    <button className="hangup-btn" onClick={onLeave}>
                        <i className="fa-solid fa-phone-slash"></i>
                    </button>
                </div>
            </div>
        </div>
    );
}

export default TrainingRoom;
