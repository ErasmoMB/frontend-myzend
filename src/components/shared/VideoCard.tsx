'use client';

import Image from 'next/image';
import type { Video } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Heart, Bookmark, Flag, Loader2, Send, MessageCircle } from 'lucide-react'; // Added Send, MessageCircle for potential future use
import { useAppStore } from '@/stores/useAppStore';
import { useToast } from '@/hooks/use-toast';
import { improveRecommendations as improveRecommendationsFlow } from '@/ai/flows/improve-recommendations';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface VideoCardProps {
  video: Video;
  isPlaying?: boolean; // To potentially highlight the active video or manage real playback
}

export function VideoCard({ video, isPlaying }: VideoCardProps) {
  const { toast } = useToast();
  const addInteraction = useAppStore((state) => state.addInteractionToHistory);
  const selectedEmotion = useAppStore((state) => state.selectedEmotion);
  const currentRecommendations = useAppStore((state) => state.currentVideoRecommendations);
  const setRecommendations = useAppStore((state) => state.setVideoRecommendations);
  const [isInteracting, setIsInteracting] = useState<string | null>(null); // Store type of interaction

  const handleInteraction = async (interactionType: 'like' | 'save' | 'report') => {
    if (!selectedEmotion) {
      toast({ title: "Error", description: "No emotion selected.", variant: "destructive" });
      return;
    }
    setIsInteracting(interactionType);
    addInteraction({ videoId: video.id, interactionType, timestamp: new Date() });
    toast({
      title: `Video ${interactionType === 'like' ? 'gustado' : interactionType === 'save' ? 'guardado' : 'reportado'}`,
      description: video.description.substring(0, 50) + '...',
    });

    try {
      const prevRecIds = currentRecommendations.map(v => v.id);
      const result = await improveRecommendationsFlow({
        emotion: selectedEmotion,
        videoId: video.id,
        interactionType,
        previousRecommendations: prevRecIds,
      });
      
      console.log("AI Reasoning for improving recommendations:", result.reasoning);
      // Temporarily commenting out to prevent feed reshuffle that breaks auto-scroll
      // const newMockRecommendations = [...currentRecommendations].sort(() => Math.random() - 0.5).slice(0, 5) as Video[];
      // setRecommendations(newMockRecommendations);

    } catch (error) {
      console.error("Error improving recommendations:", error);
      toast({ title: "Error", description: "Could not update recommendations based on interaction.", variant: "destructive" });
    } finally {
      setIsInteracting(null);
    }
  };

  return (
    <Card className="h-screen w-full snap-start flex flex-col shadow-none rounded-none bg-black relative overflow-hidden">
      <Image
        src={video.thumbnailUrl}
        alt={video.description}
        layout="fill"
        objectFit="cover"
        className={cn("transition-opacity duration-300", isPlaying ? "opacity-100" : "opacity-80")}
        data-ai-hint={video.dataAiHint}
        priority // Prioritize loading images for visible cards
      />
      
      {/* Overlay for better text visibility */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>

      {/* Content Overlay: Bottom Left */}
      <div className="absolute bottom-16 md:bottom-4 left-4 right-4 text-white z-10 p-4 space-y-2">
        <h3 className="font-semibold text-lg drop-shadow-md">@myzendUser</h3>
        <p className="text-sm line-clamp-2 drop-shadow-sm">{video.description}</p>
        <div className="flex items-center space-x-2 text-xs drop-shadow-sm">
          <Send size={16} className="transform rotate-[-45deg]" />
          <span>Sonido Original - myzend</span>
        </div>
      </div>

      {/* Action Buttons Overlay: Right Side */}
      <div className="absolute right-2 md:right-4 top-1/2 transform -translate-y-1/2 flex flex-col space-y-5 z-10 p-2">
        {/* Logo myzend como avatar */}
        <div className="relative flex flex-col items-center group">
           <img src="/logo.jpg" alt="myzend avatar" width={48} height={48} className="rounded-full border-2 border-white shadow-md" />
           <Button variant="ghost" size="icon" className="absolute -bottom-2.5 w-6 h-6 bg-primary text-primary-foreground rounded-full p-0.5 flex items-center justify-center shadow-md hover:bg-primary/90">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
           </Button>
        </div>
        
        {[
          { type: 'like', icon: Heart, activeColor: 'text-rose-500 fill-rose-500' },
          { type: 'save', icon: Bookmark, activeColor: 'text-yellow-400 fill-yellow-400' },
          { type: 'report', icon: Flag, activeColor: 'text-slate-400 fill-slate-400' },
        ].map((item) => {
          const Icon = item.icon;
          const specificLoading = isInteracting === item.type;
          return (
            <Button
              key={item.type}
              variant="ghost"
              size="icon"
              onClick={() => handleInteraction(item.type as 'like' | 'save' | 'report')}
              className={cn(
                "text-white hover:text-opacity-80 rounded-full h-12 w-12 p-0 drop-shadow-lg transition-transform hover:scale-110",
                 addInteraction && userHistory.find(h => h.videoId === video.id && h.interactionType === item.type) ? item.activeColor : ""
              )}
              disabled={!!isInteracting}
              aria-label={item.type}
            >
              {specificLoading ? <Loader2 className="animate-spin h-7 w-7" /> : <Icon className="h-7 w-7" />}
            </Button>
          );
        })}
      </div>
    </Card>
  );
}

// Helper to check if user has interacted
const userHistory = useAppStore.getState().userHistory; // Example, this might need better state access or prop drilling if reactive updates are needed for icon active state within this component.

