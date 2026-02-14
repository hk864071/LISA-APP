# LISA Wuxia English Learning - Comprehensive Sitemap & Roadmap

## 1. Core Architecture (Current State)

### A. Authentication & Onboarding
- **Login Screen** (`src/components/Login.jsx`)
  - **Function:** Main entry point. Rotating showcase of 4 Tribes.
  - **Tech:** Supabase OAuth (Google).
  - **Flow:** `Login` -> Check User Profile ? `Home` : `TribeSelection`.

- **Tribe Selection** (`src/components/TribeSelection.jsx`)
  - **Function:** Introduction to the 4 main factions (Beamjoy, Corefire, Mindora, Tharok).
  - **Assets:** Rich background imagery & lore descriptions.
  - **State:** Saves `tribe_id` to local state.

- **Character Selection** (`src/components/CharacterSelection.jsx`)
  - **Function:** User chooses their Avatar (Visual Representation).
  - **Features:** 
    - Displays 3 evolutionary stages per character.
    - Stats: Age, Weapon, Personality.
    - Hover effects for immersive feel.
  - **State:** Saves `character_id` to local state.

- **Naming Screen** (`src/components/NamingScreen.jsx`)
  - **Function:** User finalizes identity with a "Hào Danh" (Nickname).
  - **Action:** Commits full profile to Supabase Database.
  - **Transition:** Launches into the Game World (Home).

### B. The Main Hub (Lobby)
- **Home Screen** (`src/App.jsx`)
  - **HUD (Heads-Up Display):**
    - **Top Left:** User Avatar, Level, Rank Title (e.g., "Sơ Nhập", "Cao Thủ"), XP Bar, Stage Progress.
    - **Top Right:** Active Quest Log (Objectives).
  - **Central Stage:**
    - High-quality 3D/2D animated character model floating in the center.
    - Dynamic lighting/aura effects based on Tribe.
  - **Navigation Dock (Bottom):**
    - **Nhân Vật (Character Profile)**
    - **Kỹ Năng (Skill Tree)**
    - **Thảo Luận (Social/Room List)**
    - **Thương Thành (Shop - Locked)**
    - **Bản Đồ (World Map)**

### C. Learning & Gameplay Modules
- **Social Dojo (Room List)** (`src/components/RoomList.jsx`)
  - **Listing:** Server-side list of active learning rooms.
  - **Filtering:** By Level Cap (Beginner, Intermediate, Advanced) and Topics.
  - **Room Creation (Lập Đàn):**
    - **Step 1:** Select Level (Unlockable by User Level).
    - **Step 2:** Select Map Environment (Visuals).
    - **Step 3:** Select Learning Topic (Content).

- **Training Room (The Classroom)** (`src/components/TrainingRoom.jsx`)
  - **Core Interaction:** Real-time learning environment.
  - **Visuals:** Background determined by Map selection.
  - **Features:**
    - **"Peeking Characters":** Random Tribe members appear to give tips or just say hi (Engagement).
    - **Vocabulary Cycle:** Rotates through lesson words.
    - **Reactions:** Real-time emoji feedback from other users.
    - **Microphone Integration:** (Foundation laid for voice).

- **World Map** (`src/components/WorldMap.jsx`)
  - **Visuals:** Scrollable map of the Wuxia world.
  - **Nodes:** Representative locations for each Tribe.
  - **Unlocking:** Nodes unlock as user levels up (Level 1, 10, 30, etc.).

---

## 2. Future Roadmap & Development Focus (Tương Lai)

### 🌟 Phase 1: Deep RPG Mechanics (Cơ Chế Nhập Vai Sâu Sắc)
1.  **Equipment System (Trang Bị):**
    *   **Concept:** Users earn gold/tokens to buy "Pen of Wisdom", "Scroll of Grammar", etc.
    *   **Effect:** Items boost XP gain or unlock special visual effects in chat.
2.  **Pet System (Linh Thú):**
    *   **Concept:** Small companions that follow the character.
    *   **Utility:** finding hidden vocabulary words in the UI or giving daily hints.
3.  **Achievement Titles (Danh Hiệu):**
    *   **Unlock:** "Grammar Master", "Vocab King", "Speed Typer".
    *   **Display:** Show title next to name in Global Chat and Rooms.

### 🤖 Phase 2: AI & Personalized Learning (Trí Tuệ Nhân Tạo)
1.  **AI Sensei Integration (Sư Phụ AI):**
    *   **Feature:** A chatbot "Master" specific to each Tribe (e.g., Master Flora for Beamjoy).
    *   **Function:** Users can ask grammar questions directly in the Training Room.
    *   **Tech:** Integration with OpenAI/Gemini API for context-aware answers.
2.  **Voice Recognition Challenges (Luyện Âm):**
    *   **Feature:** The game listens to user pronunciation.
    *   **Action:** User must shout a "Spell" (English word) correctly to cast a skill/attack.

### ⚔️ Phase 3: Collaborative Learning & Interaction (Tương Tác Học Tập)
1.  **Vocabulary Duel (Luận Kiếm - PvP):**
    *   **Concept:** 1v1 Vocabulary Duel to see who answers faster accurately.
    *   **Focus:** Competitive motivation to learn fast-reflex vocabulary.
2.  **Co-op Boss Raids (Hợp Công Yêu Thú):**
    *   **Concept:** A group of 3-5 users enters a room to fight a "Grammar Demon" Boss.
    *   **Mechanic:** Users must answer questions correctly to deal damage. If they get it wrong, the Boss deals damage to the whole team. Requires teamwork and collective knowledge.
3.  **Apprenticeship System (Sư Đồ):**
    *   **Feature:** High-level users (Senpai) can "recruit" low-level users (Juniors) to guide them.
    *   **Benefit:** Mentors get special badges; Apprentices get learning boosts. Fosters a supportive community instead of a warring one.

### 🎭 Phase 4: Expansion & Immersion (Mở Rộng & Trải Nghiệm)
1.  **AI Roleplay Scenarios (Kịch Bản Nhập Vai):**
    *   **Feature:** Instead of unstructured voice chat, users enter specific "Stories" (e.g., Negotiating with a Shopkeeper, Defending the Sect Gate).
    *   **Interaction:** Users speak lines or type responses to AI NPCs to progress the story.
2.  **Offline Meditation (Tu Luyện Bế Quan):**
    *   **Feature:** Download lessons to practice without internet.
3.  **Mobile App (Thần Hành Phù):**
    *   **Goal:** Native mobile version for on-the-go learning.

## 3. Technical Debt & Optimization (Cần Tập Trung)
- [ ] **Performance:** Optimize 3D/High-res image loading (Lazy loading assets).
- [ ] **Security:** Secure Supabase Row Level Security (RLS) policies for user data.
- [ ] **State Management:** Refine Zustand store to handle complex inventory/quest data efficiently.
- [ ] **SEO/Sharing:** Add Open Graph tags so users can share their "Level Up" cards on social media.
