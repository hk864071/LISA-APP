import React, { useState } from 'react';
import './WorldMap.css';

function WorldMap({ onBack, onCreateRoom, tribe }) {
    const [selectedMap, setSelectedMap] = useState(null);
    const [selectedDifficulty, setSelectedDifficulty] = useState('Beginner');

    const maps = [
        { id: 1, name: "Thư Viện Cổ (Ancient Library)", img: "https://images.unsplash.com/photo-1507842217121-ca19c9eac191?q=80&w=2600&auto=format&fit=crop", desc: "Nơi lưu giữ tri thức ngàn đời. Thích hợp để tu luyện từ vựng.", bonus: "+10% Vocabulary XP", levels: ["Sơ Nhập", "Giang Hồ", "Võ Lâm"], difficulty: "Easy" },
        { id: 2, name: "Rừng Trúc (Bamboo Forest)", img: "https://images.unsplash.com/photo-1511497584788-876760111969?q=80&w=3432&auto=format&fit=crop", desc: "Không gian tĩnh lặng, thích hợp thiền định và luyện nghe.", bonus: "+10% Listening XP", levels: ["Sơ Nhập", "Giang Hồ"], difficulty: "Easy" },
        { id: 3, name: "Đấu Trường (Arena)", img: "https://images.unsplash.com/photo-1516934024742-b461fba47600?q=80&w=3387&auto=format&fit=crop", desc: "Nơi các cao thủ so tài biện luận. Thích hợp luyện nói.", bonus: "+10% Speaking XP", levels: ["Giang Hồ", "Võ Lâm", "Tuyệt Thế"], difficulty: "Medium" },
        { id: 4, name: "Đỉnh Núi Tuyết (Snow Peak)", img: "https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=3540&auto=format&fit=crop", desc: "Nơi thử thách khắc nghiệt nhất. Dành cho các bài thi thử.", bonus: "Hard Mode: Double XP", levels: ["Võ Lâm", "Tuyệt Thế"], difficulty: "Hard" },
        { id: 5, name: "Vườn Thượng Uyển (Royal Garden)", img: "https://images.unsplash.com/photo-1588636283921-698d2495b596?q=80&w=3347&auto=format&fit=crop", desc: "Nơi giao lưu văn hoá nhẹ nhàng.", bonus: "Relax Mode", levels: ["Tự Do"], difficulty: "Relax" },
        { id: 6, name: "Hư Không Các (Void Realm)", img: "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=3294&auto=format&fit=crop", desc: "Vùng đất bí ẩn chưa ai khám phá.", bonus: "???", levels: ["???"], difficulty: "Locked", locked: true },
    ];

    const handleCreateWrapper = () => {
        if (selectedMap && !selectedMap.locked) {
            onCreateRoom({
                name: `${tribe?.name || 'Player'} Training Room`,
                topic: 'General Practice',
                level: selectedDifficulty,
                background: selectedMap.img,
                mapName: selectedMap.name
            });
        }
    };

    return (
        <div className="world-map-screen">
            <div className="world-map-overlay"></div>

            {/* Header */}
            <div className="rpg-header">
                <button onClick={onBack} className="wuxia-btn-back">
                    <i className="fa-solid fa-arrow-left"></i> TRỞ VỀ
                </button>
                <h1 className="gold-text-dynamic" style={{ fontSize: '2rem' }}>BẢN ĐỒ TU LUYỆN</h1>
            </div>

            {/* Map List - Vertical Scroll */}
            <div className="map-scroll-container">
                <div className="map-track">
                    {/* Connecting Line */}
                    <div className="map-line"></div>

                    {maps.map((map, index) => (
                        <div
                            key={map.id}
                            className={`map-node ${map.locked ? 'locked' : ''} ${index % 2 === 0 ? 'left' : 'right'}`}
                            onClick={() => !map.locked && setSelectedMap(map)}
                        >
                            <div className="map-node-content glass-panel">
                                <div className="map-node-img" style={{ backgroundImage: `url('${map.img}')` }}>
                                    {map.locked && <div className="lock-overlay"><i className="fa-solid fa-lock"></i></div>}
                                </div>
                                <div className="map-node-info">
                                    <h3 className="gold-text-small">{map.name}</h3>
                                    <span className={`difficulty-tag ${map.difficulty.toLowerCase()}`}>{map.difficulty}</span>
                                </div>
                            </div>
                            <div className="map-connector"></div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Map Detail Modal */}
            {selectedMap && (
                <div className="item-detail-modal" onClick={() => setSelectedMap(null)}>
                    <div className="map-detail-card glass-premium" onClick={e => e.stopPropagation()}>
                        <div className="map-detail-image" style={{ backgroundImage: `url('${selectedMap.img}')` }}>
                            <div className="map-detail-title">{selectedMap.name}</div>
                            <button className="close-modal-btn" onClick={() => setSelectedMap(null)}><i className="fa-solid fa-xmark"></i></button>
                        </div>
                        <div className="map-detail-content">
                            <p className="map-desc">{selectedMap.desc}</p>
                            <div className="map-bonus"><i className="fa-solid fa-star"></i> Hiệu ứng: {selectedMap.bonus}</div>

                            {/* Level Selector */}
                            <div className="difficulty-selector">
                                <h4 style={{ color: '#ccc', marginBottom: '0.5rem', fontSize: '0.9rem' }}>CHỌN CẢNH GIỚI (DIFFICULTY)</h4>
                                <div className="difficulty-options">
                                    {(selectedMap.levels).map((lvl, idx) => (
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
                                <button className="wuxia-btn" onClick={handleCreateWrapper}>
                                    <i className="fa-solid fa-khanda"></i> THIẾT LẬP PHÒNG TẬP
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default WorldMap;
