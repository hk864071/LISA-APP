import React, { useState } from 'react';

function NamingScreen({ character, tribe, onFinish }) {
    const [name, setName] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (name.trim()) {
            onFinish(name.trim());
        }
    };

    return (
        <div className="naming-screen" style={{ backgroundImage: `url('${tribe?.background}')` }}>
            <div className="login-overlay"></div>

            <div className="naming-container">
                <div className="naming-box glass-premium">
                    <h2 className="gold-text-dynamic" style={{ fontSize: '2.5rem' }}>ĐẶT TÊN NHÂN VẬT</h2>
                    <p style={{ color: '#aaa', marginBottom: '2rem', letterSpacing: '1px' }}>
                        Đại hiệp hãy để lại danh tánh để chư vị anh hùng tiện bề xưng hô.
                    </p>

                    <form onSubmit={handleSubmit}>
                        <div className="input-group-premium">
                            <label>Hào Danh</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Nhập hào danh của bạn..."
                                autoFocus
                                maxLength={20}
                            />
                        </div>

                        <button type="submit" className="wuxia-btn-premium" disabled={!name.trim()}>
                            XÁC NHẬN NHẬP MÔN
                        </button>
                    </form>
                </div>

                <div className="naming-char-preview">
                    <img
                        src={encodeURI(character.evolutions[2])}
                        alt="Character Preview"
                        className="naming-character"
                    />
                    <div className="login-char-aura"></div>
                </div>
            </div>
        </div>
    );
}

export default NamingScreen;
