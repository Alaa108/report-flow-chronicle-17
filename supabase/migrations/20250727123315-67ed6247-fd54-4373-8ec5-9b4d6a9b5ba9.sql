-- Create projects table
CREATE TABLE public.projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  project_code TEXT NOT NULL UNIQUE,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on projects
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- RLS policies for projects - allow all authenticated users to view
CREATE POLICY "Authenticated users can view all projects" 
ON public.projects 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Users can create their own projects" 
ON public.projects 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects" 
ON public.projects 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects" 
ON public.projects 
FOR DELETE 
TO authenticated
USING (auth.uid() = user_id);

-- Add project_id to achievements table
ALTER TABLE public.achievements 
ADD COLUMN project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE;

-- Update achievements RLS policies to allow viewing by all authenticated users
DROP POLICY "Users can view their own achievements" ON public.achievements;
CREATE POLICY "Authenticated users can view all achievements" 
ON public.achievements 
FOR SELECT 
TO authenticated
USING (true);

-- Add trigger for projects updated_at
CREATE TRIGGER update_projects_updated_at
BEFORE UPDATE ON public.projects
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to generate unique project codes
CREATE OR REPLACE FUNCTION public.generate_project_code()
RETURNS TEXT AS $$
BEGIN
  RETURN 'C' || LPAD(FLOOR(RANDOM() * 9999999)::TEXT, 7, '0');
END;
$$ LANGUAGE plpgsql;