
import { create } from 'zustand';
import { supabase } from '../lib/supabaseClient';

const useGameStore = create((set, get) => ({
    // Trạng thái cơ bản
    characterInfo: {
        nickname: 'Đại Hiệp',
        tribe: 'BEAMJOY',
        character: null,
        evolutionStage: 1, // Stage 1-3 (Tương đương 3 cấp độ hình ảnh)
        totalSpeakingSeconds: 0,
    },
    currentLevel: 1, // Level học tập (1-100)
    xp: 0,
    coins: 0,
    isMuted: false,
    rooms: [], // Cached rooms

    // Hành động (Actions)
    setMuted: (muted) => set({ isMuted: muted }),

    setConfig: (config) => set((state) => ({
        ...state,
        ...config
    })),

    // --- GAME PROGRESSION ---
    addXP: (amount, maxXP) => {
        set((state) => {
            let newXP = state.xp + amount;
            let newLevel = state.currentLevel;
            let leveledUp = false;

            // Simple level up logic (can be replaced by util call if importable)
            if (newXP >= maxXP) {
                newXP = newXP - maxXP;
                newLevel += 1;
                leveledUp = true;
            }

            return { xp: newXP, currentLevel: newLevel };
        });
        // Auto sync after XP gain
        get().syncWithSupabase();
    },

    setLevel: (lvl) => set({ currentLevel: lvl }),
    setXP: (val) => set({ xp: val }),

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

    // --- SUPABASE SYNC ---
    syncWithSupabase: async () => {
        const state = get();
        const { characterInfo, coins, currentLevel, xp } = state;

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
                character: characterInfo.character,
                avatar_stage: characterInfo.evolutionStage, // Map state `evolutionStage` to DB `avatar_stage`
                total_speaking_seconds: characterInfo.totalSpeakingSeconds,
                coins: coins,
                xp: xp,
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
                    character: data.character || null,
                    evolutionStage: data.avatar_stage || 1,
                    totalSpeakingSeconds: data.total_speaking_seconds || 0,
                },
                coins: data.coins || 0,
                xp: data.xp || 0,
                currentLevel: data.current_level || 1,
            });
        }
    },

    // --- ROOM LOGIC ---
    isLoadingRooms: false,

    fetchRooms: async () => {
        set({ isLoadingRooms: true });
        console.log('🔍 Fetching rooms from Supabase...');
        const { data, error } = await supabase
            .from('rooms')
            .select('*')
            .eq('is_active', true)
            .order('created_at', { ascending: false });

        set({ isLoadingRooms: false });

        if (error) {
            console.error('❌ Error fetching rooms:', error);
            return;
        }

        console.log('📋 Rooms found:', data?.length || 0, data);

        if (data) {
            set({ rooms: data });
        }
    },

    // Track active channel and its status
    activeChannel: null,

    subscribeToRooms: () => {
        const state = get();

        // Singleton pattern: If channel already exists and is not closed, don't re-subscribe
        if (state.activeChannel) {
            console.log('⚡ Using existing Realtime subscription.');
            return () => {
                // Return an empty cleanup because the store keeps the connection alive
                // This prevents the "mount -> unmount -> mount" loop from killing the socket
            };
        }

        console.log('📡 Initializing Stable Realtime connection...');
        const channel = supabase
            .channel('room_updates_singleton')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'rooms',
                },
                (payload) => {
                    console.log('🎲 Realtime Update:', payload.eventType, payload.new?.name || '');
                    get().fetchRooms();
                }
            )
            .subscribe((status) => {
                if (status === 'SUBSCRIBED') {
                    console.log('✅ Realtime Subscribed. Fetching initial data...');
                    get().fetchRooms(); // Force fetch as soon as we are live
                } else if (status === 'CLOSED') {
                    console.log('🔌 Realtime Closed.');
                    set({ activeChannel: null });
                } else if (status === 'CHANNEL_ERROR') {
                    console.error('❌ Realtime Error: Check if "Realtime" is enabled for table "rooms" in Supabase Dashboard.');
                    set({ activeChannel: null });
                }
            });

        set({ activeChannel: channel });

        // For Global Store, we usually want the connection to stay alive 
        // while the user is in the Lobby/RoomList area.
        return () => {
            // We can choose to cleanup here, but to avoid the StrictMode race condition,
            // we'll use a small timeout or just let the singleton persist until refreshed.
            // For now, let's NOT remove it immediately to satisfy React Strict Mode.
            setTimeout(() => {
                // Only cleanup if the channel is still exactly this one (not a new one)
                // and if we really want to save resources. 
                // In many SPAs, keeping one channel for rooms is fine.
            }, 1000);
        };
    },

    // --- ROOM ACTIONS ---
    createRoom: async (name, topic, level, background) => {
        const user = await supabase.auth.getUser().then(({ data }) => data.user);
        if (!user) return null;

        const roomData = {
            host_id: user.id,
            name: name,
            topic: topic,
            background_image: background,
            current_level: level === 'Advanced' ? 3 : (level === 'Intermediate' ? 2 : 1),
            // current_participants column not found, possibly managed via relation or trigger
            max_participants: 5,
            is_active: true,
            created_at: new Date(),
        };

        const { data, error } = await supabase.from('rooms').insert([roomData]).select().single();
        if (error) {
            console.error('Lỗi tạo phòng:', error);
            return null;
        }
        return data;
    },

    leaveRoom: async (roomId, currentParticipantCount) => {
        // Logic: Nếu chỉ còn 1 người (là mình) thì khi out sẽ xóa phòng
        if (currentParticipantCount <= 1) {
            console.log('🗑️ Người cuối cùng rời đi. Đang giải tán phòng:', roomId);
            const { error } = await supabase
                .from('rooms')
                .delete() // Hoặc .update({ is_active: false }) nếu muốn giữ lịch sử
                .eq('id', roomId);

            if (error) console.error('Lỗi xóa phòng:', error);
        } else {
            // Nếu còn người khác, giảm số lượng participants
            // Lưu ý: Logic này chỉ mang tính tương đối nếu không dùng RPC atomic
            console.log('👋 Rời phòng. Cập nhật số lượng người chơi.');
            const { error } = await supabase.rpc('decrement_participants', { room_id: roomId });
            // Fallback nếu không có RPC - nhưng vì không có cột participants nên ta bỏ qua update này
            /* if (error) {
                await supabase.from('rooms').update({
                    current_participants: currentParticipantCount - 1
                }).eq('id', roomId);
            } */
        }

        // Clear local state if needed
        set({ rooms: get().rooms.filter(r => r.id !== roomId) });
    },
}));

export default useGameStore;
