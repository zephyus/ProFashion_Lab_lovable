
-- 1. 角色系統
CREATE TYPE public.app_role AS ENUM ('student', 'teacher', 'admin');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- 新註冊者自動成為 student
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'student')
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created_role
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_role();

-- 2. 班級
CREATE TABLE public.classrooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  school_name TEXT,
  invite_code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.classrooms TO authenticated;
GRANT ALL ON public.classrooms TO service_role;

ALTER TABLE public.classrooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers manage own classrooms"
ON public.classrooms FOR ALL
TO authenticated
USING (auth.uid() = teacher_id AND public.has_role(auth.uid(), 'teacher'))
WITH CHECK (auth.uid() = teacher_id AND public.has_role(auth.uid(), 'teacher'));

-- 任何 authenticated 使用者可用 invite_code 查詢班級（加入班級時要查）
CREATE POLICY "Anyone authenticated can lookup by code"
ON public.classrooms FOR SELECT
TO authenticated
USING (true);

CREATE TRIGGER set_classrooms_updated_at
BEFORE UPDATE ON public.classrooms
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 3. 班級成員
CREATE TABLE public.classroom_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  classroom_id UUID REFERENCES public.classrooms(id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (classroom_id, student_id)
);

GRANT SELECT, INSERT, DELETE ON public.classroom_members TO authenticated;
GRANT ALL ON public.classroom_members TO service_role;

ALTER TABLE public.classroom_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students view own memberships"
ON public.classroom_members FOR SELECT
TO authenticated
USING (auth.uid() = student_id);

CREATE POLICY "Teachers view own classroom members"
ON public.classroom_members FOR SELECT
TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.classrooms c
  WHERE c.id = classroom_id AND c.teacher_id = auth.uid()
));

CREATE POLICY "Students join via invite"
ON public.classroom_members FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students can leave"
ON public.classroom_members FOR DELETE
TO authenticated
USING (auth.uid() = student_id);

CREATE POLICY "Teachers can remove members"
ON public.classroom_members FOR DELETE
TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.classrooms c
  WHERE c.id = classroom_id AND c.teacher_id = auth.uid()
));

-- 4. 探索事件
CREATE TABLE public.exploration_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  xp_delta INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_exploration_events_user_created
ON public.exploration_events (user_id, created_at DESC);

GRANT SELECT, INSERT ON public.exploration_events TO authenticated;
GRANT ALL ON public.exploration_events TO service_role;

ALTER TABLE public.exploration_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own events"
ON public.exploration_events FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Teachers view classroom student events"
ON public.exploration_events FOR SELECT
TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.classroom_members cm
  JOIN public.classrooms c ON c.id = cm.classroom_id
  WHERE cm.student_id = exploration_events.user_id
    AND c.teacher_id = auth.uid()
));

-- 5. 測驗結果快照
CREATE TABLE public.quiz_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  archetype TEXT,
  summary TEXT,
  answers JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_quiz_results_user_created
ON public.quiz_results (user_id, created_at DESC);

GRANT SELECT, INSERT ON public.quiz_results TO authenticated;
GRANT ALL ON public.quiz_results TO service_role;

ALTER TABLE public.quiz_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own quiz results"
ON public.quiz_results FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Teachers view classroom student quizzes"
ON public.quiz_results FOR SELECT
TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.classroom_members cm
  JOIN public.classrooms c ON c.id = cm.classroom_id
  WHERE cm.student_id = quiz_results.user_id
    AND c.teacher_id = auth.uid()
));

-- 6. 通話記錄
CREATE TABLE public.call_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  persona_id TEXT NOT NULL,
  persona_name TEXT NOT NULL,
  persona_job TEXT,
  script_lines_played INTEGER NOT NULL DEFAULT 0,
  message_count INTEGER NOT NULL DEFAULT 0,
  reflection TEXT,
  duration_seconds INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_call_sessions_user_created
ON public.call_sessions (user_id, created_at DESC);

GRANT SELECT, INSERT, UPDATE ON public.call_sessions TO authenticated;
GRANT ALL ON public.call_sessions TO service_role;

ALTER TABLE public.call_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own call sessions"
ON public.call_sessions FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 教師可看通話次數但不可看對話原文（在 server function 過濾欄位）
CREATE POLICY "Teachers view classroom student calls"
ON public.call_sessions FOR SELECT
TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.classroom_members cm
  JOIN public.classrooms c ON c.id = cm.classroom_id
  WHERE cm.student_id = call_sessions.user_id
    AND c.teacher_id = auth.uid()
));
