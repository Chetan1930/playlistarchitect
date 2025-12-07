import { supabase } from '@/integrations/supabase/client';
import { Skill, Playlist } from './types';

// Get a relevant image based on keywords
const getRelevantImage = (keyword: string): string => {
  const imageOptions = [
    "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=800&auto=format&fit=crop",
  ];
  
  const keywordMap: Record<string, number> = {
    javascript: 2, python: 1, web: 0, design: 4, development: 0,
    programming: 1, data: 3, machine: 3, learning: 4, ai: 3,
    frontend: 0, backend: 1, fullstack: 2, database: 3, cloud: 3,
    mobile: 0, game: 2, security: 3, devops: 1, testing: 0,
  };
  
  const lowerKeyword = keyword.toLowerCase();
  for (const [key, index] of Object.entries(keywordMap)) {
    if (lowerKeyword.includes(key)) {
      return imageOptions[index];
    }
  }
  
  return imageOptions[Math.floor(Math.random() * imageOptions.length)];
};

// Fetch YouTube video details using oEmbed API
export const fetchYouTubeDetails = async (url: string): Promise<{ title: string; thumbnailUrl: string; description: string } | null> => {
  try {
    const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
    const response = await fetch(oembedUrl);
    
    if (!response.ok) {
      const urlLower = url.toLowerCase();
      let keywords = urlLower.includes('javascript') ? 'javascript' :
                     urlLower.includes('python') ? 'python' :
                     urlLower.includes('design') ? 'design' :
                     urlLower.includes('data') ? 'data' :
                     urlLower.includes('web') ? 'web' : 'coding';
      
      return {
        title: "Learning Resource",
        thumbnailUrl: getRelevantImage(keywords),
        description: "A learning resource added to your collection."
      };
    }
    
    const data = await response.json();
    const titleLower = data.title.toLowerCase();
    let keywords = titleLower.includes('javascript') ? 'javascript' :
                   titleLower.includes('python') ? 'python' :
                   titleLower.includes('design') ? 'design' :
                   titleLower.includes('data') ? 'data' :
                   titleLower.includes('web') ? 'web' :
                   titleLower.includes('react') ? 'web' :
                   titleLower.includes('vue') ? 'web' :
                   titleLower.includes('angular') ? 'web' : 'coding';
    
    return {
      title: data.title,
      thumbnailUrl: getRelevantImage(keywords),
      description: `Learn from ${data.author_name}`
    };
  } catch (error) {
    console.error('Error fetching video details:', error);
    return {
      title: "Learning Resource",
      thumbnailUrl: getRelevantImage("learning"),
      description: "A learning resource added to your collection."
    };
  }
};

// API methods using Supabase
export const api = {
  getSkills: async (): Promise<Skill[]> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data: skills, error } = await supabase
      .from('skills')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching skills:', error);
      return [];
    }

    // Fetch playlists for each skill
    const skillsWithPlaylists = await Promise.all(
      (skills || []).map(async (skill) => {
        const { data: playlists } = await supabase
          .from('playlists')
          .select('*')
          .eq('skill_id', skill.id)
          .order('position', { ascending: true });

        return {
          id: skill.id,
          name: skill.name,
          description: skill.description || '',
          thumbnailUrl: skill.thumbnail_url,
          createdAt: new Date(skill.created_at),
          updatedAt: new Date(skill.updated_at),
          playlists: (playlists || []).map(p => ({
            id: p.id,
            title: p.title,
            url: p.url,
            thumbnailUrl: p.thumbnail_url,
            description: p.description,
            position: p.position,
          })),
        };
      })
    );

    return skillsWithPlaylists;
  },

  getSkill: async (id: string): Promise<Skill | null> => {
    const { data: skill, error } = await supabase
      .from('skills')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error || !skill) {
      console.error('Error fetching skill:', error);
      return null;
    }

    const { data: playlists } = await supabase
      .from('playlists')
      .select('*')
      .eq('skill_id', id)
      .order('position', { ascending: true });

    return {
      id: skill.id,
      name: skill.name,
      description: skill.description || '',
      thumbnailUrl: skill.thumbnail_url,
      createdAt: new Date(skill.created_at),
      updatedAt: new Date(skill.updated_at),
      playlists: (playlists || []).map(p => ({
        id: p.id,
        title: p.title,
        url: p.url,
        thumbnailUrl: p.thumbnail_url,
        description: p.description,
        position: p.position,
      })),
    };
  },

  createSkill: async (name: string, description: string): Promise<Skill> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const thumbnailUrl = getRelevantImage(name);

    const { data: skill, error } = await supabase
      .from('skills')
      .insert({
        user_id: user.id,
        name,
        description: description || `Created by you`,
        thumbnail_url: thumbnailUrl,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating skill:', error);
      throw error;
    }

    return {
      id: skill.id,
      name: skill.name,
      description: skill.description || '',
      thumbnailUrl: skill.thumbnail_url,
      createdAt: new Date(skill.created_at),
      updatedAt: new Date(skill.updated_at),
      playlists: [],
    };
  },

  updateSkill: async (id: string, updates: Partial<Skill>): Promise<Skill | null> => {
    const { data: skill, error } = await supabase
      .from('skills')
      .update({
        name: updates.name,
        description: updates.description,
        thumbnail_url: updates.thumbnailUrl,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating skill:', error);
      return null;
    }

    return api.getSkill(id);
  },

  deleteSkill: async (id: string): Promise<boolean> => {
    const { error } = await supabase
      .from('skills')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting skill:', error);
      return false;
    }
    return true;
  },

  addPlaylist: async (skillId: string, playlistUrl: string): Promise<Playlist | null> => {
    const details = await fetchYouTubeDetails(playlistUrl);
    if (!details) return null;

    // Get current max position
    const { data: existingPlaylists } = await supabase
      .from('playlists')
      .select('position')
      .eq('skill_id', skillId)
      .order('position', { ascending: false })
      .limit(1);

    const nextPosition = existingPlaylists && existingPlaylists.length > 0 
      ? existingPlaylists[0].position + 1 
      : 0;

    const { data: playlist, error } = await supabase
      .from('playlists')
      .insert({
        skill_id: skillId,
        title: details.title,
        url: playlistUrl,
        thumbnail_url: details.thumbnailUrl,
        description: details.description,
        position: nextPosition,
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding playlist:', error);
      return null;
    }

    return {
      id: playlist.id,
      title: playlist.title,
      url: playlist.url,
      thumbnailUrl: playlist.thumbnail_url,
      description: playlist.description,
      position: playlist.position,
    };
  },

  updatePlaylistTitle: async (skillId: string, playlistId: string, newTitle: string): Promise<boolean> => {
    const { error } = await supabase
      .from('playlists')
      .update({ title: newTitle })
      .eq('id', playlistId);

    if (error) {
      console.error('Error updating playlist title:', error);
      return false;
    }
    return true;
  },

  updatePlaylistPosition: async (skillId: string, playlistId: string, newPosition: number): Promise<boolean> => {
    // Get all playlists for the skill
    const { data: playlists, error: fetchError } = await supabase
      .from('playlists')
      .select('*')
      .eq('skill_id', skillId)
      .order('position', { ascending: true });

    if (fetchError || !playlists) return false;

    const playlistIndex = playlists.findIndex(p => p.id === playlistId);
    if (playlistIndex === -1) return false;

    // Reorder playlists
    const [removed] = playlists.splice(playlistIndex, 1);
    playlists.splice(newPosition, 0, removed);

    // Update all positions
    const updates = playlists.map((p, idx) => 
      supabase
        .from('playlists')
        .update({ position: idx })
        .eq('id', p.id)
    );

    await Promise.all(updates);
    return true;
  },

  deletePlaylist: async (skillId: string, playlistId: string): Promise<boolean> => {
    const { error } = await supabase
      .from('playlists')
      .delete()
      .eq('id', playlistId);

    if (error) {
      console.error('Error deleting playlist:', error);
      return false;
    }
    return true;
  }
};
