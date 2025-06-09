export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

export type Emotion =
  | 'Deprimido/a'
  | 'Triste'
  | 'Enojado/a'
  | 'Desmotivado/a'
  | 'Incomprendido/a'
  | 'Estresado/a';

export interface Video {
  id: string;
  url: string; // For actual video URL, or placeholder for description
  description: string;
  thumbnailUrl: string; // Placeholder image URL
  dataAiHint: string; // For placeholder image generation
}

export interface UserInteraction {
  videoId: string;
  interactionType: 'like' | 'save' | 'report';
  timestamp: Date;
}

export interface UserProfile extends User {
  emotionHistory: { emotion: Emotion; timestamp: Date }[];
  savedVideos: Video[];
}
