import { create } from 'zustand';
import type { User, Emotion, Video, UserInteraction } from '@/lib/types';

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

  emotionHistory: { emotion: string; timestamp: number }[];

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

  fetchUserHistory: () => Promise<void>;
  fetchEmotionHistory: () => Promise<void>;
  addEmotionToHistory: (emotion: string) => Promise<void>;
}

export const useAppStore = create<AppState>()(
  // Eliminamos persist y localStorage, solo estado en memoria
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
    emotionHistory: [],

    login: (user) => set({ currentUser: user, error: null }),
    logout: () => set({ currentUser: null, selectedEmotion: null, currentVideoRecommendations: [], userHistory: [], likedVideos: [], savedVideos: [], dislikedVideos: [] }),
    setSelectedEmotion: (emotion) => {
      set({ selectedEmotion: emotion });
      if (emotion) {
        get().addEmotionToHistory(emotion);
      }
    },
    setVideoRecommendations: (videos) => set({ currentVideoRecommendations: videos, isLoading: false, error: null }),
    addInteractionToHistory: async (interaction) => {
      set((state) => ({
        userHistory: [...state.userHistory, interaction],
      }));
      // Guardar en backend
      const user = get().currentUser;
      const emotion = get().selectedEmotion;
      if (user) {
        try {
          const backendUrl = 'http://127.0.0.1:8000';
          await fetch(`${backendUrl}/interaction`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: user.email,
              video_id: interaction.videoId,
              video_url: interaction.videoUrl,
              video_title: interaction.videoTitle,
              video_thumbnail: interaction.videoThumbnail,
              interaction_type: interaction.interactionType,
              emotion: emotion,
              timestamp: Date.now(),
            }),
          });
          // Actualizar likedVideos y savedVideos según el tipo de interacción
          if (interaction.interactionType === 'like') {
            set((state) => ({
              likedVideos: [
                ...state.likedVideos,
                {
                  id: interaction.videoId,
                  url: interaction.videoUrl || '',
                  description: interaction.videoTitle || '',
                  thumbnailUrl: interaction.videoThumbnail || '',
                  dataAiHint: '',
                },
              ],
            }));
          } else if (interaction.interactionType === 'save') {
            set((state) => ({
              savedVideos: [
                ...state.savedVideos,
                {
                  id: interaction.videoId,
                  url: interaction.videoUrl || '',
                  description: interaction.videoTitle || '',
                  thumbnailUrl: interaction.videoThumbnail || '',
                  dataAiHint: '',
                },
              ],
            }));
          }
        } catch (e) {
          // Silenciar error para UX
        }
      }
    },
    setLoading: (loading) => set({ isLoading: loading }),
    setError: (error) => set({ error: error, isLoading: false }),

    addLikedVideo: (video) => set((state) => ({ likedVideos: [...state.likedVideos, video] })),
    removeLikedVideo: (videoId) => set((state) => ({ likedVideos: state.likedVideos.filter(v => v.id !== videoId) })),
    addSavedVideo: (video) => set((state) => ({ savedVideos: [...state.savedVideos, video] })),
    removeSavedVideo: (videoId) => set((state) => ({ savedVideos: state.savedVideos.filter(v => v.id !== videoId) })),
    addDislikedVideo: (video) => set((state) => ({ dislikedVideos: [...state.dislikedVideos, video] })),
    removeDislikedVideo: (videoId) => set((state) => ({ dislikedVideos: state.dislikedVideos.filter(v => v.id !== videoId) })),
    fetchUserHistory: async () => {
      const user = get().currentUser;
      if (!user) return;
      set({ isLoading: true });
      try {
        const backendUrl = 'http://127.0.0.1:8000';
        const res = await fetch(`${backendUrl}/user/${encodeURIComponent(user.email)}/interactions`);
        if (!res.ok) throw new Error('No se pudo obtener el historial');
        const data = await res.json();
        const interactions = data.interactions || [];
        // Filtrar videos por tipo de interacción y mapear a tipo Video
        const likedVideos = interactions
          .filter((i: any) => i.interaction_type === 'like')
          .map((i: any) => ({
            id: i.video_id,
            url: i.video_url || '',
            description: i.video_title || '',
            thumbnailUrl: i.video_thumbnail || '',
            dataAiHint: '',
          }));
        const savedVideos = interactions
          .filter((i: any) => i.interaction_type === 'save')
          .map((i: any) => ({
            id: i.video_id,
            url: i.video_url || '',
            description: i.video_title || '',
            thumbnailUrl: i.video_thumbnail || '',
            dataAiHint: '',
          }));
        set({
          userHistory: interactions,
          likedVideos,
          savedVideos,
          isLoading: false,
        });
      } catch (e) {
        set({ error: 'Error al cargar historial', isLoading: false });
      }
    },
    fetchEmotionHistory: async () => {
      const user = get().currentUser;
      if (!user) return;
      try {
        const backendUrl = 'http://127.0.0.1:8000';
        const res = await fetch(`${backendUrl}/user/${encodeURIComponent(user.email)}/emotions`);
        if (!res.ok) throw new Error('No se pudo obtener el historial de emociones');
        const data = await res.json();
        set({ emotionHistory: (data.emotions || []).map((e: any) => ({ emotion: e.emotion, timestamp: e.timestamp })) });
      } catch (e) {
        set({ emotionHistory: [] });
      }
    },
    addEmotionToHistory: async (emotion) => {
      const user = get().currentUser;
      if (!user) return;
      const backendUrl = 'http://127.0.0.1:8000';
      await fetch(`${backendUrl}/emotion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, emotion, timestamp: Date.now() })
      });
      // Actualizar localmente
      set((state) => ({ emotionHistory: [{ emotion, timestamp: Date.now() }, ...state.emotionHistory] }));
    },
  })
);
