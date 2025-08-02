-- Create a table for monthly summaries
CREATE TABLE public.monthly_summaries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL,
  year INTEGER NOT NULL,
  month INTEGER NOT NULL,
  summary TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(project_id, year, month)
);

-- Enable Row Level Security
ALTER TABLE public.monthly_summaries ENABLE ROW LEVEL SECURITY;

-- Create policies for monthly summaries
CREATE POLICY "Anyone can view monthly summaries" 
ON public.monthly_summaries 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create monthly summaries" 
ON public.monthly_summaries 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update monthly summaries" 
ON public.monthly_summaries 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can delete monthly summaries" 
ON public.monthly_summaries 
FOR DELETE 
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_monthly_summaries_updated_at
BEFORE UPDATE ON public.monthly_summaries
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();