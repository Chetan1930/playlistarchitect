
export interface Playlist {
  id: string;
  title: string;
  url: string;
  thumbnailUrl: string | null;
  description: string | null;
  position: number;
}

export interface Skill {
  id: string;
  name: string;
  description: string;
  playlists: Playlist[];
  thumbnailUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}
