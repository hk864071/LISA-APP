import React, { useState } from 'react';
import './CharacterProfile.css';

function CharacterProfile({ character, level, tribe, onBack, onChangeCharacter, onCreateRoom }) {
    const [selectedItem, setSelectedItem] = useState(null);
    const [selectedMap, setSelectedMap] = useState(null);

    // RPG Stats mapped to English Skills
    const stats = [
        { name: "Nội Công (Vocabulary)", value: 45 + (level * 10), max: 100, icon: "fa-book-skull", color: "#ff4d4d", desc: "Tăng khả năng gợi ý từ vựng cao cấp." },
        { name: "Thân Pháp (Fluency)", value: 30 + (level * 8), max: 100, icon: "fa-wind", color: "#4dff88", desc: "Giảm độ trễ khi AI phản hồi." },
        { name: "Kiếm Ý (Grammar)", value: 60 + (level * 5), max: 100, icon: "fa-scroll", color: "#4db8ff", desc: "Tự động phát hiện lỗi sai ngữ pháp." },
        { name: "Định Lực (Listening)", value: 40 + (level * 7), max: 100, icon: "fa-ear-listen", color: "#ffd700", desc: "Hiển thị phụ đề (transcript) chính xác hơn." }
    ];

    const equipments = [
        {
            slot: "Vũ Khí (Weapon)",
            name: "IELTS Pen of Truth",
            rarity: "Epic",
            icon: "fa-pen-nib",
            effect: "+15% Vocabulary XP khi luyện Speaking",
            lore: "Cây bút truyền thuyết của các giám khảo IELTS, từng chấm hàng nghìn bài thi điểm 9.0.",
            source: "Rớt từ Boss: 'IELTS Examiner' (Speaking Room Lv.5)"
        },
        {
            slot: "Y Phục (Armor)",
            name: "Scholar's Robe",
            rarity: "Rare",
            icon: "fa-shirt",
            effect: "Giảm 10% sát thương tâm lý (Sợ sai)",
            lore: "Chiếc áo được dệt từ những trang sách Oxford, giúp người mặc tự tin hơn trước đám đông.",
            source: "Mua tại 'Thương Khung Các' (Shop)"
        },
        {
            slot: "Ngọc Bội (Amulet)",
            name: "Dictionary Amulet",
            rarity: "Legendary",
            icon: "fa-gem",
            effect: "Kỹ năng bị động: 'Tra Nhanh' (Click từ để dịch)",
            lore: "Viên ngọc chứa đựng tri thức của nhân loại, soi sáng nghĩa của mọi từ vựng.",
            source: "Hoàn thành Nhiệm vụ: '1000 Từ Vựng Cơ Bản'"
        },
    ];

    const availableMaps = [
        { id: 1, name: "Thư Viện Cổ (Ancient Library)", img: "https://images.unsplash.com/photo-1507842217121-ca19c9eac191?q=80&w=2600&auto=format&fit=crop", desc: "Nơi lưu giữ tri thức ngàn đời. Thích hợp để tu luyện từ vựng.", bonus: "+10% Vocabulary XP" },
        { id: 2, name: "Rừng Trúc (Bamboo Forest)", img: "https://images.unsplash.com/photo-1511497584788-876760111969?q=80&w=3432&auto=format&fit=crop", desc: "Không gian tĩnh lặng, thích hợp thiền định và luyện nghe.", bonus: "+10% Listening XP" },
        { id: 3, name: "Đấu Trường (Arena)", img: "https://images.unsplash.com/photo-1516934024742-b461fba47600?q=80&w=3387&auto=format&fit=crop", desc: "Nơi các cao thủ so tài biện luận. Thích hợp luyện nói.", bonus: "+10% Speaking XP" },
        { id: 4, name: "Đỉnh Núi Tuyết (Snow Peak)", img: "https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=3540&auto=format&fit=crop", desc: "Nơi thử thách khắc nghiệt nhất. Dành cho các bài thi thử.", bonus: "Hard Mode: Double XP" },
        { id: 5, name: "Vườn Thượng Uyển (Royal Garden)", img: "https://images.unsplash.com/photo-1588636283921-698d2495b596?q=80&w=3347&auto=format&fit=crop", desc: "Nơi giao lưu văn hoá nhẹ nhàng.", bonus: "Relax Mode" },
    ];

    const handleCreateRoom = () => {
        if (selectedMap && onCreateRoom) {
            onCreateRoom({
                name: `${tribe.name} Training Room`,
                topic: 'General Practice',
                level: level === 1 ? 'Beginner' : level === 2 ? 'Intermediate' : 'Advanced',
                background: selectedMap.img,
                mapName: selectedMap.name
            });
        }
    };

    return (
        <div className="rpg-screen">
            <div className="rpg-overlay"></div>

            {/* Context Helper Modal for Item Details */}
            {selectedItem && (
                <div className="item-detail-modal" onClick={() => setSelectedItem(null)}>
                    <div className="item-card glass-premium" onClick={e => e.stopPropagation()}>
                        <div className={`item-header rarity-${selectedItem.rarity.toLowerCase()}`}>
                            <i className={`fa-solid ${selectedItem.icon}`}></i>
                            <div>
                                <h3>{selectedItem.name}</h3>
                                <span>{selectedItem.rarity} {selectedItem.slot}</span>
                            </div>
                        </div>
                        <div className="item-body">
                            <div className="item-stat">
                                <i className="fa-solid fa-bolt"></i>
                                {selectedItem.effect}
                            </div>
                            <div className="item-lore">
                                " {selectedItem.lore} "
                            </div>
                            <div className="item-source">
                                <i className="fa-solid fa-location-dot"></i> Nơi kiếm: {selectedItem.source}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Selected Map Modal */}
            {selectedMap && (
                <div className="item-detail-modal" onClick={() => setSelectedMap(null)}>
                    <div className="map-detail-card glass-premium" onClick={e => e.stopPropagation()}>
                        <div className="map-detail-image" style={{ backgroundImage: `url('${selectedMap.img}')` }}>
                            <div className="map-detail-title">{selectedMap.name}</div>
                        </div>
                        <div className="map-detail-content">
                            <p className="map-desc">{selectedMap.desc}</p>
                            <div className="map-bonus"><i className="fa-solid fa-star"></i> Hiệu ứng: {selectedMap.bonus}</div>

                            {/* Level Selector */}
                            <div className="difficulty-selector">
                                <h4 style={{ color: '#ccc', marginBottom: '0.5rem', fontSize: '0.9rem' }}>CHỌN CẢNH GIỚI (DIFFICULTY)</h4>
                                <div className="difficulty-options">
                                    {(selectedMap.levels || ["Beginner", "Intermediate", "Advanced"]).map((lvl, idx) => (
                                        <div
                                            key={idx}
                                            className={`difficulty-pill ${selectedDifficulty === lvl ? 'selected' : ''}`}
                                            onClick={() => setSelectedDifficulty(lvl)}
                                        >
                                            {lvl}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="map-actions">
                                <button className="wuxia-btn" onClick={handleCreateRoom}>
                                    <i className="fa-solid fa-khanda"></i> THIẾT LẬP PHÒNG TẬP
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="rpg-header">
                <button onClick={onBack} className="wuxia-btn-back">
                    <i className="fa-solid fa-arrow-left"></i> QUAY LẠI
                </button>
                <h1 className="gold-text-dynamic" style={{ fontSize: '2.5rem' }}>HỒ SƠ ĐẠI HIỆP</h1>
            </div>

            <div className="profile-container">
                {/* Left: Character Model & Map Slide Selector */}
                <div className="profile-left-column">
                    <div className="profile-char-section">
                        <button
                            className="change-char-btn"
                            onClick={onChangeCharacter}
                            title="Đổi Nhân Vật"
                        >
                            <i className="fa-solid fa-users-viewfinder"></i>
                        </button>
                        <div className="char-glow-bg"></div>
                        <img
                            src={encodeURI(character.evolutions[level - 1] || character.evolutions[character.evolutions.length - 1])}
                            alt="Character"
                            className="profile-char-img"
                        />
                        <div className="char-info-plate">
                            <h2 className="char-name">ĐẠI HIỆP</h2>
                            <div className="char-title">{tribe.name} Disciple</div>
                            <div className="char-level">Cảnh Giới: Level {level}</div>
                        </div>
                    </div>

                    {/* Map Selector Slide - Vertical */}
                    <div className="map-slide-container glass-panel">
                        <h3 className="section-title-small"><i className="fa-solid fa-map"></i> BẢN ĐỒ (MAPS)</h3>
                        <div className="map-scroller">
                            {availableMaps.map(map => (
                                <div key={map.id} className="map-slide-item" onClick={() => setSelectedMap(map)}>
                                    <div className="map-thumb" style={{ backgroundImage: `url('${map.img}')` }}></div>
                                    <div className="map-name">{map.name}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Center: Attributes (Stats) */}
                <div className="profile-stats-section glass-panel">
                    <h3 className="section-title"><i className="fa-solid fa-chart-pie"></i> THUỘC TÍNH (STATS)</h3>
                    <p style={{ fontSize: '0.8rem', color: '#888', marginBottom: '1rem' }}>
                        *Tăng Cảnh Giới để nâng cao các chỉ số này.
                    </p>
                    <div className="stats-grid">
                        {stats.map((stat, idx) => (
                            <div key={idx} className="stat-row" title={stat.desc}>
                                <div className="stat-icon" style={{ color: stat.color }}>
                                    <i className={`fa-solid ${stat.icon}`}></i>
                                </div>
                                <div className="stat-details">
                                    <div className="stat-labels">
                                        <span>{stat.name}</span>
                                        <span style={{ color: stat.color }}>{stat.value}/{stat.max}</span>
                                    </div>
                                    <div className="stat-bar-bg">
                                        <div
                                            className="stat-bar-fill"
                                            style={{ width: `${(stat.value / stat.max) * 100}%`, background: stat.color }}
                                        ></div>
                                    </div>
                                    <div style={{ fontSize: '0.7rem', color: '#666', marginTop: '0.2rem' }}>{stat.desc}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="combat-power">
                        <span>CHIẾN LỰC (Total Score):</span>
                        <span className="power-value">{stats.reduce((a, b) => a + b.value, 0) * 10}</span>
                    </div>
                </div>

                {/* Right: Equipment & Inventory */}
                <div className="profile-gear-section glass-panel">
                    <h3 className="section-title"><i className="fa-solid fa-suitcase"></i> HÀNH TRANG (GEAR)</h3>
                    <p style={{ fontSize: '0.8rem', color: '#888', marginBottom: '1rem' }}>
                        *Trang bị giúp tăng chỉ số và hỗ trợ quá trình tu luyện.
                    </p>
                    <div className="gear-grid">
                        {equipments.map((item, idx) => (
                            <div
                                key={idx}
                                className={`gear-slot rarity-${item.rarity.toLowerCase()}`}
                                onClick={() => setSelectedItem(item)}
                                style={{ cursor: 'pointer' }}
                            >
                                <div className="gear-icon"><i className={`fa-solid ${item.icon}`}></i></div>
                                <div className="gear-info">
                                    <div className="gear-name">{item.name}</div>
                                    <div className="gear-type">{item.slot} • <span className={`rarity-text ${item.rarity}`}>{item.rarity}</span></div>
                                </div>
                            </div>
                        ))}
                        {/* Empty Slots */}
                        {[1, 2, 3].map(i => (
                            <div key={`empty-${i}`} className="gear-slot empty">
                                <div className="gear-icon"><i className="fa-solid fa-plus"></i></div>
                                <div className="gear-info">
                                    <div className="gear-name" style={{ color: '#555' }}>Ô Trống</div>
                                    <div className="gear-type" style={{ fontSize: '0.65rem' }}>Tìm trong Bí Cảnh</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CharacterProfile;
