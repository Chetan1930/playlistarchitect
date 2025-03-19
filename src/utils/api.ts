
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

// Fetch YouTube video details
export const fetchYouTubeDetails = async (url: string): Promise<{ title: string; thumbnailUrl: string; description: string } | null> => {
  // This would be a real API call in a production app
  // For demo purposes, we'll simulate a response
  
  try {
    // Extract video ID from URL
    let videoId = '';
    
    if (url.includes('youtube.com/watch')) {
      const urlObj = new URL(url);
      videoId = urlObj.searchParams.get('v') || '';
    } else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1]?.split('?')[0] || '';
    }
    
    if (!videoId) return null;
    
    // Simulate API response
    // In a real app, you would use the YouTube API
    console.log(`Fetching details for video ID: ${videoId}`);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Return mock data
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
    
    const thumbnails = [
      `https://source.unsplash.com/random/640x360?web`,
      `https://source.unsplash.com/random/640x360?coding`,
      `https://source.unsplash.com/random/640x360?javascript`,
      `https://source.unsplash.com/random/640x360?algorithm`,
      `https://source.unsplash.com/random/640x360?design`,
    ];
    
    return {
      title: titles[randomIndex],
      thumbnailUrl: thumbnails[randomIndex],
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
    
    const newSkill: Skill = {
      id: generateId(),
      name,
      description,
      playlists: [],
      thumbnailUrl: `https://source.unsplash.com/random/300x200?${encodeURIComponent(name.toLowerCase())}`,
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
    const skills = getData();
    const skillIndex = skills.findIndex(s => s.id === skillId);
    
    if (skillIndex === -1) return null;
    
    // Get video details (title, thumbnail, etc.)
    const details = await fetchYouTubeDetails(playlistUrl);
    
    if (!details) return null;
    
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
    
    skills[skillIndex].playlists.push(newPlaylist);
    skills[skillIndex].updatedAt = new Date();
    saveData(skills);
    
    return newPlaylist;
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
