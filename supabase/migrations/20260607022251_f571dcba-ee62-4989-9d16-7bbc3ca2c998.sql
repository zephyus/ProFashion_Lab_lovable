
-- parent_links
CREATE TABLE public.parent_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  invite_code TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','active','revoked')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.parent_links TO authenticated;
GRANT ALL ON public.parent_links TO service_role;
ALTER TABLE public.parent_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "view own parent_links" ON public.parent_links FOR SELECT TO authenticated
  USING (auth.uid() = student_id OR auth.uid() = parent_id);
CREATE POLICY "student creates own link" ON public.parent_links FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = student_id);
CREATE POLICY "involved updates" ON public.parent_links FOR UPDATE TO authenticated
  USING (auth.uid() = student_id OR auth.uid() = parent_id);
CREATE POLICY "involved deletes" ON public.parent_links FOR DELETE TO authenticated
  USING (auth.uid() = student_id OR auth.uid() = parent_id);
CREATE INDEX parent_links_parent_idx ON public.parent_links(parent_id);
CREATE INDEX parent_links_student_idx ON public.parent_links(student_id);

-- consent_requests
CREATE TABLE public.consent_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  kind TEXT NOT NULL CHECK (kind IN ('intern_mission','teacher_booking')),
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  parent_note TEXT,
  decided_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.consent_requests TO authenticated;
GRANT ALL ON public.consent_requests TO service_role;
ALTER TABLE public.consent_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "view own consents" ON public.consent_requests FOR SELECT TO authenticated
  USING (auth.uid() = student_id OR auth.uid() = parent_id);
CREATE POLICY "student create consent" ON public.consent_requests FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = student_id);
CREATE POLICY "parent decide consent" ON public.consent_requests FOR UPDATE TO authenticated
  USING (auth.uid() = parent_id);
CREATE INDEX consent_requests_parent_idx ON public.consent_requests(parent_id, status);
CREATE INDEX consent_requests_student_idx ON public.consent_requests(student_id, status);

-- notifications
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  link TEXT,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "view own notifications" ON public.notifications FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "update own notifications" ON public.notifications FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);
CREATE INDEX notifications_user_idx ON public.notifications(user_id, read_at, created_at DESC);

-- updated_at triggers (reuse existing set_updated_at)
CREATE TRIGGER parent_links_updated BEFORE UPDATE ON public.parent_links
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER consent_requests_updated BEFORE UPDATE ON public.consent_requests
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
