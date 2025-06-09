import { create } from 'zustand';
import type { User, Emotion, Video, UserInteraction } from '@/lib/types';
import { persist, createJSONStorage } from 'zustand/middleware';

interface AppState {
  currentUser: User | null;
  selectedEmotion: Emotion | null;
  currentVideoRecommendations: Video[];
  userHistory: UserInteraction[];
  isLoading: boolean;
  error: string | null;

  likedVideos: Video[];
  savedVideos: Video[];
  dislikedVideos: Video[];

  login: (user: User) => void;
  logout: () => void;
  setSelectedEmotion: (emotion: Emotion | null) => void;
  setVideoRecommendations: (videos: Video[]) => void;
  addInteractionToHistory: (interaction: UserInteraction) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  addLikedVideo: (video: Video) => void;
  removeLikedVideo: (videoId: string) => void;
  addSavedVideo: (video: Video) => void;
  removeSavedVideo: (videoId: string) => void;
  addDislikedVideo: (video: Video) => void;
  removeDislikedVideo: (videoId: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      selectedEmotion: null,
      currentVideoRecommendations: [],
      userHistory: [],
      isLoading: false,
      error: null,
      likedVideos: [],
      savedVideos: [],
      dislikedVideos: [],

      login: (user) => set({ currentUser: user, error: null }),
      logout: () => set({ currentUser: null, selectedEmotion: null, currentVideoRecommendations: [], userHistory: [], likedVideos: [], savedVideos: [], dislikedVideos: [] }),
      setSelectedEmotion: (emotion) => set({ selectedEmotion: emotion }),
      setVideoRecommendations: (videos) => set({ currentVideoRecommendations: videos, isLoading: false, error: null }),
      addInteractionToHistory: (interaction) =>
        set((state) => ({
          userHistory: [...state.userHistory, interaction],
        })),
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error: error, isLoading: false }),

      addLikedVideo: (video) => set((state) => ({ likedVideos: [...state.likedVideos, video] })),
      removeLikedVideo: (videoId) => set((state) => ({ likedVideos: state.likedVideos.filter(v => v.id !== videoId) })),
      addSavedVideo: (video) => set((state) => ({ savedVideos: [...state.savedVideos, video] })),
      removeSavedVideo: (videoId) => set((state) => ({ savedVideos: state.savedVideos.filter(v => v.id !== videoId) })),
      addDislikedVideo: (video) => set((state) => ({ dislikedVideos: [...state.dislikedVideos, video] })),
      removeDislikedVideo: (videoId) => set((state) => ({ dislikedVideos: state.dislikedVideos.filter(v => v.id !== videoId) })),
    }),
    {
      name: 'myzend-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
          currentUser: state.currentUser,
          selectedEmotion: state.selectedEmotion,
          userHistory: state.userHistory,
          likedVideos: state.likedVideos,
          savedVideos: state.savedVideos,
          dislikedVideos: state.dislikedVideos,
      }),
    }
  )
);
