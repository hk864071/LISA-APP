import React, { useState, useEffect } from 'react';

const loginData = [
    {
        char: "/assets/Tribe 1 - MINDORA/tribe 1 - character/Mel/Mel3.png",
        bg: "/assets/Tribe 1 - MINDORA/Tribe 1 - Background/Bg Mindora (1).png",
        color: "#c9a66b" // Gold
    },
    {
        char: "/assets/Tribe 1 - COREFIRE/tribe 1 - character/Sparky/Sparky 3.png",
        bg: "/assets/Tribe 1 - COREFIRE/Tribe 1 - Background/IMG_7061.JPG",
        color: "#ff4d4d" // Red
    },
    {
        char: "/assets/Tribe 1 - THAROK/Tribe 1- Character/TATO/TATO LV 3.png",
        bg: "/assets/Tribe 1 - THAROK/Tribe 1 - THAROK Background/624126104_1543806710068145_3238655200353009991_n.jpg",
        color: "#4dff88" // Green
    },
    {
        char: "/assets/Tribe 1  - BEAMJOY/Tribe 1 - Character/Flora/0702_Lisa Task_Flora 3_ThanhTâm.png",
        bg: "/assets/Tribe 1  - BEAMJOY/Tribe 1 - Background/bg beamjoy.png",
        color: "#4db8ff" // Blue
    }
];

function Login({ onLogin }) {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setIndex((prev) => (prev + 1) % loginData.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    const current = loginData[index];

    return (
        <div className="login-screen" style={{ backgroundImage: `url('${current.bg}')` }}>
            <div className="login-overlay"></div>

            <div className="login-container">
                {/* Form Section */}
                <div className="login-box glass-premium">
                    <div className="login-header">
                        <h1 className="gold-text-dynamic" style={{ '--accent': current.color }}>LISA</h1>
                        <h2 className="gold-text-sub">KIẾM THIÊN ANH NGỮ</h2>
                    </div>

                    <div className="input-group-premium">
                        <label>Danh Tánh</label>
                        <input type="text" placeholder="Nhập danh tánh đại hiệp..." defaultValue="Đại Hiệp" />
                    </div>

                    <div className="input-group-premium">
                        <label>Mật Mã</label>
                        <input type="password" placeholder="••••••••" defaultValue="password" />
                    </div>

                    <button className="wuxia-btn-premium" style={{ '--accent': current.color }} onClick={onLogin}>
                        BƯỚC VÀO GIANG HỒ
                    </button>

                    <div className="login-footer-links">
                        <span>Quên Mật Mã</span>
                        <span>Đăng Ký</span>
                        <span>Cố Sự</span>
                    </div>
                </div>

                {/* Character Section */}
                <div className="login-character-container">
                    <img
                        key={index}
                        src={current.char}
                        alt="Wuxia Character"
                        className="login-character"
                    />
                    <div className="login-char-aura" style={{ '--aura-color': current.color }}></div>
                </div>
            </div>

            <div className="copyright">
                LISA PROJECT &copy; 2026 - VIETNAM WUXIA ENGLISH LEARNING
            </div>
        </div>
    );
}

export default Login;
