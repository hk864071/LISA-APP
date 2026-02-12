import React, { useState } from 'react';
import './RoomList.css';

function RoomList({ onJoinRoom, onCreateRoom, onBack }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [rooms, setRooms] = useState([
        { id: 1, name: 'AI Ethics Discussion', host: 'Master Flora', level: 'Beginner', topic: 'Ethics', participants: 3, max: 5 },
        { id: 2, name: 'Neural Networks 101', host: 'Sensei Wu', level: 'Intermediate', topic: 'Tech', participants: 5, max: 5 }, // Full
        { id: 3, name: 'Daily Conversation', host: 'User123', level: 'All Levels', topic: 'Daily', participants: 1, max: 4 },
        { id: 4, name: 'Exam Prep: IELTS', host: 'Teacher John', level: 'Advanced', topic: 'Exam', participants: 2, max: 6 },
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

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(rgba(0,0,0,0.8), rgba(0,0,0,0.9)), url("/assets/background_general.jpg")',
            backgroundSize: 'cover',
            padding: '2rem',
            color: '#fff'
        }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#ccc', cursor: 'pointer', fontSize: '1.2rem' }}>
                    <i className="fa-solid fa-arrow-left"></i> QUAY LẠI
                </button>
                <h1 className="gold-text" style={{ fontSize: '2.5rem' }}>SẢNH TU LUYỆN (DOJO HALL)</h1>
                <div style={{ width: '100px' }}></div>
            </div>

            {/* Controls */}
            <div style={{ maxWidth: '1400px', margin: '0 auto 2rem auto', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <input
                    type="text"
                    placeholder="Tìm kiếm phòng..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                        flex: 1,
                        background: 'rgba(255,255,255,0.1)',
                        border: '1px solid #444',
                        padding: '1rem',
                        color: '#fff',
                        borderRadius: '8px'
                    }}
                />
                <button
                    className="wuxia-btn"
                    onClick={() => setShowCreateModal(true)}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                    <i className="fa-solid fa-plus"></i> LẬP ĐÀN (TẠO PHÒNG)
                </button>
            </div>

            {/* Room Grid */}
            <div className="room-grid">
                {rooms.filter(r => r.name.toLowerCase().includes(searchTerm.toLowerCase())).map(room => (
                    <div key={room.id} className="room-card">
                        <div className={`room-status ${room.participants >= room.max ? 'full' : ''}`}>
                            {room.participants >= room.max ? 'ĐẦY (FULL)' : 'ĐANG CHỜ'}
                        </div>
                        <h3 style={{ color: 'var(--primary)', marginBottom: '0.5rem', fontSize: '1.3rem' }}>{room.name}</h3>
                        <p style={{ color: '#aaa', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                            <i className="fa-solid fa-user-shield"></i> Chủ phòng: {room.host}
                        </p>

                        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                            <span style={{ background: 'rgba(255,255,255,0.1)', padding: '0.3rem 0.8rem', borderRadius: '4px', fontSize: '0.8rem' }}>
                                {room.level}
                            </span>
                            <span style={{ background: 'rgba(255,255,255,0.1)', padding: '0.3rem 0.8rem', borderRadius: '4px', fontSize: '0.8rem' }}>
                                {room.topic}
                            </span>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ color: '#888', fontSize: '0.9rem' }}>
                                <i className="fa-solid fa-users"></i> {room.participants}/{room.max}
                            </div>
                            <button
                                onClick={() => onJoinRoom(room)}
                                disabled={room.participants >= room.max}
                                style={{
                                    padding: '0.8rem 2rem',
                                    background: room.participants >= room.max ? '#333' : 'var(--primary)',
                                    border: 'none',
                                    borderRadius: '6px',
                                    fontWeight: 'bold',
                                    cursor: room.participants >= room.max ? 'not-allowed' : 'pointer',
                                    opacity: room.participants >= room.max ? 0.5 : 1
                                }}
                            >
                                {room.participants >= room.max ? 'ĐÃ ĐẦY' : 'NHẬP THẤT'}
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Create Room Modal - RPG Map Selection Style */}
            {showCreateModal && (
                <div className="modal-overlay">
                    <div className="modal-content glass-premium" style={{ maxWidth: '800px', width: '95%' }}>

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
                                <div className="level-card" onClick={() => { setNewRoomConfig({ ...newRoomConfig, level: 'Beginner' }); setStep(2); }}>
                                    <i className="fa-solid fa-leaf"></i>
                                    <h3>SƠ NHẬP</h3>
                                    <p style={{ fontSize: '0.8rem', color: '#888' }}>Dành cho tân thủ mới bước chân vào giang hồ. (IELTS 4.0-5.0)</p>
                                </div>
                                <div className="level-card" onClick={() => { setNewRoomConfig({ ...newRoomConfig, level: 'Intermediate' }); setStep(2); }}>
                                    <i className="fa-solid fa-khanda"></i>
                                    <h3>CAO THỦ</h3>
                                    <p style={{ fontSize: '0.8rem', color: '#888' }}>Rèn luyện kỹ năng thực chiến. (IELTS 5.5-6.5)</p>
                                </div>
                                <div className="level-card" onClick={() => { setNewRoomConfig({ ...newRoomConfig, level: 'Advanced' }); setStep(2); }}>
                                    <i className="fa-solid fa-dragon"></i>
                                    <h3>ĐẠI SƯ</h3>
                                    <p style={{ fontSize: '0.8rem', color: '#888' }}>Luận bàn đạo học thâm sâu. (IELTS 7.0+)</p>
                                </div>
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

                        {/* STEP 3: SUBLEVEL / TOPIC */}
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
                                    <label>CHỌN CHỦ ĐỀ TU LUYỆN (SUB-LEVEL)</label>
                                    <div className="sublevel-list">
                                        {['General Conversation', 'Technology & AI', 'Business English', 'IELTS Speaking Part 1', 'IELTS Speaking Part 2'].map(topic => (
                                            <div
                                                key={topic}
                                                className={`sublevel-item ${newRoomConfig.topic === topic ? 'selected' : ''}`}
                                                onClick={() => setNewRoomConfig({ ...newRoomConfig, topic })}
                                            >
                                                <span>{topic}</span>
                                                {newRoomConfig.topic === topic && <i className="fa-solid fa-check gold-text"></i>}
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
                    </div>
                </div>
            )}
        </div>
    );
}

export default RoomList;
