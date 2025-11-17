
import { Skill, Playlist } from './types';

// Simulating a database with localStorage
const SKILLS_KEY = 'course_skills';

// Helper to get data from localStorage
const getData = (): Skill[] => {
  const data = localStorage.getItem(SKILLS_KEY);
  if (!data) return [];
  
  try {
    return JSON.parse(data);
  } catch (e) {
    console.error("Error parsing stored data:", e);
    return [];
  }
};

// Helper to save data to localStorage
const saveData = (data: Skill[]): void => {
  try {
    localStorage.setItem(SKILLS_KEY, JSON.stringify(data));
  } catch (e) {
    console.error("Error saving data to localStorage:", e);
  }
};

// Generate random ID
const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

// Get a relevant image based on keywords
const getRelevantImage = (keyword: string): string => {
  // Collection of high-quality educational images
  const imageOptions = [
    "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=800&auto=format&fit=crop",  // tech setup
    "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&auto=format&fit=crop",  // coding
    "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&auto=format&fit=crop",  // laptop
    "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop",  // circuit
    "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=800&auto=format&fit=crop",  // study
  ];
  
  // Simple mapping of keywords to images
  const keywordMap: Record<string, number> = {
    javascript: 2,
    python: 1,
    web: 0,
    design: 4,
    development: 0,
    programming: 1,
    data: 3,
    machine: 3,
    learning: 4,
    ai: 3,
    frontend: 0,
    backend: 1,
    fullstack: 2,
    database: 3,
    cloud: 3,
    mobile: 0,
    game: 2,
    security: 3,
    devops: 1,
    testing: 0,
  };
  
  // Find matching keywords
  const lowerKeyword = keyword.toLowerCase();
  for (const [key, index] of Object.entries(keywordMap)) {
    if (lowerKeyword.includes(key)) {
      return imageOptions[index];
    }
  }
  
  // Default to a random image if no keyword matches
  return imageOptions[Math.floor(Math.random() * imageOptions.length)];
};

// Fetch YouTube video details using oEmbed API
export const fetchYouTubeDetails = async (url: string): Promise<{ title: string; thumbnailUrl: string; description: string } | null> => {
  try {
    console.log(`Fetching details for URL: ${url}`);
    
    // Use YouTube oEmbed API (no API key required)
    const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
    
    const response = await fetch(oembedUrl);
    
    if (!response.ok) {
      console.error('Failed to fetch YouTube details:', response.status);
      // Fallback to extracting keywords from URL for image
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
    
    // Extract topic from title for better image selection
    const titleLower = data.title.toLowerCase();
    let keywords = titleLower.includes('javascript') ? 'javascript' :
                   titleLower.includes('python') ? 'python' :
                   titleLower.includes('design') ? 'design' :
                   titleLower.includes('data') ? 'data' :
                   titleLower.includes('web') ? 'web' :
                   titleLower.includes('react') ? 'web' :
                   titleLower.includes('vue') ? 'web' :
                   titleLower.includes('angular') ? 'web' : 'coding';
    
    const thumbnailUrl = getRelevantImage(keywords);
    
    return {
      title: data.title,
      thumbnailUrl: thumbnailUrl,
      description: `Learn from ${data.author_name}`
    };
  } catch (error) {
    console.error('Error fetching video details:', error);
    // Return a fallback object in case of errors
    return {
      title: "Learning Resource",
      thumbnailUrl: getRelevantImage("learning"),
      description: "A learning resource added to your collection."
    };
  }
};

// API methods
export const api = {
  // Skills
  getSkills: async (): Promise<Skill[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    try {
      const skills = getData();
      console.log("Retrieved skills:", skills.length);
      return skills;
    } catch (error) {
      console.error("Error getting skills:", error);
      return [];
    }
  },
  
  getSkill: async (id: string): Promise<Skill | null> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    try {
      const skills = getData();
      const skill = skills.find(s => s.id === id);
      console.log(`Retrieved skill ${id}:`, skill ? "found" : "not found");
      return skill || null;
    } catch (error) {
      console.error(`Error getting skill ${id}:`, error);
      return null;
    }
  },
  
  createSkill: async (name: string, description: string): Promise<Skill> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    try {
      const skills = getData();
      
      // Generate a relevant thumbnail based on the skill name
      const thumbnailUrl = getRelevantImage(name);
      
      const newSkill: Skill = {
        id: generateId(),
        name,
        description: description || `Created by Chetan Chauhan`,
        playlists: [],
        thumbnailUrl,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      skills.push(newSkill);
      saveData(skills);
      console.log("Created new skill:", newSkill.name);
      return newSkill;
    } catch (error) {
      console.error("Error creating skill:", error);
      throw error;
    }
  },
  
  updateSkill: async (id: string, updates: Partial<Skill>): Promise<Skill | null> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    try {
      const skills = getData();
      const index = skills.findIndex(s => s.id === id);
      
      if (index === -1) return null;
      
      const updatedSkill = { ...skills[index], ...updates, updatedAt: new Date() };
      skills[index] = updatedSkill;
      saveData(skills);
      console.log(`Updated skill ${id}:`, updatedSkill.name);
      return updatedSkill;
    } catch (error) {
      console.error(`Error updating skill ${id}:`, error);
      return null;
    }
  },
  
  deleteSkill: async (id: string): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 400));
    try {
      const skills = getData();
      const filteredSkills = skills.filter(s => s.id !== id);
      
      if (filteredSkills.length === skills.length) return false;
      
      saveData(filteredSkills);
      console.log(`Deleted skill ${id}`);
      return true;
    } catch (error) {
      console.error(`Error deleting skill ${id}:`, error);
      return false;
    }
  },
  
  // Playlists
  addPlaylist: async (skillId: string, playlistUrl: string): Promise<Playlist | null> => {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    try {
      console.log(`Adding playlist with URL: ${playlistUrl} to skill: ${skillId}`);
      const skills = getData();
      const skillIndex = skills.findIndex(s => s.id === skillId);
      
      if (skillIndex === -1) {
        console.error(`Skill with ID ${skillId} not found`);
        return null;
      }
      
      // Get video details (title, thumbnail, etc.)
      const details = await fetchYouTubeDetails(playlistUrl);
      
      if (!details) {
        console.error('Failed to fetch playlist details');
        return null;
      }
      
      // Calculate next position
      const nextPosition = skills[skillIndex].playlists.length;
      
      const newPlaylist: Playlist = {
        id: generateId(),
        title: details.title,
        url: playlistUrl,
        thumbnailUrl: details.thumbnailUrl,
        description: details.description,
        position: nextPosition
      };
      
      console.log('Adding new playlist:', newPlaylist);
      
      skills[skillIndex].playlists.push(newPlaylist);
      skills[skillIndex].updatedAt = new Date();
      saveData(skills);
      
      return newPlaylist;
    } catch (error) {
      console.error('Error adding playlist:', error);
      return null;
    }
  },
  
  updatePlaylistTitle: async (skillId: string, playlistId: string, newTitle: string): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    try {
      console.log(`Updating playlist title: ${playlistId} to "${newTitle}"`);
      const skills = getData();
      const skillIndex = skills.findIndex(s => s.id === skillId);
      
      if (skillIndex === -1) return false;
      
      const { playlists } = skills[skillIndex];
      const playlistIndex = playlists.findIndex(p => p.id === playlistId);
      
      if (playlistIndex === -1) return false;
      
      playlists[playlistIndex].title = newTitle;
      skills[skillIndex].updatedAt = new Date();
      saveData(skills);
      
      console.log(`Updated playlist title successfully`);
      return true;
    } catch (error) {
      console.error(`Error updating playlist title:`, error);
      return false;
    }
  },
  
  updatePlaylistPosition: async (skillId: string, playlistId: string, newPosition: number): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    try {
      const skills = getData();
      const skillIndex = skills.findIndex(s => s.id === skillId);
      
      if (skillIndex === -1) return false;
      
      const { playlists } = skills[skillIndex];
      const playlistIndex = playlists.findIndex(p => p.id === playlistId);
      
      if (playlistIndex === -1) return false;
      
      // Validate position
      if (newPosition < 0 || newPosition >= playlists.length) return false;
      
      // Remove playlist from current position
      const [playlist] = playlists.splice(playlistIndex, 1);
      
      // Insert at new position
      playlists.splice(newPosition, 0, playlist);
      
      // Update positions for all playlists
      playlists.forEach((p, idx) => {
        p.position = idx;
      });
      
      skills[skillIndex].updatedAt = new Date();
      saveData(skills);
      
      console.log(`Updated playlist position: ${playlistId} to position ${newPosition}`);
      return true;
    } catch (error) {
      console.error(`Error updating playlist position:`, error);
      return false;
    }
  },
  
  deletePlaylist: async (skillId: string, playlistId: string): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    try {
      const skills = getData();
      const skillIndex = skills.findIndex(s => s.id === skillId);
      
      if (skillIndex === -1) return false;
      
      const { playlists } = skills[skillIndex];
      const updatedPlaylists = playlists.filter(p => p.id !== playlistId);
      
      if (updatedPlaylists.length === playlists.length) return false;
      
      // Update positions
      updatedPlaylists.forEach((p, idx) => {
        p.position = idx;
      });
      
      skills[skillIndex].playlists = updatedPlaylists;
      skills[skillIndex].updatedAt = new Date();
      saveData(skills);
      
      console.log(`Deleted playlist: ${playlistId}`);
      return true;
    } catch (error) {
      console.error(`Error deleting playlist:`, error);
      return false;
    }
  }
};
