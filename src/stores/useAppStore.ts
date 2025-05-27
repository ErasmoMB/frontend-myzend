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

  login: (user: User) => void;
  logout: () => void;
  setSelectedEmotion: (emotion: Emotion | null) => void;
  setVideoRecommendations: (videos: Video[]) => void;
  addInteractionToHistory: (interaction: UserInteraction) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
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

      login: (user) => set({ currentUser: user, error: null }),
      logout: () => set({ currentUser: null, selectedEmotion: null, currentVideoRecommendations: [], userHistory: [] }),
      setSelectedEmotion: (emotion) => set({ selectedEmotion: emotion }),
      setVideoRecommendations: (videos) => set({ currentVideoRecommendations: videos, isLoading: false, error: null }),
      addInteractionToHistory: (interaction) =>
        set((state) => ({
          userHistory: [...state.userHistory, interaction],
        })),
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error: error, isLoading: false }),
    }),
    {
      name: 'mindflow-storage', // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => localStorage), // (optional) by default, 'localStorage' is used
      partialize: (state) => ({ // persist only these parts of the state
          currentUser: state.currentUser,
          selectedEmotion: state.selectedEmotion,
          userHistory: state.userHistory,
      }),
    }
  )
);
