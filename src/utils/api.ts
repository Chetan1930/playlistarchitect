
import { Skill, Playlist } from './types';

// Simulating a database with localStorage
const SKILLS_KEY = 'course_skills';

// Helper to get data from localStorage
const getData = (): Skill[] => {
  const data = localStorage.getItem(SKILLS_KEY);
  return data ? JSON.parse(data) : [];
};

// Helper to save data to localStorage
const saveData = (data: Skill[]): void => {
  localStorage.setItem(SKILLS_KEY, JSON.stringify(data));
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

// Fetch YouTube video details
export const fetchYouTubeDetails = async (url: string): Promise<{ title: string; thumbnailUrl: string; description: string } | null> => {
  try {
    // Extract video ID from URL
    let videoId = '';
    
    // Handle different YouTube URL formats
    if (url.includes('youtube.com/watch')) {
      const urlObj = new URL(url);
      videoId = urlObj.searchParams.get('v') || '';
    } else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1]?.split('?')[0] || '';
    } else if (url.includes('youtube.com/playlist')) {
      const urlObj = new URL(url);
      videoId = urlObj.searchParams.get('list') || '';
    }
    
    if (!videoId) {
      console.log('Could not extract valid YouTube ID from URL:', url);
      return null;
    }
    
    console.log(`Fetching details for video/playlist ID: ${videoId}`);
    
    // Extract topic from URL for better image selection
    const urlLower = url.toLowerCase();
    let keywords = urlLower.includes('javascript') ? 'javascript' :
                   urlLower.includes('python') ? 'python' :
                   urlLower.includes('design') ? 'design' :
                   urlLower.includes('data') ? 'data' :
                   urlLower.includes('web') ? 'web' : 'coding';
    
    const thumbnailUrl = getRelevantImage(keywords);
    
    // Return data
    const randomIndex = Math.floor(Math.random() * 5);
    const titles = [
      "Learn Web Development Basics",
      "Data Structures Explained",
      "Advanced JavaScript Techniques",
      "Algorithms for Beginners",
      "UI/UX Design Fundamentals"
    ];
    
    const descriptions = [
      "Master the fundamentals of web development with this comprehensive guide.",
      "Learn all about data structures and how they work in this tutorial.",
      "Take your JavaScript skills to the next level with these advanced techniques.",
      "A beginner-friendly introduction to algorithms and problem-solving.",
      "Explore the principles of great UI/UX design in this detailed course."
    ];
    
    return {
      title: titles[randomIndex],
      thumbnailUrl,
      description: descriptions[randomIndex]
    };
  } catch (error) {
    console.error('Error fetching video details:', error);
    return null;
  }
};

// API methods
export const api = {
  // Skills
  getSkills: async (): Promise<Skill[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    return getData();
  },
  
  getSkill: async (id: string): Promise<Skill | null> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const skills = getData();
    const skill = skills.find(s => s.id === id);
    return skill || null;
  },
  
  createSkill: async (name: string, description: string): Promise<Skill> => {
    await new Promise(resolve => setTimeout(resolve, 500));
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
    return newSkill;
  },
  
  updateSkill: async (id: string, updates: Partial<Skill>): Promise<Skill | null> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const skills = getData();
    const index = skills.findIndex(s => s.id === id);
    
    if (index === -1) return null;
    
    const updatedSkill = { ...skills[index], ...updates, updatedAt: new Date() };
    skills[index] = updatedSkill;
    saveData(skills);
    return updatedSkill;
  },
  
  deleteSkill: async (id: string): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 400));
    const skills = getData();
    const filteredSkills = skills.filter(s => s.id !== id);
    
    if (filteredSkills.length === skills.length) return false;
    
    saveData(filteredSkills);
    return true;
  },
  
  // Playlists
  addPlaylist: async (skillId: string, playlistUrl: string): Promise<Playlist | null> => {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    try {
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
    const skills = getData();
    const skillIndex = skills.findIndex(s => s.id === skillId);
    
    if (skillIndex === -1) return false;
    
    const { playlists } = skills[skillIndex];
    const playlistIndex = playlists.findIndex(p => p.id === playlistId);
    
    if (playlistIndex === -1) return false;
    
    playlists[playlistIndex].title = newTitle;
    skills[skillIndex].updatedAt = new Date();
    saveData(skills);
    
    return true;
  },
  
  updatePlaylistPosition: async (skillId: string, playlistId: string, newPosition: number): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 300));
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
    
    return true;
  },
  
  deletePlaylist: async (skillId: string, playlistId: string): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 300));
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
    
    return true;
  }
};
