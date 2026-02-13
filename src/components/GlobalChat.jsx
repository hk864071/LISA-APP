
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './GlobalChat.css';
import useGameStore from '../store/useGameStore';
import { sendGlobalChatMessage, sendRoomChatMessage, db } from '../lib/firebaseClient';
import { ref, onValue, off, limitToLast, query } from 'firebase/database';

function GlobalChat({ roomId = null, title = null }) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [warningMsg, setWarningMsg] = useState(null);
    const [muteUntil, setMuteUntil] = useState(0); // Timestamp for mute end

    // Refs
    const lastSentTimes = useRef([]);
    const chatBodyRef = useRef(null);
    const isSendingRef = useRef(false);

    // Store
    const { characterInfo } = useGameStore((state) => state);
    const senderName = characterInfo.nickname || 'Khách';
    const senderAvatar = 'https://cdn-icons-png.flaticon.com/512/1077/1077114.png';

    const chatTitle = title || (roomId ? 'PHÒNG LUẬN ĐẠO' : 'KÊNH THẾ GIỚI');
    const dbPath = roomId ? `rooms/${roomId}/messages` : 'global_chat/messages';

    // Rate Limit Config
    const MSG_LIMIT = 5;
    const TIME_WINDOW = 5000;
    const PENALTY_DURATION = 60000; // 1 minute

    // Check Mute Timer
    useEffect(() => {
        let interval;
        if (muteUntil > Date.now()) {
            interval = setInterval(() => {
                if (Date.now() >= muteUntil) {
                    setMuteUntil(0);
                    setWarningMsg(null); // Clear warning to show "Unmuted"
                } else {
                    // Update countdown visually if needed, or just force re-renders
                    // We can force update via a dummy state or just rely on 'isMuted' calc in render
                    // setWarningMsg is updated on Trigger, so visual update happens
                }
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [muteUntil]);

    // Listen for Messages
    useEffect(() => {
        const chatRef = query(ref(db, dbPath), limitToLast(50));

        const unsubscribe = onValue(chatRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const msgList = Object.entries(data)
                    .map(([key, val]) => ({ id: key, ...val }))
                    .sort((a, b) => a.timestamp - b.timestamp);

                setMessages(msgList);
                setTimeout(() => {
                    if (chatBodyRef.current) {
                        chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
                    }
                }, 100);
            } else {
                setMessages([]);
            }
        });

        return () => unsubscribe();
    }, [roomId, dbPath]);

    const handleSend = async (e) => {
        if (e) e.preventDefault();

        if (!inputValue.trim()) return;
        if (isSendingRef.current) return;

        // Check Mute Status
        if (Date.now() < muteUntil) {
            const secondsLeft = Math.ceil((muteUntil - Date.now()) / 1000);
            triggerWarning(`⛔ Bạn đang bị khóa chat! Còn ${secondsLeft}s`);
            return;
        }

        // Rate Limit Check
        const now = Date.now();
        lastSentTimes.current = lastSentTimes.current.filter(t => now - t < TIME_WINDOW);

        if (lastSentTimes.current.length >= MSG_LIMIT) {
            const muteEndTime = now + PENALTY_DURATION;
            setMuteUntil(muteEndTime);
            triggerWarning(`🚫 Spam phát hiện! Bạn bị cấm chat 1 PHÚT.`);
            return;
        }

        isSendingRef.current = true;

        try {
            if (roomId) {
                await sendRoomChatMessage(roomId, senderName, inputValue.trim(), senderAvatar);
            } else {
                await sendGlobalChatMessage(senderName, inputValue.trim(), senderAvatar);
            }

            lastSentTimes.current.push(now);
            setInputValue('');
        } catch (error) {
            console.error("Chat Error:", error);
            triggerWarning("❌ Lỗi: " + error.message);
        } finally {
            setTimeout(() => {
                isSendingRef.current = false;
            }, 500);
        }
    };

    const triggerWarning = (msg) => {
        setWarningMsg(msg);
        setTimeout(() => setWarningMsg(null), 4000);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSend();
        }
    }

    const isMuted = Date.now() < muteUntil;

    return (
        <motion.div
            className={`global-chat-container ${!isExpanded ? 'minimized' : ''}`}
            animate={{
                height: isExpanded ? 480 : 50,
                width: isExpanded ? 350 : 200,
                y: isExpanded ? 0 : 0
            }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
            <div className="chat-header glass-premium-dark" onClick={() => setIsExpanded(!isExpanded)}>
                <div className="chat-title-row">
                    <div className={`status-dot ${isMuted ? 'muted' : ''}`} style={{ background: isMuted ? '#ff0000' : '#4dff88' }}></div>
                    <span className="chat-title-text">{chatTitle}</span>
                </div>
                <div className="chat-toggle-icon">
                    <i className={`fa-solid ${isExpanded ? 'fa-minus' : 'fa-chevron-up'}`}></i>
                </div>
            </div>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        className="chat-content-wrapper"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <div className="chat-body custom-scrollbar" ref={chatBodyRef}>
                            {messages.length === 0 && (
                                <div className="empty-chat-state">
                                    <i className="fa-solid fa-wind"></i>
                                    <span>Chưa có ai luận đàm...</span>
                                </div>
                            )}

                            {messages.map((msg) => (
                                <motion.div
                                    key={msg.id}
                                    className={`chat-row ${msg.sender === senderName ? 'me' : 'them'}`}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                >
                                    {msg.sender !== senderName && (
                                        <div className="avatar-circle">
                                            {msg.sender[0]?.toUpperCase()}
                                        </div>
                                    )}
                                    <div className="chat-bubble">
                                        {msg.sender !== senderName && <div className="sender-label">{msg.sender}</div>}
                                        <div className="message-text">{msg.message}</div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* WARNING MSG DISPLAY */}
                        <AnimatePresence>
                            {(warningMsg || isMuted) && (
                                <motion.div
                                    className="gaming-toast"
                                    initial={{ x: "-50%", y: 20, opacity: 0, scale: 0.9 }}
                                    animate={{ x: "-50%", y: 0, opacity: 1, scale: 1 }}
                                    exit={{ x: "-50%", y: 20, opacity: 0, scale: 0.9 }}
                                    style={{ bottom: '70px' }}
                                >
                                    {warningMsg || `⛔ Đang bị cấm ngôn...`}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="chat-input-row">
                            <input
                                type="text"
                                className="chat-input-gaming"
                                placeholder={isMuted ? "Đang bị khóa mõm..." : "Nhập tin nhắn..."}
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={handleKeyDown}
                                disabled={isMuted} // Disable input while muted
                                style={{ opacity: isMuted ? 0.5 : 1, cursor: isMuted ? 'not-allowed' : 'text' }}
                            />
                            <button className="send-btn-gaming" onClick={handleSend} disabled={isMuted} style={{ opacity: isMuted ? 0.5 : 1 }}>
                                <i className="fa-solid fa-paper-plane"></i>
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

export default GlobalChat;
