
// Logic for Leveling System based on Wuxia stages
// Stage 1 (Levels 1-30): Sơ Nhập Giang Hồ -> Evolutions[0]
// Stage 2 (Levels 31-60): Cao Thủ Võ Lâm -> Evolutions[1]
// Stage 3 (Levels 61-100): Đại Sư Tông Sư -> Evolutions[2]
// Stage 4 (Levels 100+): Huyền Thoại (Star) -> Special Effects

export const LEVEL_CAP = 999;

export const getRankTitle = (level) => {
    if (level <= 30) return "Sơ Nhập";
    if (level <= 60) return "Cao Thủ";
    if (level <= 100) return "Đại Sư";
    return `Huyền Thoại ★${level - 100}`; // Star
};

export const getDisplayLevel = (level) => {
    if (level <= 100) return `Lv. ${level}`;
    return `★ ${level - 100}`;
};

export const getEvolutionIndex = (level) => {
    if (level <= 30) return 0;
    if (level <= 60) return 1;
    // For level > 60, use the last evolution (index 2)
    return 2;
};

export const getMaxXP = (level) => {
    // Simple progression: Level * 100
    // Or more complex: 100 * (1.1 ^ (level - 1))
    return level * 100;
};

export const getStageInfo = (level) => {
    if (level <= 30) return { stage: 1, name: "Phàm Nhân", maxLevel: 30 };
    if (level <= 60) return { stage: 2, name: "Tu Tiên", maxLevel: 60 };
    if (level <= 100) return { stage: 3, name: "Hóa Thần", maxLevel: 100 };
    return { stage: 4, name: "Phi Thăng", maxLevel: LEVEL_CAP };
};
