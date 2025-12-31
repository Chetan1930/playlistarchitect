-- Add is_completed column to playlists table
ALTER TABLE public.playlists 
ADD COLUMN is_completed boolean NOT NULL DEFAULT false;