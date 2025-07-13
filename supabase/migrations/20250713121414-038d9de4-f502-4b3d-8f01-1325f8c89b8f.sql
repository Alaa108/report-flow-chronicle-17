-- Create a table for achievements
CREATE TABLE public.achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  is_applied_to_website BOOLEAN NOT NULL DEFAULT false,
  category TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS) to ensure users can only see their own achievements
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

-- Create policy that allows users to SELECT their own achievements
CREATE POLICY "Users can view their own achievements" 
  ON public.achievements 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Create policy that allows users to INSERT their own achievements
CREATE POLICY "Users can create their own achievements" 
  ON public.achievements 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create policy that allows users to UPDATE their own achievements
CREATE POLICY "Users can update their own achievements" 
  ON public.achievements 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create policy that allows users to DELETE their own achievements
CREATE POLICY "Users can delete their own achievements" 
  ON public.achievements 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create a public view for achievements that can be accessed without authentication (for client reports)
CREATE VIEW public.achievements_public AS
SELECT 
  id,
  title,
  description,
  date,
  is_completed,
  is_applied_to_website,
  category,
  created_at
FROM public.achievements
WHERE is_completed = true; -- Only show completed achievements in public view

-- Enable RLS on the public view but allow public access
ALTER VIEW public.achievements_public SET (security_barrier = true);
CREATE POLICY "Anyone can view completed achievements" 
  ON public.achievements_public 
  FOR SELECT 
  TO anon, authenticated
  USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_achievements_updated_at
  BEFORE UPDATE ON public.achievements
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();