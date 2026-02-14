
import React, { useState, useEffect } from 'react';
import useGameStore from '../store/useGameStore';
import { motion, AnimatePresence } from 'framer-motion';
import './RoomList.css';
import './RoomListPremium.css';
import { STAGE_CONTENT, canAccessStage } from '../data/stageContent';

function RoomList({ level, onJoinRoom, onCreateRoom, onBack }) {
    const [searchTerm, setSearchTerm] = useState('');
    const { rooms, fetchRooms, createRoom, subscribeToRooms, isLoadingRooms } = useGameStore(state => state);

    useEffect(() => {
        fetchRooms();
        // Subscribe to Realtime updates
        const unsubscribe = subscribeToRooms();
        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, []);

    // Modal state for creating room
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [step, setStep] = useState(1);
    const [newRoomConfig, setNewRoomConfig] = useState({ name: '', topic: 'General Conversation', level: 'Beginner', mapId: undefined });

    const availableMaps = [
        { name: "Thư Viện Cổ", img: "/assets/Tribe 1 - MINDORA/Tribe 1 - Background/Bg Mindora (1).png" },
        { name: "Sàn Thi Đấu", img: "/assets/Tribe 1 - COREFIRE/Tribe 1 - Background/IMG_7061.JPG" },
        { name: "Rừng Trúc", img: "/assets/Tribe 1 - THAROK/Tribe 1 - THAROK Background/624126104_1543806710068145_3238655200353009991_n.jpg" },
        { name: "Hồ Sen", img: "/assets/Tribe 1  - BEAMJOY/Tribe 1 - Background/bg beamjoy.png" }
    ];

    const handleCreateSubmit = async (e) => {
        e.preventDefault();
        const config = {
            name: newRoomConfig.name || 'Võ Đường Mới',
            topic: newRoomConfig.topic || 'General',
            level: newRoomConfig.level,
            background: availableMaps[newRoomConfig.mapId]?.img || availableMaps[0].img
        };

        const createdRoom = await createRoom(config.name, config.topic, config.level, config.background);

        if (createdRoom) {
            setShowCreateModal(false);
            // Transform for UI (TrainingRoom expects specific props)
            const roomUI = {
                id: createdRoom.room_id,
                name: createdRoom.name,
                host: 'You', // Since we created it
                level: config.level,
                topic: createdRoom.topic,
                participants: 1,
                max: createdRoom.max_participants || 5,
                background: createdRoom.background_image
            };
            onJoinRoom(roomUI);
        } else {
            alert("Không thể lập đàn (Create Failed). Vui lòng thử lại!");
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1
        }
    };

    const filteredRooms = rooms.filter(r => {
        if (!r.name) return false; // Skip rooms without names
        return r.name.toLowerCase().includes(searchTerm.toLowerCase());
    });

    // Force re-render animation when data changes
    const hasRooms = filteredRooms.length > 0;

    console.log('🖼️ Rendering RoomList with:', filteredRooms.length, 'rooms');

    return (
        <div className="room-list-container">
            {/* Header */}
            <div className="dojo-header">
                <button onClick={onBack} className="back-btn">
                    <i className="fa-solid fa-arrow-left"></i> QUAY LẠI
                </button>
                <h1 className="dojo-title">SẢNH TU LUYỆN</h1>
                <div className="header-spacer"></div>
            </div>

            {/* Controls */}
            <div className="control-bar">
                <div className="search-input-wrapper">
                    <i className="fa-solid fa-magnifying-glass"></i>
                    <input
                        type="text"
                        placeholder="Tìm kiếm võ đường..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                </div>
                <button
                    className="create-btn"
                    onClick={() => setShowCreateModal(true)}
                >
                    <i className="fa-solid fa-plus"></i> LẬP ĐÀN
                </button>
            </div>

            {/* Room Grid with Animation */}
            {/* Key added to force re-mount animation when data arrives */}
            <motion.div
                key={filteredRooms.length}
                className="room-grid"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {isLoadingRooms && !hasRooms ? (
                    <div style={{ textAlign: 'center', width: '100%', padding: '3rem', color: '#888', gridColumn: '1 / -1' }}>
                        <i className="fa-solid fa-circle-notch fa-spin" style={{ fontSize: '3rem', marginBottom: '1rem', color: 'var(--gold)' }}></i>
                        <p>Đang dò tìm tín hiệu...</p>
                    </div>
                ) : !hasRooms ? (
                    <div style={{ textAlign: 'center', width: '100%', padding: '3rem', color: '#666', gridColumn: '1 / -1' }}>
                        <i className="fa-solid fa-ghost" style={{ fontSize: '3rem', marginBottom: '1rem', display: 'block' }}></i>
                        {searchTerm ? 'Không tìm thấy phòng phù hợp...' : 'Chưa có võ đường nào được mở...'}
                    </div>
                ) : (
                    filteredRooms.map(room => {
                        // FIX DISPLAY FOR BROKEN JSON NAMES (Legacy Data)
                        let displayName = room.name;
                        let displayTopic = room.topic;
                        let displayLevel = room.level || (room.current_level === 3 ? 'Advanced' : (room.current_level === 2 ? 'Intermediate' : 'Beginner'));
                        let displayBg = room.background_image;

                        if (typeof room.name === 'string' && room.name.startsWith('{')) {
                            try {
                                const parsed = JSON.parse(room.name);
                                displayName = parsed.name || 'Room Lỗi Tên';
                                displayTopic = parsed.topic || displayTopic;
                                displayLevel = parsed.level || displayLevel;
                                displayBg = parsed.background || displayBg;
                            } catch (e) {
                                console.error('Error parsing room name JSON', e);
                            }
                        }

                        // Normalize DB fields for UI
                        const participants = room.current_participants || room.participants || 1;
                        const max = room.max || room.max_participants || 5;
                        const isFull = participants >= max;
                        const host = room.host || 'Ẩn Danh'; // Note: 'host' column might be empty now, logic might need 'host_name' if added later

                        // Use extracted values
                        const level = displayLevel;
                        const topic = displayTopic;
                        const name = displayName;

                        return (
                            <motion.div
                                key={room.id || room.room_id}
                                className="room-card-premium"
                                variants={itemVariants}
                                whileHover={{ scale: 1.03 }}
                            >
                                <div className="room-header-card">
                                    <span className={`room-status-badge ${isFull ? 'full' : 'available'}`}>
                                        {isFull ? 'ĐẦY' : 'SẴN SÀNG'}
                                    </span>
                                    <div className="room-level-badge">
                                        {level === 'Beginner' && <i className="fa-solid fa-seedling"></i>}
                                        {level === 'Intermediate' && <i className="fa-solid fa-shield-halved"></i>}
                                        {level === 'Advanced' && <i className="fa-solid fa-dragon"></i>}
                                    </div>
                                </div>

                                <div>
                                    <h3 className="room-name">{name}</h3>
                                    <div className="room-topic">
                                        <i className="fa-solid fa-scroll"></i> {topic}
                                    </div>
                                    <div style={{ fontSize: '0.8rem', color: '#666', marginBottom: '0.5rem' }}>
                                        Host: <span style={{ color: '#aaa', fontWeight: 'bold' }}>{host}</span>
                                    </div>
                                </div>

                                <div className="room-footer">
                                    <div className="room-users">
                                        <i className="fa-solid fa-user-group"></i> {participants}/{max}
                                    </div>
                                    <button
                                        className="join-btn"
                                        onClick={() => onJoinRoom({
                                            ...room,
                                            id: room.id || room.room_id,
                                            name: name, // Use cleansed name
                                            topic: topic, // Use cleansed topic
                                            level: level, // Use cleansed level
                                            participants: participants,
                                            max: max,
                                            background: displayBg // Use correct background
                                        })}
                                        disabled={isFull}
                                    >
                                        NHẬP THẤT
                                    </button>
                                </div>
                            </motion.div>
                        );
                    })
                )}
            </motion.div>

            {/* Create Room Modal - Reused from previous logic but stylized better */}
            {showCreateModal && (
                <div className="modal-overlay">
                    <motion.div
                        className="modal-content glass-premium"
                        style={{ maxWidth: '800px', width: '95%' }}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}

                    >
                        {/* Header & Stepper */}
                        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                            <h2 className="gold-text" style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>
                                {step === 1 && "BƯỚC 1: CHỌN CẢNH GIỚI (LEVEL)"}
                                {step === 2 && "BƯỚC 2: CHỌN ĐỊA ĐIỂM (MAP)"}
                                {step === 3 && "BƯỚC 3: THIẾT LẬP CHI TIẾT"}
                            </h2>
                            <div className="step-indicator">
                                <div className={`step-dot ${step >= 1 ? 'active' : ''}`}></div>
                                <div className="step-logo-divider" style={{ width: '50px', height: '2px', background: '#333' }}></div>
                                <div className={`step-dot ${step >= 2 ? 'active' : ''}`}></div>
                                <div className="step-logo-divider" style={{ width: '50px', height: '2px', background: '#333' }}></div>
                                <div className={`step-dot ${step >= 3 ? 'active' : ''}`}></div>
                            </div>
                        </div>

                        {/* STEP 1: LEVEL SELECTION */}
                        {step === 1 && (
                            <div className="tribe-grid" style={{ margin: '0', gap: '1rem' }}>
                                {/* Stage 1: Always Open */}
                                <div className="level-card" onClick={() => { setNewRoomConfig({ ...newRoomConfig, level: 'Beginner', stage: 1 }); setStep(2); }}>
                                    <i className="fa-solid fa-leaf"></i>
                                    <h3>SƠ NHẬP</h3>
                                    <p style={{ fontSize: '0.8rem', color: '#888' }}>Level 1-30: Cơ bản</p>
                                </div>

                                {/* Stage 2: Lv 31+ */}
                                {canAccessStage(level, 2) ? (
                                    <div className="level-card" onClick={() => { setNewRoomConfig({ ...newRoomConfig, level: 'Intermediate', stage: 2 }); setStep(2); }}>
                                        <i className="fa-solid fa-khanda"></i>
                                        <h3>CAO THỦ</h3>
                                        <p style={{ fontSize: '0.8rem', color: '#888' }}>Level 31-60: Nâng cao</p>
                                    </div>
                                ) : (
                                    <div className="level-card locked" style={{ opacity: 0.5, cursor: 'not-allowed', position: 'relative' }}>
                                        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#ff4d4d' }}>
                                            <i className="fa-solid fa-lock" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}></i>
                                            <span>Yêu cầu Lv.31</span>
                                            <span style={{ fontSize: '0.7rem', color: '#aaa' }}>Cần tu luyện thêm!</span>
                                        </div>
                                        <i className="fa-solid fa-khanda"></i>
                                        <h3>CAO THỦ</h3>
                                    </div>
                                )}

                                {/* Stage 3: Lv 61+ */}
                                {canAccessStage(level, 3) ? (
                                    <div className="level-card" onClick={() => { setNewRoomConfig({ ...newRoomConfig, level: 'Advanced', stage: 3 }); setStep(2); }}>
                                        <i className="fa-solid fa-dragon"></i>
                                        <h3>ĐẠI SƯ</h3>
                                        <p style={{ fontSize: '0.8rem', color: '#888' }}>Level 61+: Thượng thừa</p>
                                    </div>
                                ) : (
                                    <div className="level-card locked" style={{ opacity: 0.5, cursor: 'not-allowed', position: 'relative' }}>
                                        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#ff4d4d' }}>
                                            <i className="fa-solid fa-lock" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}></i>
                                            <span>Yêu cầu Lv.61</span>
                                            <span style={{ fontSize: '0.7rem', color: '#aaa' }}>Cần tu luyện thêm!</span>
                                        </div>
                                        <i className="fa-solid fa-dragon"></i>
                                        <h3>ĐẠI SƯ</h3>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* STEP 2: MAP SELECTION */}
                        {step === 2 && (
                            <div>
                                <div className="map-selection-grid">
                                    {availableMaps.map((map, idx) => (
                                        <div
                                            key={idx}
                                            className={`map-card ${newRoomConfig.mapId === idx ? 'selected' : ''}`}
                                            onClick={() => setNewRoomConfig({ ...newRoomConfig, mapId: idx, background: map.img })}
                                        /* Map restriction logic could go here too if Maps are strictly bound to stages */
                                        >
                                            <img src={map.img} alt={map.name} />
                                            <div className="map-card-label">{map.name}</div>
                                        </div>
                                    ))}
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
                                    <button className="wuxia-btn" onClick={() => setStep(3)} disabled={newRoomConfig.mapId === undefined} style={{ opacity: newRoomConfig.mapId !== undefined ? 1 : 0.5 }}>
                                        Tiếp Tục <i className="fa-solid fa-arrow-right"></i>
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* STEP 3: LESSON / TOPIC SELECTION */}
                        {step === 3 && (
                            <div style={{ padding: '0 2rem' }}>
                                <div className="input-group-premium">
                                    <label>TÊN VÕ ĐƯỜNG</label>
                                    <input
                                        type="text"
                                        value={newRoomConfig.name}
                                        onChange={e => setNewRoomConfig({ ...newRoomConfig, name: e.target.value })}
                                        placeholder="Đặt tên cho võ đường..."
                                        style={{ width: '100%', padding: '0.8rem', background: 'rgba(0,0,0,0.3)', border: '1px solid #444', color: '#fff' }}
                                    />
                                </div>

                                <div className="input-group-premium" style={{ marginTop: '1.5rem', flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
                                    <label>CHỌN BÀI HỌC (LESSON)</label>
                                    <div className="custom-scrollbar" style={{ flex: 1, overflowY: 'auto', border: '1px solid #444', borderRadius: '8px', padding: '0.5rem' }}>
                                        {/* Dynamic Lessons based on Stage */}
                                        {(STAGE_CONTENT[newRoomConfig.stage] || STAGE_CONTENT[1]).lessons?.map((lesson) => (
                                            <div
                                                key={lesson.id}
                                                className={`lesson-item ${newRoomConfig.topic === lesson.title ? 'selected' : ''}`}
                                                style={{
                                                    padding: '10px',
                                                    margin: '5px 0',
                                                    background: newRoomConfig.topic === lesson.title ? 'rgba(255, 215, 0, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                                                    border: newRoomConfig.topic === lesson.title ? '1px solid gold' : '1px solid transparent',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center'
                                                }}
                                                onClick={() => setNewRoomConfig({
                                                    ...newRoomConfig,
                                                    topic: lesson.title,
                                                    // Auto-fill name if empty
                                                    name: newRoomConfig.name || `Võ Đường: ${lesson.topic}`
                                                })}
                                            >
                                                <div>
                                                    <div style={{ fontWeight: 'bold', color: newRoomConfig.topic === lesson.title ? 'gold' : '#eee' }}>{lesson.title}</div>
                                                    <div style={{ fontSize: '0.8em', color: '#888' }}>Chủ đề: {lesson.topic}</div>
                                                </div>
                                                {newRoomConfig.topic === lesson.title && <i className="fa-solid fa-check gold-text"></i>}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                                    <button className="wuxia-btn" onClick={handleCreateSubmit}>
                                        KHAI MỞ VÕ ĐƯỜNG
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Navigation Footer */}
                        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem' }}>
                            <button
                                onClick={() => step > 1 ? setStep(step - 1) : setShowCreateModal(false)}
                                style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer' }}
                            >
                                <i className="fa-solid fa-arrow-left"></i> {step > 1 ? 'Quay Lại' : 'Huỷ Bỏ'}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )
            }
        </div >
    );
}

export default RoomList;
