DROP POLICY IF EXISTS "Anyone authenticated can lookup by code" ON public.classrooms;

-- 學生可看自己加入的班級
CREATE POLICY "Students view joined classrooms"
ON public.classrooms FOR SELECT
TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.classroom_members cm
  WHERE cm.classroom_id = classrooms.id AND cm.student_id = auth.uid()
));