CREATE TYPE public.app_role AS ENUM ('admin', 'user');
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;
CREATE POLICY "Users read own roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE TABLE public.student_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rating smallint NOT NULL CHECK (rating BETWEEN 1 AND 5),
  category text NOT NULL CHECK (category IN ('Website Design','Study Notes','Chatbot','Ease of Use','Suggestions')),
  name text CHECK (name IS NULL OR char_length(name) <= 100),
  email text CHECK (email IS NULL OR (char_length(email) <= 255 AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$')),
  comments text NOT NULL CHECK (char_length(btrim(comments)) BETWEEN 5 AND 2000),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.student_feedback TO anon, authenticated;
GRANT SELECT, DELETE ON public.student_feedback TO authenticated;
GRANT ALL ON public.student_feedback TO service_role;
ALTER TABLE public.student_feedback ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit student feedback" ON public.student_feedback FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admins read student feedback" ON public.student_feedback FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete student feedback" ON public.student_feedback FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.teacher_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submitted_by uuid NOT NULL DEFAULT auth.uid(),
  teacher_name text NOT NULL CHECK (char_length(btrim(teacher_name)) BETWEEN 2 AND 100),
  assignment_title text NOT NULL CHECK (char_length(btrim(assignment_title)) BETWEEN 2 AND 200),
  rating smallint NOT NULL CHECK (rating BETWEEN 1 AND 5),
  strengths text NOT NULL CHECK (char_length(btrim(strengths)) BETWEEN 5 AND 2000),
  improvements text NOT NULL CHECK (char_length(btrim(improvements)) BETWEEN 5 AND 2000),
  private_comments text CHECK (private_comments IS NULL OR char_length(private_comments) <= 2000),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT, SELECT, DELETE ON public.teacher_feedback TO authenticated;
GRANT ALL ON public.teacher_feedback TO service_role;
ALTER TABLE public.teacher_feedback ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Signed-in users submit teacher feedback" ON public.teacher_feedback FOR INSERT TO authenticated WITH CHECK (submitted_by = auth.uid());
CREATE POLICY "Admins read teacher feedback" ON public.teacher_feedback FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete teacher feedback" ON public.teacher_feedback FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.limit_feedback_rate()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_TABLE_NAME = 'student_feedback' THEN
    IF (SELECT count(*) FROM public.student_feedback WHERE created_at > now() - interval '1 minute') >= 20 THEN
      RAISE EXCEPTION 'Too many submissions. Please try again shortly.';
    END IF;
  ELSE
    IF (SELECT count(*) FROM public.teacher_feedback WHERE submitted_by = NEW.submitted_by AND created_at > now() - interval '1 hour') >= 10 THEN
      RAISE EXCEPTION 'Too many submissions. Please try again later.';
    END IF;
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER student_feedback_rate BEFORE INSERT ON public.student_feedback FOR EACH ROW EXECUTE FUNCTION public.limit_feedback_rate();
CREATE TRIGGER teacher_feedback_rate BEFORE INSERT ON public.teacher_feedback FOR EACH ROW EXECUTE FUNCTION public.limit_feedback_rate();