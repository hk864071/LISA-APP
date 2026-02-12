import React, { useState } from 'react';
import { aiTutors } from './data';
import Login from './components/Login';
import TribeSelection from './components/TribeSelection';
import CharacterSelection from './components/CharacterSelection';
import NamingScreen from './components/NamingScreen';
import TrainingRoom from './components/TrainingRoom';
import RoomList from './components/RoomList';
import LevelUpModal from './components/LevelUpModal';
import CharacterProfile from './components/CharacterProfile';
import SkillTree from './components/SkillTree';
import WorldMap from './components/WorldMap';
import './index.css';
import './App.css';

function App() {
  const [view, setView] = useState('login'); // login | tribe-select | char-select | naming | home | room-list | room | character | skills | world-map
  const [selectedTribe, setSelectedTribe] = useState(null);
  const [selectedChar, setSelectedChar] = useState(null);
  const [charName, setCharName] = useState('');

  // Game State
  const [level, setLevel] = useState(1);
  const [xp, setXP] = useState(0);
  const [activeRoom, setActiveRoom] = useState(null);
  const [showLevelUp, setShowLevelUp] = useState(false);

  const handleLogin = () => setView('tribe-select');

  const handleSelectTribe = (tribe) => {
    setSelectedTribe(tribe);
    setView('char-select');
  };

  const handleSelectChar = (char) => {
    setSelectedChar(char);
    setView('naming');
  };

  const handleFinishNaming = (name) => {
    setCharName(name);
    setView('home');
  };

  const handleJoinRoom = (room) => {
    setActiveRoom(room);
    setView('room');
  }

  const handleCreateRoomFromProfile = (roomConfig) => {
    // Create a new room object based on config
    const newRoom = {
      id: Date.now(),
      host: 'You',
      ...roomConfig,
      participants: 1
    };
    setActiveRoom(newRoom);
    setView('room');
  };

  const handleGainXP = (amount) => {
    if (level >= 3) return; // Max level
    const maxXP = level * 100;
    const newXP = xp + amount;

    if (newXP >= maxXP) {
      setXP(0);
      handleLevelUp();
    } else {
      setXP(newXP);
    }
  };

  const handleLevelUp = () => {
    if (level < 3) {
      console.log('Leveling up from', level);
      setLevel(prev => prev + 1);
      setShowLevelUp(true); // Trigger visual effect
    } else {
      alert("Đã đạt cảnh giới tối cao!");
    }
  };

  const closeLevelUp = () => {
    setShowLevelUp(false);
  }

  // View Routing
  if (view === 'login') return <Login onLogin={handleLogin} />;
  if (view === 'tribe-select') return <TribeSelection onSelectTribe={handleSelectTribe} />;
  if (view === 'char-select') return <CharacterSelection tribe={selectedTribe} onSelectCharacter={handleSelectChar} onBack={() => setView('tribe-select')} />;
  if (view === 'naming') return <NamingScreen character={selectedChar} tribe={selectedTribe} onFinish={handleFinishNaming} />;

  if (view === 'room-list') return <RoomList onJoinRoom={handleJoinRoom} onBack={() => setView('home')} />;
  if (view === 'character') return <CharacterProfile character={selectedChar} level={level} tribe={selectedTribe} onBack={() => setView('home')} onChangeCharacter={() => setView('char-select')} onCreateRoom={handleCreateRoomFromProfile} />;
  if (view === 'skills') return <SkillTree onBack={() => setView('home')} />;
  if (view === 'world-map') return <WorldMap onBack={() => setView('home')} onCreateRoom={handleCreateRoomFromProfile} tribe={selectedTribe} />;

  if (view === 'room') return (
    <>
      {showLevelUp && (
        <LevelUpModal
          oldLevel={level - 1}
          newLevel={level}
          character={selectedChar}
          onClose={closeLevelUp}
        />
      )}
      <TrainingRoom
        character={selectedChar}
        userAvatar={selectedChar.evolutions[level - 1] || selectedChar.evolutions[0]}
        tribe={selectedTribe}
        level={level}
        xp={xp}
        onGainXP={handleGainXP}
        onLevelUp={handleLevelUp}
        onLeave={() => setView('home')}
        roomInfo={activeRoom}
        isHost={activeRoom?.host === 'You'}
      />
    </>
  );

  return (
    <div className="game-ui" style={{ backgroundImage: `url('${selectedTribe?.background}')` }}>
      <div className="login-overlay" style={{ opacity: 0.6 }}></div>

      {showLevelUp && (
        <LevelUpModal
          oldLevel={level - 1}
          newLevel={level}
          character={selectedChar}
          onClose={closeLevelUp}
        />
      )}

      {/* HUD: Top Left */}
      <div className="game-hud-top">
        <div className="char-portrait">
          <img src={encodeURI(selectedChar.evolutions[level - 1] || selectedChar.evolutions[0])} alt="Portrait" />
        </div>
        <div className="hud-stats">
          <div style={{ marginBottom: '0.2rem' }}>
            <span className="gold-text" style={{ fontSize: '1rem' }}>{charName}</span>
            <span style={{ fontSize: '0.7rem', color: '#888', marginLeft: '10px' }}>Lv. {level} {selectedTribe.name}</span>
          </div>
          <div className="stat-bar">
            <span className="stat-label">Công Lực (XP)</span>
            <div className="stat-fill hp-fill" style={{ width: `${Math.min((xp / (level * 100)) * 100, 100)}%` }}></div>
          </div>
          <div className="stat-bar">
            <span className="stat-label">Cấp Độ (Evolution)</span>
            <div className="stat-fill xp-fill" style={{ width: `${(level / 3) * 100}%`, background: 'var(--gold)' }}></div>
          </div>
        </div>
      </div>

      {/* Quest Log: Top Right */}
      <div className="quest-log glass-premium" style={{ padding: '1rem' }}>
        <h3 className="gold-text" style={{ fontSize: '0.8rem', marginBottom: '1rem' }}>Nhiệm Vụ Tu Luyện</h3>
        <div className="quest-item">
          <div className="quest-title">Sơ Nhập Giang Hồ</div>
          <div className="quest-desc">Gặp gỡ Đại Sư AI để học cách xưng hô.</div>
        </div>
        <div className="quest-item">
          <div className="quest-title">Khẩu Quyết Nhập Môn</div>
          <div className="quest-desc">Luyện tập 10 từ vựng về đao kiếm.</div>
        </div>
      </div>

      {/* Center Character */}
      <div className="game-center-char">
        <img src={encodeURI(selectedChar.evolutions[level - 1] || selectedChar.evolutions[0])} alt="Character" className="game-char-main" />
      </div>

      {/* Bottom Menu */}
      <div className="game-menu-bottom">
        <div className="menu-btn" onClick={() => setView('character')}>
          <i className="fa-solid fa-user-ninja"></i>
          <span>Nhân Vật</span>
        </div>
        <div className="menu-btn" onClick={() => setView('skills')}>
          <i className="fa-solid fa-scroll"></i>
          <span>Kỹ Năng</span>
        </div>
        <div className="menu-btn" onClick={() => setView('room-list')}>
          <i className="fa-solid fa-people-group"></i>
          <span>Thảo Luận</span>
        </div>
        <div className="menu-btn" onClick={() => alert('Feature coming soon!')}>
          <i className="fa-solid fa-bag-shopping"></i>
          <span>Thương Thành</span>
        </div>
        <div className="menu-btn" onClick={() => setView('world-map')}>
          <i className="fa-solid fa-map-location-dot"></i>
          <span>Bản Đồ</span>
        </div>
      </div>

      <div className="copyright" style={{ bottom: '1rem', opacity: 0.3 }}>
        LISA WUXIA WORLD - HỌC TIẾNG ANH NHƯ CHƠI GAME
      </div>
    </div>
  );
}

export default App;
