
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { supabase } from './lib/supabaseClient';
import { sendGlobalChatMessage } from './lib/firebaseClient';
import useGameStore from './store/useGameStore';
import { aiTutors, tribes } from './data';
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
import GlobalChat from './components/GlobalChat';
import './index.css';
import './index.css';
import './App.css';
import './App.css';
import { getRankTitle, getEvolutionIndex, getMaxXP, LEVEL_CAP, getDisplayLevel } from './utils/levelSystem';

function App() {
  const [view, setView] = useState('login'); // login | tribe-select | char-select | naming | home | room-list | room | character | skills | world-map
  const [selectedTribe, setSelectedTribe] = useState(null);
  const [selectedChar, setSelectedChar] = useState(null);
  const [charName, setCharName] = useState('');
  const [isProfileLoaded, setIsProfileLoaded] = useState(false);

  // Game State
  const level = useGameStore((state) => state.currentLevel);
  const xp = useGameStore((state) => state.xp);
  const addXP = useGameStore((state) => state.addXP);
  const setLevel = useGameStore((state) => state.setLevel);

  const [activeRoom, setActiveRoom] = useState(null);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const prevLevelRef = useRef(level);

  // Monitor Level Up
  useEffect(() => {
    // Prevent level up effect triggers during initial profile load
    if (!isProfileLoaded) {
      prevLevelRef.current = level;
      return;
    }

    if (level > prevLevelRef.current) {
      handleLevelUpEffect();
    }
    prevLevelRef.current = level;
  }, [level, isProfileLoaded]);

  // --- AUDIO MANAGER ---
  const audioRefs = useRef({
    // lobby: new Audio('/assets/sounds/lobby_theme.mp3'),
    // levelUp: new Audio('/assets/sounds/level_up.mp3'),
    // evolution: new Audio('/assets/sounds/evolution.mp3'),
    // training: new Audio('/assets/sounds/training_bgm.mp3')
    lobby: new Audio(),
    levelUp: new Audio(),
    evolution: new Audio(),
    training: new Audio()
  });

  useEffect(() => {
    // Basic BGM Logic - DISABLED (Files are empty 0KB)
    // const audios = audioRefs.current;
    // audios.lobby.loop = true;
    // audios.training.loop = true;
    // audios.lobby.volume = 0.3;
    // audios.training.volume = 0.3;

    // if (view === 'room') {
    //   audios.lobby.pause();
    //   audios.training.play().catch(e => console.log("Audio play failed (user interaction needed)", e));
    // } else {
    //   audios.training.pause();
    //   // audios.lobby.play().catch(e => console.log("Audio play failed", e)); 
    // }
  }, [view]);

  // Unlock Audio Context on first interaction
  useEffect(() => {
    // const unlockAudio = () => {
    //   audioRefs.current.lobby.play().then(() => {
    //     audioRefs.current.lobby.pause();
    //   }).catch(() => { });
    //   window.removeEventListener('click', unlockAudio);
    // };
    // window.addEventListener('click', unlockAudio);
    // return () => window.removeEventListener('click', unlockAudio);
  }, []);

  // Store actions
  const loadProfile = useGameStore((state) => state.loadProfile);
  const setConfig = useGameStore((state) => state.setConfig);
  const syncWithSupabase = useGameStore((state) => state.syncWithSupabase);
  const characterInfo = useGameStore((state) => state.characterInfo);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        handleUserSession();
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        handleUserSession();
      } else {
        setView('login');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleUserSession = async () => {
    await loadProfile();
    setIsProfileLoaded(true); // Mark profile as loaded to enable level up listeners
    const state = useGameStore.getState();
    const { tribe, character, nickname } = state.characterInfo;

    // Route based on what we have
    if (tribe) {
      const tribeObj = tribes.find(t => t.id === tribe);
      if (tribeObj) {
        setSelectedTribe(tribeObj);

        if (character) {
          const charObj = tribeObj.characters.find(c => c.name === character);
          if (charObj) {
            setSelectedChar(charObj);

            if (nickname && nickname !== 'Đại Hiệp') {
              setCharName(nickname);
              setView('home'); // Fully restored
              return;
            }

            setView('naming'); // Character picked but not named
            return;
          }
        }

        setView('char-select'); // Tribe picked but not character
        return;
      }
    }
    setView('tribe-select');
  };

  const handleSelectTribe = (tribe) => {
    setSelectedTribe(tribe);
    setConfig({
      characterInfo: { ...useGameStore.getState().characterInfo, tribe: tribe.id }
    });
    // Save immediate progress
    setTimeout(() => syncWithSupabase(), 0);
    setView('char-select');
  };

  const handleSelectChar = (char) => {
    setSelectedChar(char);
    setConfig({
      characterInfo: { ...useGameStore.getState().characterInfo, character: char.name }
    });
    setTimeout(() => syncWithSupabase(), 0);
    setView('naming');
  };

  const handleFinishNaming = (name) => {
    setCharName(name);
    setConfig({
      characterInfo: { ...useGameStore.getState().characterInfo, nickname: name }
    });
    syncWithSupabase();
    setView('home');
  };

  const handleJoinRoom = (room) => {
    setActiveRoom(room);
    setView('room');
  }

  const handleCreateRoomFromProfile = (roomConfig) => {
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
    if (level >= LEVEL_CAP) return; // Max level
    const maxXP = getMaxXP(level);
    addXP(amount, maxXP);
  };

  const handleLevelUpEffect = () => {
    console.log('Leveling up to', level);

    // Play Sound - DISABLED
    const isEvo = level === 31 || level === 61 || level === 101;

    // SERVER-WIDE NOTIFICATION
    if (isEvo) {
      const rankTitle = getRankTitle(level);
      const msg = `Chúc mừng ${charName} đã đột phá cảnh giới, thăng cấp lên ${rankTitle}!`;
      sendGlobalChatMessage("HỆ THỐNG", msg, "https://cdn-icons-png.flaticon.com/512/10626/10626573.png"); // System Icon
    }

    // if (isEvo) {
    //   audioRefs.current.evolution.currentTime = 0;
    //   audioRefs.current.evolution.play().catch(e => { });
    // } else {
    //   audioRefs.current.levelUp.currentTime = 0;
    //   audioRefs.current.levelUp.play().catch(e => { });
    // }

    setShowLevelUp(true);
  };

  const handleLevelUp = () => {
    // Debug function to force level up
    setLevel(level + 1);
  };

  const closeLevelUp = () => {
    setShowLevelUp(false);
  }

  // View Routing
  if (view === 'login') return <Login />;
  if (view === 'tribe-select') return <TribeSelection onSelectTribe={handleSelectTribe} />;
  if (view === 'char-select') return <CharacterSelection tribe={selectedTribe} onSelectCharacter={handleSelectChar} onBack={() => setView('tribe-select')} />;
  if (view === 'naming') return <NamingScreen character={selectedChar} tribe={selectedTribe} onFinish={handleFinishNaming} />;

  if (view === 'room-list') return (
    <>
      <RoomList onJoinRoom={handleJoinRoom} onBack={() => setView('home')} />
      <GlobalChat />
    </>
  );
  if (view === 'character') return (
    <>
      <CharacterProfile character={selectedChar} level={level} tribe={selectedTribe} onBack={() => setView('home')} onChangeCharacter={() => setView('char-select')} onCreateRoom={handleCreateRoomFromProfile} />
      <GlobalChat />
    </>
  );
  if (view === 'skills') return (
    <>
      <SkillTree onBack={() => setView('home')} />
      <GlobalChat />
    </>
  );
  if (view === 'world-map') return (
    <>
      <WorldMap onBack={() => setView('home')} onCreateRoom={handleCreateRoomFromProfile} tribe={selectedTribe} level={level} />
      <GlobalChat />
    </>
  );

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
        userAvatar={selectedChar.evolutions[getEvolutionIndex(level)] || selectedChar.evolutions[0]}
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
          isEvolution={level === 31 || level === 61 || level === 101}
        />
      )}

      {/* HUD: Top Left */}
      <div className="game-hud-top">
        <div className="char-portrait">
          <img src={encodeURI(selectedChar.evolutions[getEvolutionIndex(level)] || selectedChar.evolutions[0])} alt="Portrait" />
        </div>
        <div className="hud-stats">
          <div style={{ marginBottom: '0.2rem' }}>
            <span className="gold-text" style={{ fontSize: '1rem' }}>{charName}</span>
            <span style={{ fontSize: '0.7rem', color: '#888', marginLeft: '10px' }}>{getDisplayLevel(level)} - {getRankTitle(level)}</span>
          </div>
          <div className="stat-bar">
            <span className="stat-label">Công Lực (XP)</span>
            <div className="stat-fill hp-fill" style={{ width: `${Math.min((xp / getMaxXP(level)) * 100, 100)}%` }}></div>
          </div>
          <div className="stat-bar">
            <span className="stat-label">Cảnh Giới (Stage)</span>
            {/* Show progress towards next evolution or just a filler */}
            <div className="stat-fill xp-fill" style={{ width: `${(level % 30) / 30 * 100}%`, background: 'var(--gold)' }}></div>
          </div>
          {/* TEST BUTTON */}
          {/* TEST BUTTON - JUMP STAGE */}
          {/* TEST BUTTON - JUMP STAGE */}
          <div style={{ display: 'flex', gap: '5px', marginTop: '1rem' }}>
            <button
              onClick={handleLevelUp}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid #555',
                color: '#aaa',
                fontSize: '0.6rem',
                cursor: 'pointer',
                padding: '2px 5px'
              }}
            >
              [+1 LVL]
            </button>
            <button
              onClick={() => {
                if (level < 31) setLevel(31);
                else if (level < 61) setLevel(61);
                else setLevel(1);
                setShowLevelUp(true);
              }}
              style={{
                background: 'rgba(255, 215, 0, 0.2)',
                border: '1px solid #ffd700',
                color: '#ffd700',
                fontSize: '0.6rem',
                cursor: 'pointer',
                padding: '2px 5px',
                fontWeight: 'bold'
              }}
            >
              [+30 STAGE]
            </button>
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
      {/* Center Character */}
      <div className="game-center-char">
        <motion.div
          style={{
            position: 'absolute',
            bottom: '-20px',
            left: '50%',
            transform: 'translate(-50%, 0)',
            width: '600px',
            height: '200px',
            background: 'radial-gradient(ellipse at center, rgba(255, 215, 0, 0.15) 0%, transparent 70%)',
            filter: 'blur(40px)',
            zIndex: -1,
            pointerEvents: 'none'
          }}
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.img
          src={encodeURI(selectedChar.evolutions[getEvolutionIndex(level)] || selectedChar.evolutions[0])}
          alt="Character"
          className="game-char-main"
          animate={{
            y: [0, -15, 0],
            filter: ["brightness(1) drop-shadow(0 0 0px transparent)", "brightness(1.1) drop-shadow(0 0 20px rgba(255, 215, 0, 0.5))", "brightness(1) drop-shadow(0 0 0px transparent)"]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
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

      <GlobalChat />

      <div className="copyright" style={{ bottom: '1rem', opacity: 0.3 }}>
        LISA WUXIA WORLD - HỌC TIẾNG ANH NHƯ CHƠI GAME
      </div>
    </div>
  );
}

export default App;
