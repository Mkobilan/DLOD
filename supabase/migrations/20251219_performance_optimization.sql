-- Consolidated Performance Optimization Script
-- Generated on 2025-12-19

-- 1. Profiles Table Optimizations
DROP POLICY IF EXISTS "Users can insert their own profile." ON public.profiles;
CREATE POLICY "Users can insert their own profile." ON public.profiles FOR INSERT WITH CHECK ((SELECT auth.uid()) = id);

DROP POLICY IF EXISTS "Users can update own profile." ON public.profiles;
CREATE POLICY "Users can update own profile." ON public.profiles FOR UPDATE USING ((SELECT auth.uid()) = id);

-- 2. Jobs Table Optimizations
DROP POLICY IF EXISTS "Contractors can insert jobs." ON public.jobs;
CREATE POLICY "Contractors can insert jobs." ON public.jobs FOR INSERT WITH CHECK ((SELECT auth.uid()) = contractor_id);

DROP POLICY IF EXISTS "Contractors can update own jobs." ON public.jobs;
CREATE POLICY "Contractors can update own jobs." ON public.jobs FOR UPDATE USING ((SELECT auth.uid()) = contractor_id);

DROP POLICY IF EXISTS "Contractors can delete own jobs." ON public.jobs;
CREATE POLICY "Contractors can delete own jobs." ON public.jobs FOR DELETE USING ((SELECT auth.uid()) = contractor_id);

-- 3. Applications Table Optimizations (Consolidation)
-- Consolidate "Laborers can view their own applications." and "Contractors can view applications for their jobs."
DROP POLICY IF EXISTS "Laborers can view their own applications." ON public.applications;
DROP POLICY IF EXISTS "Contractors can view applications for their jobs." ON public.applications;
CREATE POLICY "Users can view relevant applications" ON public.applications FOR SELECT USING (
  (SELECT auth.uid()) = laborer_id OR 
  EXISTS (SELECT 1 FROM public.jobs WHERE jobs.id = job_id AND jobs.contractor_id = (SELECT auth.uid()))
);

DROP POLICY IF EXISTS "Laborers can create applications." ON public.applications;
CREATE POLICY "Laborers can create applications." ON public.applications FOR INSERT WITH CHECK ((SELECT auth.uid()) = laborer_id);

DROP POLICY IF EXISTS "Contractors can update application status." ON public.applications;
CREATE POLICY "Contractors can update application status." ON public.applications FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.jobs WHERE jobs.id = job_id AND jobs.contractor_id = (SELECT auth.uid()))
);

-- 4. Messages Table Optimizations
DROP POLICY IF EXISTS "Users can view their own messages." ON public.messages;
CREATE POLICY "Users can view their own messages." ON public.messages FOR SELECT USING ((SELECT auth.uid()) = sender_id OR (SELECT auth.uid()) = receiver_id);

DROP POLICY IF EXISTS "Users can insert messages." ON public.messages;
CREATE POLICY "Users can insert messages." ON public.messages FOR INSERT WITH CHECK ((SELECT auth.uid()) = sender_id);

-- 5. Reviews Table Optimizations
DROP POLICY IF EXISTS "Users can insert reviews." ON public.reviews;
CREATE POLICY "Users can insert reviews." ON public.reviews FOR INSERT WITH CHECK ((SELECT auth.uid()) = reviewer_id);

-- 6. Notifications Table Optimizations
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
CREATE POLICY "Users can view their own notifications" ON public.notifications FOR SELECT USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
CREATE POLICY "Users can update their own notifications" ON public.notifications FOR UPDATE USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert notifications" ON public.notifications;
CREATE POLICY "Users can insert notifications" ON public.notifications FOR INSERT WITH CHECK ((SELECT auth.role()) = 'authenticated');

-- 7. Saved Workers Table Optimizations
DROP POLICY IF EXISTS "Contractors can view their saved workers" ON public.saved_workers;
CREATE POLICY "Contractors can view their saved workers" ON public.saved_workers FOR SELECT USING ((SELECT auth.uid()) = contractor_id);

DROP POLICY IF EXISTS "Contractors can save workers" ON public.saved_workers;
CREATE POLICY "Contractors can save workers" ON public.saved_workers FOR INSERT WITH CHECK ((SELECT auth.uid()) = contractor_id);

DROP POLICY IF EXISTS "Contractors can remove saved workers" ON public.saved_workers;
CREATE POLICY "Contractors can remove saved workers" ON public.saved_workers FOR DELETE USING ((SELECT auth.uid()) = contractor_id);

-- 8. User Settings Table Optimizations
DROP POLICY IF EXISTS "Users can view their own settings" ON public.user_settings;
CREATE POLICY "Users can view their own settings" ON public.user_settings FOR SELECT USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert their own settings" ON public.user_settings;
CREATE POLICY "Users can insert their own settings" ON public.user_settings FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update their own settings" ON public.user_settings;
CREATE POLICY "Users can update their own settings" ON public.user_settings FOR UPDATE USING ((SELECT auth.uid()) = user_id);
