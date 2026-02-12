import React, { useState } from 'react';
import './SkillTree.css';

function SkillTree({ onBack }) {
    const [selectedNode, setSelectedNode] = useState(null);

    const skillNodes = [
        { id: 'root', name: "Nhập Môn (Basics)", x: 50, y: 80, status: 'unlocked', icon: 'fa-seedling', type: "Passive", effect: "+10% XP Cơ Bản", desc: "Nền tảng của mọi võ công. Tăng tốc độ học từ vựng cơ bản." },

        // Left Branch: Grammar (Kiếm Pháp)
        { id: 'g1', name: "Sentence Structure", x: 25, y: 60, status: 'unlocked', icon: 'fa-scroll', parent: 'root', type: "Active", effect: "Kỹ năng: 'Soi Lỗi' (5 uses/day)", desc: "Cho phép nhìn thấy lỗi sai cấu trúc câu khi chat với AI." },
        { id: 'g2', name: "Adv. Grammar", x: 15, y: 40, status: 'locked', icon: 'fa-layer-group', parent: 'g1', type: "Passive", effect: "Giảm 20% khả năng sai thì", desc: "Tự động gợi ý sửa lỗi thì (Tenses) khi đang gõ." },
        { id: 'g3', name: "Complex Sentences", x: 35, y: 40, status: 'locked', icon: 'fa-clock', parent: 'g1', type: "Passive", effect: "+Bonus XP cho câu dài", desc: "Nhận thêm XP khi sử dụng câu phức (Compound Sentences)." },

        // Right Branch: Vocabulary (Nội Công)
        { id: 'v1', name: "Vocab Expansion", x: 75, y: 60, status: 'unlocked', icon: 'fa-book', parent: 'root', type: "Active", effect: "Kỹ năng: 'Gợi Ý' (3 uses/day)", desc: "Yêu cầu AI gợi ý từ vựng nâng cao (C1/C2) trong ngữ cảnh." },
        { id: 'v2', name: "IELTS Core", x: 65, y: 40, status: 'locked', icon: 'fa-fire', parent: 'v1', type: "Passive", effect: "Mở khoá chủ đề IELTS", desc: "Cho phép truy cập các phòng luyện thi IELTS chuyên sâu." },
        { id: 'v3', name: "Idioms Mastery", x: 85, y: 40, status: 'locked', icon: 'fa-quote-left', parent: 'v1', type: "Passive", effect: "+50% Độ Tự Nhiên (Fluency)", desc: "Tự động chèn Idioms phù hợp vào gợi ý của AI Sensei." },

        // Top: Mastery (Tuyệt Kỹ)
        { id: 'master', name: "Debate God", x: 50, y: 15, status: 'locked', icon: 'fa-dragon', parent: ['g2', 'g3', 'v2', 'v3'], type: "Ultimate", effect: "Chế độ: 'Tranh Biện' (Debate Mode)", desc: "Mở khoá chế độ tranh luận trực tiếp với AI Master về các chủ đề triết học." }
    ];

    const lines = [
        { from: { x: 50, y: 80 }, to: { x: 25, y: 60 }, active: true }, // root -> g1
        { from: { x: 50, y: 80 }, to: { x: 75, y: 60 }, active: true }, // root -> v1

        { from: { x: 25, y: 60 }, to: { x: 15, y: 40 }, active: false }, // g1 -> g2
        { from: { x: 25, y: 60 }, to: { x: 35, y: 40 }, active: false }, // g1 -> g3

        { from: { x: 75, y: 60 }, to: { x: 65, y: 40 }, active: false }, // v1 -> v2
        { from: { x: 75, y: 60 }, to: { x: 85, y: 40 }, active: false }, // v1 -> v3

        { from: { x: 15, y: 40 }, to: { x: 50, y: 15 }, active: false, dashed: true },
        { from: { x: 85, y: 40 }, to: { x: 50, y: 15 }, active: false, dashed: true },
    ];

    return (
        <div className="rpg-screen skill-tree-bg">
            <div className="rpg-header">
                <button onClick={onBack} className="wuxia-btn-back">
                    <i className="fa-solid fa-arrow-left"></i> QUAY LẠI
                </button>
                <div style={{ textAlign: 'right' }}>
                    <h1 className="gold-text-dynamic" style={{ fontSize: '2rem' }}>TÀNG KINH CÁC</h1>
                    <span style={{ color: '#888', letterSpacing: '2px' }}>SKILL TREE SYSTEM</span>
                </div>
            </div>

            <div className="tree-container">
                <svg className="tree-lines">
                    {lines.map((l, i) => (
                        <line
                            key={i}
                            x1={`${l.from.x}%`} y1={`${l.from.y}%`}
                            x2={`${l.to.x}%`} y2={`${l.to.y}%`}
                            className={`tree-line ${l.active ? 'active' : ''} ${l.dashed ? 'dashed' : ''}`}
                        />
                    ))}
                </svg>

                {skillNodes.map(node => (
                    <div
                        key={node.id}
                        className={`skill-node ${node.status} ${selectedNode?.id === node.id ? 'selected' : ''}`}
                        style={{ left: `${node.x}%`, top: `${node.y}%` }}
                        onClick={() => setSelectedNode(node)}
                    >
                        <div className="node-icon">
                            <i className={`fa-solid ${node.icon}`}></i>
                        </div>
                        {node.status === 'locked' && <div className="lock-overlay"><i className="fa-solid fa-lock"></i></div>}
                    </div>
                ))}
            </div>

            {/* Info Panel */}
            <div className="skill-info-panel" style={{ opacity: selectedNode ? 1 : 0.8 }}>
                <h3 className="gold-text">{selectedNode ? selectedNode.name : "CHỌN BÍ KÍP"}</h3>

                {selectedNode ? (
                    <>
                        <div style={{ marginBottom: '1rem' }}>
                            <span className={`skill-tag tag-${selectedNode.type.toLowerCase()}`}>{selectedNode.type}</span>
                            <span style={{ marginLeft: '0.5rem', color: '#aaa', fontSize: '0.8rem' }}>{selectedNode.status === 'locked' ? '• Chưa mở khoá' : '• Đã học'}</span>
                        </div>
                        <p style={{ fontSize: '0.9rem', color: '#ccc', fontStyle: 'italic', marginBottom: '1rem' }}>"{selectedNode.desc}"</p>

                        <div className="skill-effect-box">
                            <i className="fa-solid fa-wand-magic-sparkles"></i>
                            <span>{selectedNode.effect}</span>
                        </div>

                        <button
                            className={`wuxia-btn ${selectedNode.status === 'locked' ? 'disabled' : ''}`}
                            style={{ width: '100%', marginTop: '1rem' }}
                            disabled={selectedNode.status === 'locked'}
                        >
                            {selectedNode.status === 'locked' ? 'YÊU CẦU CẤP ĐỘ CAO HƠN' : 'TU LUYỆN NGAY'}
                        </button>
                    </>
                ) : (
                    <p style={{ color: '#666' }}>Hãy chọn một kỹ năng trên cây để xem chi tiết công dụng và yêu cầu tu luyện.</p>
                )}
            </div>
        </div>
    );
}

export default SkillTree;
