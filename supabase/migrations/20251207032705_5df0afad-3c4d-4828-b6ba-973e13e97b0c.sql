-- Create skills table
CREATE TABLE public.skills (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create playlists table
CREATE TABLE public.playlists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  skill_id UUID NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  description TEXT,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playlists ENABLE ROW LEVEL SECURITY;

-- RLS policies for skills
CREATE POLICY "Users can view their own skills"
ON public.skills FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own skills"
ON public.skills FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own skills"
ON public.skills FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own skills"
ON public.skills FOR DELETE
USING (auth.uid() = user_id);

-- RLS policies for playlists (through skill ownership)
CREATE POLICY "Users can view playlists of their skills"
ON public.playlists FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.skills
  WHERE skills.id = playlists.skill_id
  AND skills.user_id = auth.uid()
));

CREATE POLICY "Users can create playlists for their skills"
ON public.playlists FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.skills
  WHERE skills.id = playlists.skill_id
  AND skills.user_id = auth.uid()
));

CREATE POLICY "Users can update playlists of their skills"
ON public.playlists FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.skills
  WHERE skills.id = playlists.skill_id
  AND skills.user_id = auth.uid()
));

CREATE POLICY "Users can delete playlists of their skills"
ON public.playlists FOR DELETE
USING (EXISTS (
  SELECT 1 FROM public.skills
  WHERE skills.id = playlists.skill_id
  AND skills.user_id = auth.uid()
));

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_skills_updated_at
BEFORE UPDATE ON public.skills
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();