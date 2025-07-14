-- Add link column to achievements table for file/resource links
ALTER TABLE public.achievements 
ADD COLUMN link TEXT;