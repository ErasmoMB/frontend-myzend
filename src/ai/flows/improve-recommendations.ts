'use server';
/**
 * @fileOverview A flow that refines video recommendations based on user interactions.
 *
 * - improveRecommendations - A function that adjusts video suggestions based on user feedback (likes, saves, reports).
 * - ImproveRecommendationsInput - The input type for the improveRecommendations function.
 * - ImproveRecommendationsOutput - The return type for the improveRecommendations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ImproveRecommendationsInputSchema = z.object({
  emotion: z.string().describe('The current emotion of the user.'),
  videoId: z.string().describe('The ID of the video the user interacted with.'),
  interactionType: z
    .enum(['like', 'save', 'report'])
    .describe('The type of interaction the user had with the video.'),
  previousRecommendations: z
    .array(z.string())
    .describe('List of video IDs previously recommended to the user.'),
});
export type ImproveRecommendationsInput = z.infer<
  typeof ImproveRecommendationsInputSchema
>;

const ImproveRecommendationsOutputSchema = z.object({
  updatedRecommendations: z
    .array(z.string())
    .describe('Updated list of video IDs for future recommendations.'),
  reasoning: z
    .string()
    .describe('Explanation of how the recommendations were updated based on user interaction.'),
});
export type ImproveRecommendationsOutput = z.infer<
  typeof ImproveRecommendationsOutputSchema
>;

export async function improveRecommendations(
  input: ImproveRecommendationsInput
): Promise<ImproveRecommendationsOutput> {
  return improveRecommendationsFlow(input);
}

const improveRecommendationsPrompt = ai.definePrompt({
  name: 'improveRecommendationsPrompt',
  input: {schema: ImproveRecommendationsInputSchema},
  output: {schema: ImproveRecommendationsOutputSchema},
  prompt: `You are an AI video recommendation expert. A user has interacted with a video.

  Emotion: {{{emotion}}}
  Video ID: {{{videoId}}}
  Interaction Type: {{{interactionType}}}
  Previous Recommendations: {{#each previousRecommendations}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}

Based on this interaction, update the video recommendations for the user. Explain the reasoning behind the changes.

Ensure that the video recommendations are tailored to improving the user's mental well-being and current emotional state.

Output:
Updated Recommendations:`, // output is auto-populated
});

const improveRecommendationsFlow = ai.defineFlow(
  {
    name: 'improveRecommendationsFlow',
    inputSchema: ImproveRecommendationsInputSchema,
    outputSchema: ImproveRecommendationsOutputSchema,
  },
  async input => {
    const {output} = await improveRecommendationsPrompt(input);
    return output!;
  }
);
