
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './RoomList.css';
import './RoomList.css';
import './RoomListPremium.css';
import { STAGE_CONTENT, canAccessStage } from '../data/stageContent';

function RoomList({ level, onJoinRoom, onCreateRoom, onBack }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [rooms, setRooms] = useState([
        { id: 1, name: 'AI Ethics Discussion', host: 'Master Flora', level: 'Beginner', topic: 'Ethics', participants: 3, max: 5 },
        { id: 2, name: 'Neural Networks 101', host: 'Sensei Wu', level: 'Intermediate', topic: 'Tech', participants: 5, max: 5 }, // Full
        { id: 3, name: 'Daily Conversation', host: 'User123', level: 'All Levels', topic: 'Daily', participants: 1, max: 4 },
        { id: 4, name: 'Exam Prep: IELTS', host: 'Teacher John', level: 'Advanced', topic: 'Exam', participants: 2, max: 6 },
        { id: 5, name: 'Business English', host: 'CEO Mark', level: 'Intermediate', topic: 'Business', participants: 3, max: 4 },
    ]);

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

    const handleCreateSubmit = (e) => {
        e.preventDefault();
        const newRoom = {
            id: rooms.length + 1,
            name: newRoomConfig.name || 'New Room',
            host: 'You',
            level: newRoomConfig.level,
            topic: newRoomConfig.topic,
            participants: 1,
            max: 5
        };
        setRooms([newRoom, ...rooms]);
        setShowCreateModal(false);
        onJoinRoom(newRoom);
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

    const filteredRooms = rooms.filter(r => r.name.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="room-list-container">
            {/* Header */}
            <div className="dojo-header">
                <button onClick={onBack} className="back-btn">
                    <i className="fa-solid fa-arrow-left"></i> QUAY LẠI
                </button>
                <h1 className="dojo-title">SẢNH TU LUYỆN</h1>
                <div style={{ width: '100px' }}></div>
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
            <motion.div
                className="room-grid"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {filteredRooms.map(room => (
                    <motion.div
                        key={room.id}
                        className="room-card-premium"
                        variants={itemVariants}
                        whileHover={{ scale: 1.03 }}
                    >
                        <div className="room-header-card">
                            <span className={`room-status-badge ${room.participants >= room.max ? 'full' : 'available'}`}>
                                {room.participants >= room.max ? 'ĐẦY' : 'SẴN SÀNG'}
                            </span>
                            <div className="room-level-badge">
                                {room.level === 'Beginner' && <i className="fa-solid fa-seedling"></i>}
                                {room.level === 'Intermediate' && <i className="fa-solid fa-shield-halved"></i>}
                                {room.level === 'Advanced' && <i className="fa-solid fa-dragon"></i>}
                            </div>
                        </div>

                        <div>
                            <h3 className="room-name">{room.name}</h3>
                            <div className="room-topic">
                                <i className="fa-solid fa-scroll"></i> {room.topic}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: '#666', marginBottom: '0.5rem' }}>
                                Host: <span style={{ color: '#aaa', fontWeight: 'bold' }}>{room.host}</span>
                            </div>
                        </div>

                        <div className="room-footer">
                            <div className="room-users">
                                <i className="fa-solid fa-user-group"></i> {room.participants}/{room.max}
                            </div>
                            <button
                                className="join-btn"
                                onClick={() => onJoinRoom(room)}
                                disabled={room.participants >= room.max}
                            >
                                NHẬP THẤT
                            </button>
                        </div>
                    </motion.div>
                ))}
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
                                    <label>TÊN PHÒNG</label>
                                    <input
                                        type="text"
                                        value={newRoomConfig.name}
                                        onChange={e => setNewRoomConfig({ ...newRoomConfig, name: e.target.value })}
                                        placeholder="Đặt tên cho võ đường..."
                                    />
                                </div>

                                <div className="input-group-premium">
                                    <label>CHỌN BÀI HỌC (LESSON)</label>
                                    <div className="sublevel-list" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                        {/* Dynamic Lessons based on Stage */}
                                        {STAGE_CONTENT[newRoomConfig.stage || 1].lessons?.map((lesson) => (
                                            <div
                                                key={lesson.id}
                                                className={`sublevel-item ${newRoomConfig.topic === lesson.title ? 'selected' : ''}`}
                                                onClick={() => setNewRoomConfig({ ...newRoomConfig, topic: lesson.title })}
                                            >
                                                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                                                    <span>{lesson.title}</span>
                                                    <span style={{ fontSize: '0.8em', color: '#888' }}>Topic: {lesson.topic}</span>
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
            )}
        </div>
    );
}

export default RoomList;
