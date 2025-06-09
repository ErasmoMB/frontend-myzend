// src/ai/flows/video-recommendation.ts
'use server';
/**
 * @fileOverview Recommends short videos tailored to the user's selected emotion.
 *
 * - recommendVideos - A function that handles the video recommendation process.
 * - RecommendVideosInput - The input type for the recommendVideos function.
 * - RecommendVideosOutput - The return type for the recommendVideos function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RecommendVideosInputSchema = z.object({
  emotion: z
    .string()
    .describe('The current emotion of the user (e.g., Happy, Sad, Anxious).'),
  userHistory: z
    .string()
    .optional()
    .describe('The user interaction history, which can be used to refine recommendations.'),
});
export type RecommendVideosInput = z.infer<typeof RecommendVideosInputSchema>;

const RecommendVideosOutputSchema = z.object({
  videoRecommendations: z
    .array(z.string())
    .describe('An array of video URLs or descriptions recommended for the user.'),
});
export type RecommendVideosOutput = z.infer<typeof RecommendVideosOutputSchema>;

export async function recommendVideos(input: RecommendVideosInput): Promise<RecommendVideosOutput> {
  return recommendVideosFlow(input);
}

const prompt = ai.definePrompt({
  name: 'recommendVideosPrompt',
  input: {schema: RecommendVideosInputSchema},
  output: {schema: RecommendVideosOutputSchema},
  prompt: `You are an AI video recommendation system designed to help users improve their mood and mental well-being.

  Based on the user's current emotion and their past interactions, recommend a list of short videos (like TikTok videos) that are likely to improve their mood.

  Current Emotion: {{{emotion}}}
  User History: {{{userHistory}}}

  Please provide a diverse set of video recommendations.
  Videos recommended should be safe and appropriate for all users.
  Videos should be in the form of a URL or description of the video.
  `,
});

const recommendVideosFlow = ai.defineFlow(
  {
    name: 'recommendVideosFlow',
    inputSchema: RecommendVideosInputSchema,
    outputSchema: RecommendVideosOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
