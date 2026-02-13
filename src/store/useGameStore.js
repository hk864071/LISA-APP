
import { create } from 'zustand';
import { supabase } from '../lib/supabaseClient';

const useGameStore = create((set, get) => ({
    // Trạng thái cơ bản
    characterInfo: {
        nickname: 'Đại Hiệp',
        tribe: 'BEAMJOY',
        evolutionStage: 1, // Stage 1-3 (Tương đương 3 cấp độ hình ảnh)
        totalSpeakingSeconds: 0,
    },
    currentLevel: 1, // Level học tập (1-100)
    coins: 0,
    isMuted: false,

    // Hành động (Actions)
    setMuted: (muted) => set({ isMuted: muted }),

    setConfig: (config) => set((state) => ({
        ...state,
        ...config
    })),

    // Cập nhật thời gian nói và kiểm tra tiến hóa (Level 1 -> 2 -> 3)
    updateSpeakingTime: (seconds) => {
        set((state) => {
            const newTotalSeconds = state.characterInfo.totalSpeakingSeconds + seconds;
            let newStage = state.characterInfo.evolutionStage;

            // Logic tiến hóa (Giả định: 15 phút -> Stage 2, 60 phút -> Stage 3)
            if (newTotalSeconds >= 3600 && newStage < 3) {
                newStage = 3;
                console.log("Đại hiệp đã âm thầm đột phá lên Stage 3!");
            } else if (newTotalSeconds >= 900 && newStage < 2) {
                newStage = 2;
                console.log("Đại hiệp đã âm thầm đột phá lên Stage 2!");
            }

            // Tăng coin mỗi giây nói (game hóa nhẹ)
            const newCoins = state.coins + Math.floor(seconds / 10);

            return {
                characterInfo: {
                    ...state.characterInfo,
                    totalSpeakingSeconds: newTotalSeconds,
                    evolutionStage: newStage,
                },
                coins: newCoins,
            };
        });
    },

    // Đồng bộ dữ liệu với Supabase
    syncWithSupabase: async () => {
        const state = get();
        const { characterInfo, coins, currentLevel } = state;

        // Check if user is logged in
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return; // Không làm gì nếu chưa login

        // Call Supabase upsert
        const { error } = await supabase
            .from('profiles')
            .upsert({
                id: user.id,
                nickname: characterInfo.nickname,
                tribe: characterInfo.tribe,
                avatar_stage: characterInfo.evolutionStage, // Map state `evolutionStage` to DB `avatar_stage`
                total_speaking_seconds: characterInfo.totalSpeakingSeconds,
                coins: coins,
                current_level: currentLevel,
                updated_at: new Date(),
            });

        if (error) {
            console.error('Error syncing with Supabase:', error);
        }
    },

    // Hàm load dữ liệu ban đầu từ Supabase khi người dùng login
    loadProfile: async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .maybeSingle();

        if (data && !error) {
            set({
                characterInfo: {
                    nickname: data.nickname || 'Đại Hiệp',
                    tribe: data.tribe || 'BEAMJOY',
                    evolutionStage: data.avatar_stage || 1,
                    totalSpeakingSeconds: data.total_speaking_seconds || 0,
                },
                coins: data.coins || 0,
                currentLevel: data.current_level || 1,
            });
        }
    }
}));

export default useGameStore;
