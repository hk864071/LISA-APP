-- 1. Bảng profiles (Cập nhật cho Moderator & Progress)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  nickname TEXT,
  tribe TEXT,
  avatar_stage INTEGER DEFAULT 1,
  total_speaking_seconds INTEGER DEFAULT 0,
  coins INTEGER DEFAULT 0,
  current_level INTEGER DEFAULT 1,
  
  -- Các cột mới bổ sung
  is_moderator BOOLEAN DEFAULT FALSE,
  certified_at TIMESTAMPTZ, -- Ngày trở thành Moderator
  completed_lessons INTEGER[] DEFAULT '{}', -- Mảng chứa ID các bài học đã hoàn thành
  ask_report JSONB DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS cho profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
-- Cho phép mọi người xem thông tin cơ bản của Moderator (nếu cần hiển thị list Mod)
CREATE POLICY "Anyone can view moderator profiles" ON public.profiles FOR SELECT USING (is_moderator = true);


-- 2. Bảng posts (Mạng xã hội & Share)
CREATE TABLE public.posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT, 
  post_type TEXT DEFAULT 'report', -- 'report' (từ ASK) hoặc 'status'
  reactions JSONB DEFAULT '{"like": 0, "heart": 0, "angry": 0}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view posts" ON public.posts FOR SELECT USING (true);
CREATE POLICY "Users can create posts" ON public.posts FOR INSERT WITH CHECK (auth.uid() = author_id);
-- Chỉ author mới được update post của mình
CREATE POLICY "Users can update own posts" ON public.posts FOR UPDATE USING (auth.uid() = author_id);


-- 3. Bảng transactions (Donate Coin)
CREATE TABLE public.transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID REFERENCES public.profiles(id),
  receiver_id UUID REFERENCES public.profiles(id),
  amount INTEGER NOT NULL CHECK (amount > 0),
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own transactions" ON public.transactions FOR SELECT 
USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
-- User chỉ được tạo transaction nếu họ là sender
CREATE POLICY "Users can donate" ON public.transactions FOR INSERT 
WITH CHECK (auth.uid() = sender_id);


-- 4. Bảng lessons (Cập nhật sub_level)
CREATE TABLE public.lessons (
  level INTEGER NOT NULL,
  sub_level INTEGER NOT NULL CHECK (sub_level BETWEEN 1 AND 6),
  title TEXT NOT NULL,
  description TEXT,
  keywords TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (level, sub_level) -- Composite Key theo yêu cầu
);

ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view lessons" ON public.lessons FOR SELECT USING (true);


-- 5. Bảng rooms (Giữ nguyên cơ bản, nhưng liên kết chặt chẽ hơn)
CREATE TABLE public.rooms (
  room_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  host_id UUID REFERENCES auth.users(id),
  name TEXT, -- Tên phòng
  topic TEXT,
  current_level INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active rooms" ON public.rooms FOR SELECT USING (true);
CREATE POLICY "Host can update own room" ON public.rooms FOR UPDATE USING (auth.uid() = host_id);
CREATE POLICY "Authenticated users can create rooms" ON public.rooms FOR INSERT 
TO authenticated WITH CHECK (auth.uid() = host_id);


-- 6. Bảng room_members (Raise Hand & Phân công)
CREATE TABLE public.room_members (
  room_id UUID REFERENCES public.rooms(room_id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  is_speaking BOOLEAN DEFAULT FALSE,
  is_raising_hand BOOLEAN DEFAULT FALSE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (room_id, user_id)
);

ALTER TABLE public.room_members ENABLE ROW LEVEL SECURITY;
-- Ai trong phòng cũng xem được danh sách mem
CREATE POLICY "Members can view room participants" ON public.room_members FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.room_members rm 
  WHERE rm.room_id = room_members.room_id AND rm.user_id = auth.uid()
));
-- User tự insert mình vào phòng (Join)
CREATE POLICY "Users can join rooms" ON public.room_members FOR INSERT 
WITH CHECK (auth.uid() = user_id);
-- User update trạng thái của mình (Giơ tay)
CREATE POLICY "Users can update self status" ON public.room_members FOR UPDATE 
USING (auth.uid() = user_id);


-- 7. Trigger cập nhật updated_at
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_modtime 
BEFORE UPDATE ON public.profiles 
FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
