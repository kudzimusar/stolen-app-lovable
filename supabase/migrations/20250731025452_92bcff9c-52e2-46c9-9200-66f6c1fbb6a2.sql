-- Fix security issues identified by the linter

-- Add missing RLS policies for ownership_history
CREATE POLICY "Users can view ownership history of their devices" ON public.ownership_history
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.devices d 
            WHERE d.id = device_id AND d.current_owner_id = auth.uid()
        )
    );

CREATE POLICY "System can insert ownership history" ON public.ownership_history
    FOR INSERT WITH CHECK (true);

-- Add missing RLS policies for repair_history
CREATE POLICY "Users can view repair history of their devices" ON public.repair_history
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.devices d 
            WHERE d.id = device_id AND d.current_owner_id = auth.uid()
        )
    );

CREATE POLICY "Repair shops can add repair records" ON public.repair_history
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users u 
            WHERE u.id = auth.uid() AND u.role = 'repair_shop'
        )
    );

CREATE POLICY "Anyone can view verified repair history" ON public.repair_history
    FOR SELECT USING (verified = true);

-- Add missing RLS policies for found_tips
CREATE POLICY "Users can view tips for their reports" ON public.found_tips
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.stolen_reports sr 
            WHERE sr.id = stolen_report_id AND sr.reporter_id = auth.uid()
        )
    );

CREATE POLICY "Users can create tips" ON public.found_tips
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Tip finders can view their tips" ON public.found_tips
    FOR SELECT USING (auth.uid() = finder_id);

-- Fix function search paths for security
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.wallets (user_id)
    VALUES (NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;