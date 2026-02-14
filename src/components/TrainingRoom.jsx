
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useGameStore from '../store/useGameStore';
import { supabase } from '../lib/supabaseClient';
import { sendReaction, toggleRaiseHand, db } from '../lib/firebaseClient';
import { ref, onChildAdded, onValue, off, set, onDisconnect, remove } from 'firebase/database';
import GlobalChat from './GlobalChat';
import './TrainingRoom.css';
import { getRankTitle, getMaxXP } from '../utils/levelSystem';
import { STAGE_CONTENT } from '../data/stageContent';
import { tribes } from '../data';

import AgoraRTC from 'agora-rtc-sdk-ng';
import { AgoraRTCProvider, useJoin, useLocalMicrophoneTrack, usePublish, useRemoteUsers, useRemoteAudioTracks, useConnectionState, useRTCClient } from "agora-rtc-react";
import { AGORA_APP_ID } from '../lib/agoraConfig';
import { generateAgoraToken } from '../lib/agoraTokenGenerator';

// Notification Sounds
// const raiseHandSound = ... (moved inside component for better control)

// Mock Vocabulary
const MOCK_VOCAB = {
    beginner: ["Hello", "Good Morning", "My name is...", "Thank you", "Sorry", "Family", "Friend", "Happy"],
    intermediate: ["However", "Therefore", "Although", "Opportunity", "Challenge", "Decision", "Experience"],
    advanced: ["Nevertheless", "Furthermore", "Consequence", "Perspective", "Philosophy", "Transformation"]
};

// --- PRESENTER COMPONENT (UI ONLY) ---
function TrainingRoomUI({
    // State passed down
    characterInfo, tribe, level, xp, roomInfo, isHost,
    participants, isSpeaking, isRaisingHand, micOn, notification,
    mutedMap, isLocalMuted, // New props
    // Actions passed down
    onLeave, toggleMic, handleRaiseHand, handleReaction, muteRemoteUser,
    // Visuals
    floatingWord, peekingChar, reactions, aiSuggestion, connectionState
}) {
    const [viewingParticipant, setViewingParticipant] = useState(null);
    // State for Custom Confirm Dialog
    const [confirmDialog, setConfirmDialog] = useState(null); // { message, onConfirm }

    // Helpers
    const maxXP = getMaxXP(level);
    const progress = Math.min((xp / maxXP) * 100, 100);
    // Fallback logic specific to user, not AI
    const fallbackImage = `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(characterInfo.nickname || 'Guest')}&backgroundColor=transparent`;

    // Constants
    const realParticipantsCount = participants.filter(p => p.role !== 'sensei').length;

    // Determine who we are viewing
    // Fix: Find local user by role 'me', not id 'local' (which assumes specific ID generation not guaranteed)
    const localUser = participants.find(p => p.role === 'me');
    const displayAvatar = viewingParticipant ? viewingParticipant.avatar : (localUser?.avatar || fallbackImage);
    const displayName = viewingParticipant ? (viewingParticipant.name === 'Lisa AI' ? 'LISA AI' : viewingParticipant.name) : characterInfo.nickname;
    const displayLevel = viewingParticipant ? '?' : characterInfo.evolutionStage;

    // Simplified Avatar Logic for Local User
    // Use the tribe/character info to construct path if not passed explicitly in creating room
    // For MVP we assume participants list has resolved avatars

    // --- SYNCHRONIZED BACKGROUND LOGIC ---
    // Use roomId to deterministically select a background so everyone sees the same one
    const getRoomBackground = () => {
        if (!roomInfo?.id) return tribe.background; // Fallback to personal

        const tribeKeys = Object.keys(tribes);
        // Simple hash of string id to number
        let hash = 0;
        const str = String(roomInfo.id);
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        const index = Math.abs(hash) % tribeKeys.length;
        return tribes[tribeKeys[index]].background;
    };

    const roomBackground = getRoomBackground();

    // --- AUTO-SPOTLIGHT LOGIC ---
    useEffect(() => {
        // Find the first REMOTE participant who is speaking
        const activeSpeaker = participants.find(p => p.speaking && p.role !== 'me' && p.role !== 'sensei');

        if (activeSpeaker) {
            // Set view to them if not already viewing them or explicitly locked
            // Note: We might want a lock feature later. For now, auto-switch.
            if (viewingParticipant?.id !== activeSpeaker.id) {
                setViewingParticipant(activeSpeaker);
            }
        } else {
            // Optional: Revert to self or keep last speaker? 
            // Let's keep last speaker for a bit or revert to null (self) if silence.
            // For now, let's NOT auto-revert to avoid jumping. Only switch ON speech.
        }
    }, [participants, viewingParticipant]);

    return (
        <div className="training-room" style={{
            backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.2)), url('${encodeURI(roomBackground)}')`,
            backgroundSize: 'cover',
            height: '100vh',
            display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative'
        }}>
            {/* CONNECTION DEBUG - Only show if not connected or debug needed */}
            {(connectionState !== 'CONNECTED' && connectionState !== 'DISCONNECTED') && (
                <div style={{ position: 'absolute', top: 5, left: 5, background: 'rgba(0,0,0,0.5)', color: 'yellow', padding: '2px 5px', fontSize: '0.7rem', zIndex: 9999 }}>
                    Status: {connectionState}
                </div>
            )}

            {/* Warning if No App ID */}
            {!AGORA_APP_ID && (
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, background: 'rgba(255, 0, 0, 0.7)', color: 'white', padding: '5px', textAlign: 'center', zIndex: 9999, fontSize: '0.8rem' }}>
                    (Voice Chat Disabled - No App ID)
                </div>
            )}

            {/* Notification Toast */}
            <AnimatePresence>
                {notification && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: -50 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="glass-premium"
                        style={{
                            position: 'absolute', top: '100px', left: '50%', x: '-50%',
                            zIndex: 9999, padding: '1rem 2rem', borderRadius: '12px',
                            border: '1px solid #ff4d4d', background: 'rgba(50, 0, 0, 0.9)',
                            color: '#fff', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '1rem',
                            boxShadow: '0 0 20px rgba(255, 0, 0, 0.5)'
                        }}
                    >
                        <i className="fa-solid fa-bell" style={{ color: '#ff4d4d', fontSize: '1.5rem' }}></i>
                        {notification}
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {floatingWord && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.8 }}
                        animate={{ opacity: 1, y: -100, scale: 1.2 }}
                        exit={{ opacity: 0, y: -200, scale: 1 }}
                        transition={{ duration: 8, ease: "easeOut" }}
                        className="floating-vocab gold-text-dynamic"
                        style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 20, fontSize: '3rem', textShadow: '0 0 20px rgba(255, 215, 0, 0.8)', pointerEvents: 'none' }}
                    >
                        {floatingWord}
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {peekingChar && (
                    <motion.div
                        key={peekingChar.id}
                        initial={{ x: peekingChar.side === 'left' ? '-100%' : '100%', rotate: peekingChar.side === 'left' ? -20 : 20 }}
                        animate={{ x: peekingChar.side === 'left' ? '-20%' : '20%', rotate: 0 }}
                        exit={{ x: peekingChar.side === 'left' ? '-100%' : '100%' }}
                        transition={{ type: 'spring', stiffness: 100, damping: 15, duration: 2 }}
                        onAnimationComplete={() => peekingChar.onComplete && peekingChar.onComplete()}
                        style={{ position: 'absolute', bottom: '20%', [peekingChar.side]: 0, width: '300px', height: '300px', zIndex: 30, pointerEvents: 'none', filter: 'drop-shadow(0 0 20px rgba(0,0,0,0.5))' }}
                    >
                        <img src={encodeURI(peekingChar.image)} alt="Peek" style={{ width: '100%', height: '100%', objectFit: 'contain', transform: peekingChar.side === 'right' ? 'scaleX(-1)' : 'none' }} />
                        <div className="speech-bubble" style={{ position: 'absolute', top: '10%', [peekingChar.side === 'left' ? 'right' : 'left']: '-20%', background: 'white', padding: '10px 15px', borderRadius: '20px', color: 'black', fontWeight: 'bold', whiteSpace: 'nowrap', boxShadow: '0 5px 15px rgba(0,0,0,0.2)' }}>
                            {['Hé lô!', 'Ngó tí coi!', 'Chăm chỉ quá ta!', 'Cố lên!', 'Peek-a-boo!'][Math.floor(Math.random() * 5)]}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Custom Confirm Dialog */}
            <AnimatePresence>
                {confirmDialog && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="modal-overlay"
                        style={{ zIndex: 10000 }}
                    >
                        <motion.div
                            initial={{ scale: 0.8, y: 50 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.8, y: 50 }}
                            className="glass-premium"
                            style={{
                                padding: '2rem', width: '400px', maxWidth: '90%',
                                textAlign: 'center', border: '1px solid var(--gold)',
                                boxShadow: '0 0 30px rgba(0,0,0,0.8)'
                            }}
                        >
                            <h3 className="gold-text" style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>XÁC NHẬN</h3>
                            <p style={{ color: '#fff', marginBottom: '2rem', fontSize: '1.1rem' }}>{confirmDialog.message}</p>
                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                                <button
                                    className="wuxia-btn"
                                    onClick={() => setConfirmDialog(null)}
                                    style={{ background: 'rgba(255,255,255,0.1)', flex: 1 }}
                                >
                                    HỦY BỎ
                                </button>
                                <button
                                    className="wuxia-btn-premium"
                                    onClick={() => {
                                        confirmDialog.onConfirm();
                                        setConfirmDialog(null);
                                    }}
                                    style={{ flex: 1 }}
                                >
                                    ĐỒNG Ý
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {reactions.map(r => (
                <div key={r.id} className="floating-reaction" style={{ left: `${r.x}%` }}>
                    <span style={{ fontSize: '2rem' }}>{r.emoji}</span>
                    <span style={{ fontSize: '0.8rem', background: 'rgba(0,0,0,0.5)', padding: '2px 5px', borderRadius: '4px' }}>{r.sender}</span>
                </div>
            ))}

            <div className="room-header">
                <div className="room-logo"><span className="gold-text" style={{ fontSize: '0.9rem' }}>LISA AI</span></div>
                <div className="topic-scroll-container">
                    <div className="topic-scroll-content">
                        <div className="topic-label">CHỦ ĐỀ: {roomInfo?.topic || 'TỰ DO'}</div>
                    </div>
                </div>
                <div className="room-info-badge"><span>👥 {realParticipantsCount}/5</span>{isHost && <i className="fa-solid fa-crown gold-text"></i>}</div>
            </div>

            <div className="room-stage">
                <div className="ai-sensei-float">
                    <div className="ai-avatar-glow"><img src={participants.find(p => p.role === 'sensei')?.avatar} alt="Sensei" /></div>
                    <div className="ai-bubble"><div className="ai-label">SENSEI:</div>"{aiSuggestion}"</div>
                </div>

                <div className="participants-grid">
                    {participants.filter(p => p.role !== 'sensei').map(p => (
                        <div key={p.id} className={`participant-card ${p.speaking ? 'speaking' : ''} ${viewingParticipant?.id === p.id ? 'being-viewed' : ''} ${p.id === 'local' ? 'is-me' : ''}`} onClick={() => setViewingParticipant(p)} style={{ cursor: 'pointer', position: 'relative' }}>
                            <div className="p-avatar">
                                <img
                                    src={p.avatar}
                                    alt={p.name}
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(p.name)}&backgroundColor=transparent`;
                                    }}
                                />
                            </div>
                            <div className="p-info">
                                <span className="p-name">
                                    {p.name}
                                    {/* Network Quality Indicator */}
                                    {p.role !== 'sensei' && (
                                        <span style={{ marginLeft: '6px', fontSize: '0.7rem' }}>
                                            {!p.networkQuality ? (
                                                <i className="fa-solid fa-spinner fa-spin" style={{ color: '#888' }} title="Đang kết nối..."></i>
                                            ) : p.networkQuality <= 2 ? (
                                                <i className="fa-solid fa-signal" style={{ color: '#4dff88' }} title="Mạng Tốt"></i>
                                            ) : p.networkQuality <= 4 ? (
                                                <i className="fa-solid fa-signal" style={{ color: 'yellow' }} title="Mạng Chập Chờn"></i>
                                            ) : (
                                                <i className="fa-solid fa-triangle-exclamation" style={{ color: 'red' }} title="Mạng Yếu/Mất Kết Nối"></i>
                                            )}
                                        </span>
                                    )}
                                </span>
                                {p.name === roomInfo?.host && <span style={{ fontSize: '0.6rem', color: '#ffd700', marginLeft: '4px' }}>(Host)</span>}
                            </div>
                            {/* HOST CONTROLS: BAN MIC BUTTON */}
                            {/* Show if I am Host AND Target is NOT Sensei */}
                            {isHost && p.role !== 'sensei' && (
                                <button
                                    className={`host-mute-btn ${mutedMap[p.id] ? 'banned' : ''}`}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        const isMe = p.role === 'me' || p.name === characterInfo.nickname;
                                        const isBanned = mutedMap[p.id];

                                        // If already banned -> Unban immediately (no confirm needed usually, or simple one)
                                        if (isBanned) {
                                            setConfirmDialog({
                                                message: `Mở khóa mic cho ${isMe ? 'bạn' : p.name}?`,
                                                onConfirm: () => muteRemoteUser(p.id, false) // Unban
                                            });
                                        } else {
                                            // Ban -> Confirm
                                            setConfirmDialog({
                                                message: isMe ? "Bạn có chắc muốn tự CẤM mic của mình? (Sẽ không thể bật lại cho đến khi mở khóa)" : `Bạn muốn CẤM mic của ${p.name}?`,
                                                onConfirm: () => muteRemoteUser(p.id, true) // Ban
                                            });
                                        }
                                    }}
                                    title={mutedMap[p.id] ? "Mở khóa mic" : "Cấm mic thành viên này"}
                                    style={{ background: mutedMap[p.id] ? '#ff4d4d' : 'rgba(0,0,0,0.6)', border: mutedMap[p.id] ? '1px solid white' : 'none' }}
                                >
                                    <i className={`fa-solid ${mutedMap[p.id] ? 'fa-lock' : 'fa-microphone-slash'}`}></i>
                                </button>
                            )}
                        </div>
                    ))}
                </div>

                <div className="hero-container" onClick={() => setViewingParticipant(null)} style={{ cursor: viewingParticipant ? 'pointer' : 'default' }}>
                    {viewingParticipant && <div style={{ position: 'absolute', top: '-30px', background: 'rgba(0,0,0,0.7)', color: '#4dff88', padding: '5px 10px', borderRadius: '20px', fontSize: '0.8rem', border: '1px solid #4dff88' }}><i className="fa-solid fa-eye"></i> Đang xem</div>}
                    <div className={`hero-model ${isSpeaking && !viewingParticipant ? 'hero-speaking' : ''}`}>
                        <img
                            src={encodeURI(displayAvatar)}
                            alt="Character"
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(displayName)}&backgroundColor=transparent`;
                            }}
                        />
                        <div className="hero-aura"></div>
                    </div>
                    <div className="hero-name-plate">
                        <span className="hero-level-badge">{displayLevel}</span>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <span className="hero-name">
                                {displayName}
                                {isHost && displayName === characterInfo.nickname && <span style={{ fontSize: '0.5rem', color: 'gold', marginLeft: '3px' }}>👑</span>}
                            </span>
                            {!viewingParticipant && <span style={{ fontSize: '0.6rem', color: '#ffd700' }}>{getRankTitle(level)}</span>}
                        </div>
                    </div>
                </div>
            </div>

            <div className="room-controls-bar glass-premium">
                <div className="room-xp-container">
                    <div className="xp-label">CÔNG LỰC ({characterInfo.totalSpeakingSeconds}s)</div>
                    <div className="xp-bar-bg"><div className="xp-bar-fill" style={{ width: `${progress}%` }}></div><div className="xp-bar-glow" style={{ left: `${progress}%` }}></div></div>
                </div>

                <div className="control-actions">
                    <button className="reaction-btn" onClick={() => handleReaction('❤️')}>❤️</button>
                    <button className="reaction-btn" onClick={() => handleReaction('😂')}>😂</button>
                    <button className={`reaction-btn ${isRaisingHand ? 'active-hand' : ''}`} onClick={handleRaiseHand} style={{ border: isRaisingHand ? '2px solid gold' : 'none' }}>✋</button>

                    {/* Main Mic Button - Locked if Banned */}
                    <button
                        className={`main-mic-btn ${micOn ? 'active' : ''} ${isLocalMuted ? 'banned-local' : ''}`}
                        onClick={() => {
                            if (isLocalMuted) {
                                // Shake or notify
                                const btn = document.querySelector('.main-mic-btn');
                                btn?.classList.add('shake');
                                setTimeout(() => btn?.classList.remove('shake'), 500);
                                return; // Prevent toggle
                            }
                            toggleMic();
                        }}
                        style={{ position: 'relative', opacity: isLocalMuted ? 0.7 : 1, cursor: isLocalMuted ? 'not-allowed' : 'pointer', background: isLocalMuted ? '#333' : '' }}
                    >
                        {isLocalMuted ? (
                            <i className="fa-solid fa-lock" style={{ color: '#ff4d4d' }}></i>
                        ) : (
                            <i className={`fa-solid ${micOn ? 'fa-microphone' : 'fa-microphone-slash'}`}></i>
                        )}
                        {isLocalMuted && <span style={{ position: 'absolute', top: '-10px', right: '-10px', fontSize: '0.6rem', background: 'red', color: 'white', padding: '2px 4px', borderRadius: '4px' }}>CẤM</span>}
                    </button>

                    <button className="hangup-btn" onClick={onLeave}><i className="fa-solid fa-phone-slash"></i></button>
                </div>
            </div>

            <GlobalChat roomId={roomInfo?.id || 'demo'} title="PHÒNG LUẬN ĐẠO" />
        </div>
    );
}



// --- AGORA MANAGER ---
function TrainingRoomAgoraManager(props) {
    const { roomInfo, onGainXP, updateSpeakingTime, setMuted, characterInfo, userAvatar, isHost } = props;
    const roomId = roomInfo?.id || 'demo_room';

    // Agora State Hooks
    const connectionState = useConnectionState();
    const client = useRTCClient();

    // Generate a unique numeric UID based on user ID or random for guest used for Agora (INT)
    // Supabase uses UUID (String), Agora often prefers INT UIDs for simplicity in some SDKs, but String UIDs work too.
    // The RtcTokenBuilder we use requires a numeric UID (0 for auto-assign but then we can't map reliably without extra work)
    // Or we can use 0 and let Agora assign, but we need to know "who is who".
    // For MVP transparency: let's generate a random 32-bit int for the session.
    // Generate a unique numeric UID constrained to [1, 65000] to satisfy Agora's 16-bit limit for data channels
    const [localUid] = useState(() => Math.floor(Math.random() * 65000) + 1);

    // Token Logic:
    // 1. Try VITE_AGORA_TEMP_TOKEN (for quick manual test)
    // 2. Try generating on client (for MVP without backend)
    const [token, setToken] = useState(import.meta.env.VITE_AGORA_TEMP_TOKEN || null);

    const [usersMap, setUsersMap] = useState({}); // Stores synced user data: { [uid]: { name, avatar } }

    // --- AUDIO OBJECTS ---
    const raiseHandSound = useMemo(() => {
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3');
        audio.volume = 0.5;
        return audio;
    }, []);

    // --- FIREBASE USER SYNC ---
    // 1. Register my identity
    useEffect(() => {
        if (!roomId || !localUid) return;

        const userRef = ref(db, `rooms/${roomId}/users/${localUid}`);
        const userData = {
            name: characterInfo.nickname,
            avatar: userAvatar,
            role: 'student' // Could be 'host' if matched
        };

        // Write data
        set(userRef, userData);

        // Auto-remove on disconnect/close
        onDisconnect(userRef).remove();

        // Cleanup on unmount (manual leave)
        return () => {
            remove(userRef);
            onDisconnect(userRef).cancel();
        };
    }, [roomId, localUid, characterInfo.nickname, userAvatar]);

    // 2. Listen for other users
    useEffect(() => {
        if (!roomId) return;
        const usersRef = ref(db, `rooms/${roomId}/users`);

        const unsubscribe = onValue(usersRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                setUsersMap(data);
            } else {
                setUsersMap({});
            }
        });

        return () => off(usersRef);
    }, [roomId]);

    useEffect(() => {
        if (!token) {
            // Generate Client-Side Token (MVP ONLY - Insecure but functional)
            // Function handles checking for App ID / Certificate internally
            try {
                const generatedToken = generateAgoraToken(String(roomId), localUid);
                if (generatedToken) {
                    console.log("🔐 Generated Agora Token for MVP:", generatedToken);
                    setToken(generatedToken);
                }
            } catch (e) {
                console.error("Failed to generate Agora token:", e);
            }
        }
    }, [roomId, localUid, token]);

    // Agora Hooks
    // Only join if we have a token (or if App ID Only mode is used and token stays null)
    // If Certificate is set in .env, generateAgoraToken should have returned a token.
    useJoin({
        appid: AGORA_APP_ID,
        channel: String(roomId),
        token: token,
        uid: localUid,
    }, !!token || !import.meta.env.VITE_AGORA_CERTIFICATE);

    // Mic State
    const [micOn, setMicOn] = useState(false);

    // MANUAL TRACK CREATION (Bypassing hook to ensure valid SDK object)
    const [localMicTrack, setLocalMicTrack] = useState(null);

    useEffect(() => {
        let track = null;
        let isMounted = true;

        if (micOn) {
            const initTrack = async () => {
                try {
                    track = await AgoraRTC.createMicrophoneAudioTrack();
                    if (isMounted) setLocalMicTrack(track);
                } catch (e) {
                    console.error("Failed to create mic track:", e);
                    if (isMounted) setMicOn(false); // Reset if failed
                }
            };
            initTrack();
        } else {
            setLocalMicTrack(null);
        }

        return () => {
            isMounted = false;
            if (track) {
                track.close();
            }
        };
    }, [micOn]);

    // Only publish when Connected AND Track is ready
    // const canPublish = micOn && !!localMicrophoneTrack && connectionState === 'CONNECTED';
    // usePublish(tracksToPublish, canPublish);

    // MANUAL PUBLISH LOGIC
    useEffect(() => {
        if (!client || !localMicTrack || !micOn || connectionState !== 'CONNECTED') return;

        console.log("🎙️ Manually publishing microphone track ID:", localMicTrack.getTrackId());

        let isMounted = true;
        const pub = async () => {
            try {
                await client.publish([localMicTrack]);
            } catch (e) {
                if (isMounted) console.error("Manual publish failed:", e);
            }
        };
        pub();

        return () => {
            isMounted = false;
            if (client && localMicTrack) {
                console.log("🛑 Unpublishing microphone track");
                client.unpublish([localMicTrack]).catch(e => console.warn("Unpublish error", e));
            }
        };
    }, [client, localMicTrack, micOn, connectionState]);

    // Remote
    const remoteUsers = useRemoteUsers();
    const { audioTracks } = useRemoteAudioTracks(remoteUsers);

    // --- REMOTE AUDIO PLAYBACK ---
    useEffect(() => {
        audioTracks.forEach(track => {
            if (!track.isPlaying) {
                console.log(`🔊 Playing remote audio track for user: ${track.getUserId()}`);
                track.play();
            }
        });
    }, [audioTracks]);

    // Cleanup remote tracks on unmount
    useEffect(() => {
        return () => {
            // localMicTrack is handled in its own useEffect cleanup
            audioTracks.forEach(track => track.stop());
        };
    }, []);

    // --- REACTION & HAND RAISE SOUND ---
    useEffect(() => {
        if (!roomId || !isHost) return;
        const handRaiseRef = ref(db, `rooms/${roomId}/handRaise`);

        const unsubscribe = onValue(handRaiseRef, (snapshot) => {
            const data = snapshot.val() || {};
            // If someone just raised their hand (wasn't raising before)
            const raisingCount = Object.values(data).filter(v => v === true).length;
            if (raisingCount > 0) {
                raiseHandSound.play().catch(e => console.log("Sound play blocked by browser", e));
            }
        });
        return () => off(handRaiseRef);
    }, [roomId, isHost, raiseHandSound]);

    // Speaking Timer
    const timerRef = useRef(null);
    useEffect(() => {
        if (micOn && localMicTrack) {
            timerRef.current = setInterval(() => {
                onGainXP(1);
                updateSpeakingTime(1);
            }, 1000);
        } else {
            clearInterval(timerRef.current);
        }
        return () => clearInterval(timerRef.current);
    }, [micOn, localMicTrack]);

    // --- STORE ACTIONS ---
    const leaveRoomAction = useGameStore(state => state.leaveRoom);

    // Wrapper for Leave Logic
    const handleLeave = async () => {
        try {
            // Calculate current participants (me + remotes)
            const currentCount = 1 + remoteUsers.length;
            // Fire and forget or quick await
            leaveRoomAction(roomId, currentCount).catch(err => console.error("Leave room API error:", err));
        } finally {
            // ALWAYS navigate back immediately for better UX
            props.onLeave();
        }
    };

    // --- REMOTE MUTE LISTENER ---
    // Local Notification State
    const [notification, setNotification] = useState(null);

    // --- REMOTE MUTE LISTENER ---
    // --- HOST BAN MIC LOGIC ---
    // Tracks who is explicitly banned/muted by host
    const [mutedMap, setMutedMap] = useState({});

    // Check if I am banned
    const isLocalMuted = mutedMap[localUid] === true;

    // Listen to ALL mute controls (for Host UI and Self Enforcement)
    useEffect(() => {
        if (!roomId) return;
        const allMuteRef = ref(db, `rooms/${roomId}/controls/mute`);

        const unsubscribe = onValue(allMuteRef, (snapshot) => {
            const data = snapshot.val() || {};
            setMutedMap(data);
        });
        return () => off(allMuteRef);
    }, [roomId]);

    // Enforce Mute on Self
    useEffect(() => {
        if (isLocalMuted && micOn) {
            console.log("🚫 Enforcing Ban Mic");
            setMicOn(false);
            setNotification("🚫 Bạn đã bị CẤM MIC bởi Chủ phòng!");
            setTimeout(() => setNotification(null), 3000);
        }
    }, [isLocalMuted, micOn]);


    const muteRemoteUser = (targetUid, shouldMute = true) => {
        if (!roomId) return;
        if (shouldMute) {
            set(ref(db, `rooms/${roomId}/controls/mute/${targetUid}`), true);
        } else {
            remove(ref(db, `rooms/${roomId}/controls/mute/${targetUid}`));
        }
    };

    // --- AUTO-END TIMEOUT (30 MINS) ---
    const inactivityTimerRef = useRef(null);
    const INACTIVITY_LIMIT = 30 * 60 * 1000; // 30 minutes in ms

    useEffect(() => {
        // Clear existing timer
        if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);

        // Conditions to Start Timer:
        // 1. Only me in room (remoteUsers.length === 0)
        // 2. Mic is OFF (!micOn)
        // If someone joins OR mic is on, timer is cancelled/reset.

        const isSolo = remoteUsers.length === 0;

        if (isSolo && !micOn) {
            console.log("⏳ Solo & Silent: Auto-end timer started (30 mins)");
            inactivityTimerRef.current = setTimeout(() => {
                console.warn("⏰ Inactivity Timeout: Room auto-closing.");
                alert("Phòng đã tự động đóng do không có hoạt động trong 30 phút.");
                handleLeave();
            }, INACTIVITY_LIMIT);
        } else {
            console.log("✅ Activity detected (Peer joined or Mic On). Timer reset.");
        }

        return () => clearTimeout(inactivityTimerRef.current);
    }, [micOn, remoteUsers.length, handleLeave]); // Re-run when mic toggles or users change

    // Agora State (Moved up)
    // const connectionState = useConnectionState();
    // const client = useRTCClient();

    // --- VOLUME & NETWORK MONITORING ---
    const [volumeMap, setVolumeMap] = useState({});
    const [networkMap, setNetworkMap] = useState({});

    useEffect(() => {
        if (!client || typeof client.enableAudioVolumeIndication !== 'function') return;

        // Force disable on mount to ensure no ghost data channels exist from previous sessions
        try {
            client.enableAudioVolumeIndication(-1);
        } catch (e) {
            console.warn("Error disabling volume indication on mount:", e);
        }

        // Event Handlers
        const handleVolumeIndicator = (volumes) => {
            const newVolumeMap = {};
            volumes.forEach((v) => {
                // v.uid is 0 for local user in some versions, but useRTCClient usually maps it
                const uid = v.uid === 0 ? localUid : v.uid;
                newVolumeMap[uid] = v.level;
            });
            // Merge with existing to prevent flicker if inconsistent
            setVolumeMap(prev => ({ ...prev, ...newVolumeMap }));
        };

        const handleNetworkQuality = (stats) => {
            // stats: { downlinkNetworkQuality, uplinkNetworkQuality }
            // 0: unknown, 1: excellent, 2: good, 3: poor, 4: bad, 5: very bad, 6: down
            // We care about local quality here primarily, but this event is for LOCAL user
            setNetworkMap(prev => ({ ...prev, [localUid]: stats.downlinkNetworkQuality }));
        };

        // Remote Network Quality
        const handleRemoteNetworkQuality = (evt) => {
            // evt: { uid, downlinkNetworkQuality, uplinkNetworkQuality }
            setNetworkMap(prev => ({ ...prev, [evt.uid]: evt.downlinkNetworkQuality }));
        }

        // --- SUBSCRIBE EVENTS ---
        client.on("volume-indicator", handleVolumeIndicator);
        client.on("network-quality", handleNetworkQuality); // Local quality
        client.on("user-network-quality", handleRemoteNetworkQuality); // Remote quality (deprecated in v4? No, exists)

        return () => {
            // Disable volume indication on unmount or cleanup to remove any potential data channels
            try {
                if (typeof client.enableAudioVolumeIndication === 'function') {
                    client.enableAudioVolumeIndication(-1); // Interval <= 0 disables it
                }
            } catch (e) {
                console.warn("Failed to disable volume indication", e);
            }

            client.off("volume-indicator", handleVolumeIndicator);
            client.off("network-quality", handleNetworkQuality);
            client.off("user-network-quality", handleRemoteNetworkQuality);
        };
    }, [client, localUid]);

    // Construct Participants List
    // Use UI Avatars for consistent placeholders until local assets are restored
    const aiParticipant = {
        id: 'ai',
        name: 'Lisa AI',
        avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Lisa&backgroundColor=transparent',
        speaking: false,
        role: 'sensei'
    };

    // Threshold for speaking visual
    const SPEAKING_THRESHOLD = 30;

    // Update Local Participant
    const localParticipant = {
        id: localUid,
        name: characterInfo.nickname,
        avatar: userAvatar,
        speaking: (volumeMap[localUid] || 0) > SPEAKING_THRESHOLD, // Use real volume
        role: 'me',
        networkQuality: networkMap[localUid] || 0
    };

    // Merge Remote Agora Users with Firebase Data
    const remoteParticipants = remoteUsers.map(u => {
        // Try to find user data in our synced map
        const syncedUser = usersMap[u.uid];
        return {
            id: u.uid,
            name: syncedUser?.name || `Tu Luyện Giả ${String(u.uid).slice(-4)}`,
            avatar: syncedUser?.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${u.uid}&backgroundColor=transparent`,
            speaking: (volumeMap[u.uid] || 0) > SPEAKING_THRESHOLD, // Use real volume
            role: 'remote',
            networkQuality: networkMap[u.uid] || 0
        };
    });

    // Merge for UI
    const allParticipants = [aiParticipant, localParticipant, ...remoteParticipants];

    // Agora State
    // const connectionState = useConnectionState(); // Already declared above

    const uiProps = {
        ...props,
        participants: allParticipants,
        toggleMic: () => setMicOn(!micOn),
        micOn,
        isSpeaking: micOn || remoteUsers.some(u => u.hasAudio),
        onLeave: handleLeave, // Pass updated handler
        roomInfo,
        muteRemoteUser, // New action
        isHost: props.isHost, // Pass isHost from props
        notification, // Local notifications
        mutedMap, // Who is banned
        isLocalMuted, // Am I banned?
        connectionState, // Debug info
        remoteUsers // For debug
    };

    return <TrainingRoomUI {...uiProps} />;
}

// --- NO AGORA MANAGER (FALLBACK) ---
function TrainingRoomFallbackManager(props) {
    const { onGainXP, updateSpeakingTime, setMuted, characterInfo, userAvatar } = props;
    const [micOn, setMicOn] = useState(false);
    const timerRef = useRef(null);

    // Fake Speaking Timer
    useEffect(() => {
        if (micOn) {
            timerRef.current = setInterval(() => {
                onGainXP(1);
                updateSpeakingTime(1);
            }, 1000);
        } else {
            clearInterval(timerRef.current);
        }
        return () => clearInterval(timerRef.current);
    }, [micOn]);

    const participants = [
        { id: 'ai', name: 'AI Sensei', avatar: 'https://cdn-icons-png.flaticon.com/512/4712/4712027.png', speaking: false, role: 'sensei' },
        { id: 'local', name: characterInfo.nickname, avatar: userAvatar, speaking: micOn, role: 'me' }
    ];

    const toggleMic = () => {
        setMicOn(!micOn);
        setMuted(micOn);
    };

    return (
        <TrainingRoomUI
            {...props}
            participants={participants}
            micOn={micOn}
            toggleMic={toggleMic}
            isSpeaking={micOn}
        />
    );
}

// --- MAIN CONTAINER ---
export default function TrainingRoom(props) {
    // Shared Logic (Firebase, Game Loop)
    const { characterInfo, updateSpeakingTime, setMuted } = useGameStore(state => state);
    const [currentUserId, setCurrentUserId] = useState(null);

    // --- AVATAR PATH RESOLUTION ---
    const getAvatarPath = (tribe, char, stage = 1) => {
        if (!tribe || !char) return null;

        const t = tribe.toUpperCase();
        const c = char.toUpperCase(); // Normalize for check
        const s = stage;

        // 1. COREFIRE
        if (t === 'COREFIRE') {
            if (c === 'SPARKY') return `/assets/Tribe 1 - COREFIRE/tribe 1 - character/Sparky/Sparky ${s}.png`;
            const charName = char.charAt(0).toUpperCase() + char.slice(1).toLowerCase();
            return `/assets/Tribe 1 - COREFIRE/tribe 1 - character/${charName}/${charName} ${s}.png`;
        }

        // 2. BEAMJOY
        if (t === 'BEAMJOY') {
            const baseUrl = '/assets/Tribe 1  - BEAMJOY/Tribe 1 - Character';
            if (c === 'MYRA') return `${baseUrl}/MYRA/NAM LV ${s}.png`;
            if (c === 'FLORA') return `${baseUrl}/Flora/0702_Lisa Task_Flora ${s}_ThanhTâm.png`;
            if (c === 'LIBANA') return `${baseUrl}/Libana/Cấp ${s}.png`;
        }

        // 3. MINDORA
        if (t === 'MINDORA') {
            const baseUrl = '/assets/Tribe 1 - MINDORA/tribe 1 - character';
            if (c === 'ACTA') return `${baseUrl}/ACTA/Nhân vật/LISA TASK_Bạch tuộc_lv${s}.png`;
            if (c === 'CORALIE STARBELL' || c.includes('CORALIE')) {
                const file = s === 3 ? 'x1.png' : (s === 2 ? 'f2.png' : 'f1.png');
                return `${baseUrl}/Coralie Starbell/Nhân Vật/${file}`;
            }
            if (c === 'MEL') {
                const file = s === 3 ? 'Mel3.png' : `Mel ${s}.png`;
                return `${baseUrl}/Mel/${file}`;
            }
        }

        // 4. THAROK
        if (t === 'THAROK') {
            const baseUrl = '/assets/Tribe 1 - THAROK/Tribe 1- Character';
            if (c === 'FORGE') {
                const fileNum = s === 1 ? '03' : (s === 2 ? '04' : '05');
                return `${baseUrl}/FORGE/Nhân vật/LISA TASK_Khỉ-${fileNum}.png`;
            }
            if (c === 'KING') return `${baseUrl}/King/King ${s}.png`;
            if (c === 'TATO') return `${baseUrl}/TATO/TATO LV ${s}.png`;
        }

        return null;
    };

    // Construct correct user avatar path
    const userAvatar = getAvatarPath(characterInfo.tribe, characterInfo.character, characterInfo.evolutionStage);



    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => {
            if (data?.user) setCurrentUserId(data.user.id);
        });
    }, []);

    // ... (rest of logic like vocab, peek, etc.) ...

    // Check if current user is Host
    // Using host_id from DB vs current user ID
    const isHost = props.roomInfo?.host_id === currentUserId;

    // ... (rest of props) ...


    const [aiSuggestion, setAiSuggestion] = useState(`Topics on ${props.roomInfo?.topic || 'General Info'}`);
    const [floatingWord, setFloatingWord] = useState(null);
    const [reactions, setReactions] = useState([]);
    const [peekingChar, setPeekingChar] = useState(null);
    const [isRaisingHand, setIsRaisingHand] = useState(false);

    const roomId = props.roomInfo?.id || 'demo_room';

    // Vocab Cycle
    useEffect(() => {
        let vocabList = [];
        if (props.roomInfo && props.roomInfo.topic) {
            const allLessons = Object.values(STAGE_CONTENT).flatMap(stage => stage.lessons || []);
            const foundLesson = allLessons.find(l => l.title === props.roomInfo.topic);
            if (foundLesson) vocabList = foundLesson.vocab;
        }
        if (!vocabList || vocabList.length === 0) {
            vocabList = props.level < 30 ? MOCK_VOCAB.beginner : props.level < 60 ? MOCK_VOCAB.intermediate : MOCK_VOCAB.advanced;
        }
        const showWord = () => {
            const word = vocabList[Math.floor(Math.random() * vocabList.length)];
            setFloatingWord(word);
            setTimeout(() => setFloatingWord(null), 10000);
        };
        const interval = setInterval(showWord, 60000);
        const to = setTimeout(showWord, 5000);
        return () => { clearInterval(interval); clearTimeout(to); };
    }, [props.level]);

    // Firebase Reactions
    useEffect(() => {
        const reactionsRef = ref(db, `rooms/${roomId}/reactions`);
        const unsubscribe = onChildAdded(reactionsRef, (snapshot) => {
            const data = snapshot.val();
            // Firebase stores reaction type/emoji in 'type' field, not 'emoji'
            if (data && (Date.now() - data.timestamp < 5000)) {
                addVisualReaction(data.type, data.sender);
            }
        });

        // Peek
        const PEEK_MIN = 10000;
        let peekTO;
        const triggerPeek = () => {
            const randomTribe = tribes[Math.floor(Math.random() * tribes.length)];
            if (!randomTribe?.characters?.length) return;
            const randomChar = randomTribe.characters[Math.floor(Math.random() * randomTribe.characters.length)];
            const randomEvo = randomChar.evolutions[Math.floor(Math.random() * randomChar.evolutions.length)];
            const side = Math.random() > 0.5 ? 'left' : 'right';
            setPeekingChar({ image: randomEvo, side: side, id: Date.now(), onComplete: () => setPeekingChar(null) });
            peekTO = setTimeout(triggerPeek, Math.random() * 20000 + PEEK_MIN);
        };
        peekTO = setTimeout(triggerPeek, PEEK_MIN);

        return () => { off(reactionsRef); clearTimeout(peekTO); };
    }, [roomId]);

    const addVisualReaction = (emoji, sender) => {
        const id = Date.now() + Math.random();
        setReactions(prev => [...prev, { id, emoji, sender, x: Math.random() * 80 + 10 }]);
        setTimeout(() => setReactions(prev => prev.filter(r => r.id !== id)), 3000);
    };

    const handleReaction = (emoji) => {
        addVisualReaction(emoji, 'You');
        sendReaction(roomId, emoji, characterInfo.nickname || 'Guest');
    };

    const handleRaiseHand = () => {
        setIsRaisingHand(!isRaisingHand);
        toggleRaiseHand(roomId, characterInfo.nickname, characterInfo.nickname, !isRaisingHand);
        if (!isRaisingHand) handleReaction('✋');
    };





    const sharedProps = {
        ...props,
        characterInfo, updateSpeakingTime, setMuted,
        floatingWord, peekingChar, reactions, aiSuggestion, isRaisingHand,
        handleReaction, handleRaiseHand,
        userAvatar,
        isHost // Pass correct host status
    };

    // Create a local client instance to ensure fresh state on mount (fixes HMR stale data channel issues)
    const client = useMemo(() => AgoraRTC.createClient({ mode: "rtc", codec: "vp8" }), []);

    if (AGORA_APP_ID) {
        return (
            <AgoraRTCProvider client={client}>
                <TrainingRoomAgoraManager {...sharedProps} />
            </AgoraRTCProvider>
        );
    } else {
        return <TrainingRoomFallbackManager {...sharedProps} />;
    }
}
