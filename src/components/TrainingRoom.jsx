
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useGameStore from '../store/useGameStore';
import { sendReaction, toggleRaiseHand, db } from '../lib/firebaseClient';
import { ref, onChildAdded, onValue, off } from 'firebase/database';
import GlobalChat from './GlobalChat';
import './TrainingRoom.css';
import { getRankTitle, getMaxXP } from '../utils/levelSystem';
import { STAGE_CONTENT } from '../data/stageContent';
import { tribes } from '../data';

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
    const [peekingChar, setPeekingChar] = useState(null);

    const roomId = roomInfo?.id || 'demo_room';
    const timerRef = useRef(null);

    // --- 1. LOGIC: KHẨU QUYẾT (Vocabulary Cycle) ---
    useEffect(() => {
        // Logic to find vocab based on Topic
        let vocabList = [];

        // 1. Try to find the specific lesson in STAGE_CONTENT
        if (roomInfo && roomInfo.topic) {
            // Flatten all lessons to search
            const allLessons = Object.values(STAGE_CONTENT).flatMap(stage => stage.lessons || []);
            const foundLesson = allLessons.find(l => l.title === roomInfo.topic); // Topic in Room creation was likely set to Lesson Title
            if (foundLesson) {
                vocabList = foundLesson.vocab;
            }
        }

        // 2. Fallback if no specific lesson found or empty
        if (!vocabList || vocabList.length === 0) {
            vocabList = level < 30 ? MOCK_VOCAB.beginner : level < 60 ? MOCK_VOCAB.intermediate : MOCK_VOCAB.advanced;
        }

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

        // --- Random Playful Peeking Characters ---
        const PEEK_INTERVAL_MIN = 10000;
        const PEEK_INTERVAL_MAX = 30000;
        let peekTimeout;

        const triggerPeek = () => {
            // Pick a random tribe and random character
            const randomTribe = tribes[Math.floor(Math.random() * tribes.length)];
            const randomChar = randomTribe.characters[Math.floor(Math.random() * randomTribe.characters.length)];
            const randomEvo = randomChar.evolutions[Math.floor(Math.random() * randomChar.evolutions.length)];
            const side = Math.random() > 0.5 ? 'left' : 'right';

            setPeekingChar({
                image: randomEvo,
                side: side,
                id: Date.now()
            });

            // Schedule next peek
            const nextPeek = Math.floor(Math.random() * (PEEK_INTERVAL_MAX - PEEK_INTERVAL_MIN)) + PEEK_INTERVAL_MIN;
            peekTimeout = setTimeout(triggerPeek, nextPeek);
        };

        peekTimeout = setTimeout(triggerPeek, 15000); // Start after 15s

        return () => {
            off(reactionsRef);
            clearTimeout(peekTimeout);
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

    const [viewingParticipant, setViewingParticipant] = useState(null);

    // --- RENDER HELPERS ---
    const maxXP = getMaxXP(level);
    const progress = Math.min((xp / maxXP) * 100, 100);

    // Determine Display Character (Self or Spectating)
    // Safe fallback: use evolutions[0] if specific level evolution not found (e.g. level > 3 but array has 3 items)
    // In App.jsx, userAvatar is already passed as the correct evolution image based on getEvolutionIndex(level)
    const selfAvatar = userAvatar || character.evolutions[0];
    const selfName = characterInfo.nickname || 'Đại Hiệp';
    const selfLevel = characterInfo.evolutionStage || 1;

    const displayAvatar = viewingParticipant ? viewingParticipant.avatar : selfAvatar;
    const displayName = viewingParticipant ? viewingParticipant.name : selfName;
    const displayLevel = viewingParticipant ? '?' : selfLevel;

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

            {/* --- Peeking Character (Tăng động) --- */}
            <AnimatePresence>
                {peekingChar && (
                    <motion.div
                        key={peekingChar.id}
                        initial={{ x: peekingChar.side === 'left' ? '-100%' : '100%', rotate: peekingChar.side === 'left' ? -20 : 20 }}
                        animate={{ x: peekingChar.side === 'left' ? '-20%' : '20%', rotate: 0 }}
                        exit={{ x: peekingChar.side === 'left' ? '-100%' : '100%' }}
                        transition={{ type: 'spring', stiffness: 100, damping: 15, duration: 2 }}
                        onAnimationComplete={() => {
                            setTimeout(() => setPeekingChar(null), 2000); // Stay for 2s then leave
                        }}
                        style={{
                            position: 'absolute',
                            bottom: '20%',
                            [peekingChar.side]: 0,
                            width: '300px',
                            height: '300px',
                            zIndex: 30, // Above background, below UI
                            pointerEvents: 'none',
                            filter: 'drop-shadow(0 0 20px rgba(0,0,0,0.5))'
                        }}
                    >
                        <img
                            src={encodeURI(peekingChar.image)}
                            alt="Peek"
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'contain',
                                transform: peekingChar.side === 'right' ? 'scaleX(-1)' : 'none' // Flip if coming from right
                            }}
                        />
                        <div className="speech-bubble" style={{
                            position: 'absolute',
                            top: '10%',
                            [peekingChar.side === 'left' ? 'right' : 'left']: '-20%',
                            background: 'white',
                            padding: '10px 15px',
                            borderRadius: '20px',
                            color: 'black',
                            fontWeight: 'bold',
                            whiteSpace: 'nowrap',
                            boxShadow: '0 5px 15px rgba(0,0,0,0.2)'
                        }}>
                            {['Hé lô!', 'Ngó tí coi!', 'Chăm chỉ quá ta!', 'Cố lên!', 'Peek-a-boo!'][Math.floor(Math.random() * 5)]}
                        </div>
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
                        <div
                            key={p.id}
                            className={`participant-card ${p.speaking ? 'speaking' : ''} ${viewingParticipant?.id === p.id ? 'being-viewed' : ''}`}
                            onClick={() => setViewingParticipant(p)}
                            style={{ cursor: 'pointer' }}
                        >
                            <div className="p-avatar">
                                <img src={p.avatar} alt={p.name} />
                            </div>
                            <div className="p-info">
                                <span className="p-name">{p.name}</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* HERO CHARACTER (YOU OR SPECTATING) */}
                <div className="hero-container" onClick={() => setViewingParticipant(null)} style={{ cursor: viewingParticipant ? 'pointer' : 'default' }}>

                    {viewingParticipant && (
                        <div style={{
                            position: 'absolute',
                            top: '-30px',
                            background: 'rgba(0,0,0,0.7)',
                            color: '#4dff88',
                            padding: '5px 10px',
                            borderRadius: '20px',
                            fontSize: '0.8rem',
                            border: '1px solid #4dff88'
                        }}>
                            <i className="fa-solid fa-eye"></i> Đang xem
                        </div>
                    )}

                    <div className={`hero-model ${isSpeaking ? 'hero-speaking' : ''}`}>
                        <img src={encodeURI(displayAvatar)} alt="Character" />
                        <div className="hero-aura"></div>
                    </div>
                    <div className="hero-name-plate">
                        <span className="hero-level-badge">{displayLevel}</span>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <span className="hero-name">{displayName}</span>
                            {/* Show Rank Title if viewing self or if we had rank info for others */}
                            {!viewingParticipant && <span style={{ fontSize: '0.6rem', color: '#ffd700' }}>{getRankTitle(level)}</span>}
                        </div>
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

            {/* --- ROOM CHAT --- */}
            <GlobalChat roomId={roomId} title="PHÒNG LUẬN ĐẠO" />
        </div>
    );
}

export default TrainingRoom;
