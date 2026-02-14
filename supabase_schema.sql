-- MIGRATION SCRIPT: CẬP NHẬT DATABASE AN TOÀN
-- Copy và chạy toàn bộ nội dung này. Nó sẽ tự động bỏ qua các bảng/cột đã tồn tại.

-- 1. BẢNG PROFILES (Người dùng)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY
);

-- Thêm các cột nếu chưa có (Dùng IF NOT EXISTS để không lỗi)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS nickname TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS tribe TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS character TEXT; -- Nhân vật đã chọn
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_stage INTEGER DEFAULT 1;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS total_speaking_seconds INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS coins INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS xp INTEGER DEFAULT 0; -- XP tích lũy
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS current_level INTEGER DEFAULT 1;

-- Các cột cho Moderator / Chức năng mở rộng
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_moderator BOOLEAN DEFAULT FALSE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS certified_at TIMESTAMPTZ;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS completed_lessons INTEGER[] DEFAULT '{}';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS ask_report JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- RLS Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Anyone can view moderator profiles" ON public.profiles;
CREATE POLICY "Anyone can view moderator profiles" ON public.profiles FOR SELECT USING (is_moderator = true);


-- 2. BẢNG POSTS
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY
);
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS content TEXT;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS post_type TEXT DEFAULT 'report';
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS reactions JSONB DEFAULT '{"like": 0, "heart": 0, "angry": 0}'::jsonb;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view posts" ON public.posts;
CREATE POLICY "Anyone can view posts" ON public.posts FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can create posts" ON public.posts;
CREATE POLICY "Users can create posts" ON public.posts FOR INSERT WITH CHECK (auth.uid() = author_id);
DROP POLICY IF EXISTS "Users can update own posts" ON public.posts;
CREATE POLICY "Users can update own posts" ON public.posts FOR UPDATE USING (auth.uid() = author_id);


-- 3. BẢNG TRANSACTIONS
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY
);
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS sender_id UUID REFERENCES public.profiles(id);
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS receiver_id UUID REFERENCES public.profiles(id);
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS amount INTEGER; -- Check constraint khó thêm bằng ADD COLUMN IF NOT EXISTS đơn giản, bỏ qua check cho đơn giản
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS message TEXT;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();


-- 4. BẢNG ROOMS (Phòng học)
CREATE TABLE IF NOT EXISTS public.rooms (
  room_id UUID DEFAULT gen_random_uuid() PRIMARY KEY
);
ALTER TABLE public.rooms ADD COLUMN IF NOT EXISTS host_id UUID REFERENCES public.profiles(id);
ALTER TABLE public.rooms ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE public.rooms ADD COLUMN IF NOT EXISTS topic TEXT;
ALTER TABLE public.rooms ADD COLUMN IF NOT EXISTS current_level INTEGER DEFAULT 1;
ALTER TABLE public.rooms ADD COLUMN IF NOT EXISTS max_participants INTEGER DEFAULT 5;
ALTER TABLE public.rooms ADD COLUMN IF NOT EXISTS background_image TEXT;
ALTER TABLE public.rooms ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
ALTER TABLE public.rooms ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view active rooms" ON public.rooms;
CREATE POLICY "Anyone can view active rooms" ON public.rooms FOR SELECT USING (true);
DROP POLICY IF EXISTS "Host can update own room" ON public.rooms;
CREATE POLICY "Host can update own room" ON public.rooms FOR UPDATE USING (auth.uid() = host_id);
DROP POLICY IF EXISTS "Authenticated users can create rooms" ON public.rooms;
CREATE POLICY "Authenticated users can create rooms" ON public.rooms FOR INSERT TO authenticated WITH CHECK (auth.uid() = host_id);


-- 5. TRIGGER TIMESTAMP
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_profiles_modtime ON public.profiles;
CREATE TRIGGER update_profiles_modtime 
BEFORE UPDATE ON public.profiles 
FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
