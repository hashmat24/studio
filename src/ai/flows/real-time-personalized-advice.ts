'use server';

/**
 * @fileOverview A Genkit flow for providing real-time, personalized advice to farmers.
 *
 * - getRealTimePersonalizedAdvice - A function that retrieves personalized advice for a farmer.
 * - RealTimePersonalizedAdviceInput - The input type for the getRealTimePersonalizedAdvice function.
 * - RealTimePersonalizedAdviceOutput - The return type for the getRealTimePersonalizedAdvice function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RealTimePersonalizedAdviceInputSchema = z.object({
  location: z.string().describe('The geographical location of the farm.'),
  cropType: z.string().describe('The type of crop being cultivated.'),
  area: z.number().describe('The area of the farm in acres.'),
  farmingMethods: z.string().describe('The farming methods being used.'),
  weatherConditions: z.string().describe('The current weather conditions at the farm.'),
  soilHealthCardData: z.string().describe('The soil health card data.'),
  agriStackData: z.string().describe('The AgriStack data.'),
  language: z.string().describe('The language for the response (e.g., "en" for English, "mr" for Marathi).'),
});

export type RealTimePersonalizedAdviceInput = z.infer<typeof RealTimePersonalizedAdviceInputSchema>;

const RealTimePersonalizedAdviceOutputSchema = z.object({
  irrigationAdvice: z.string().describe('Personalized advice on irrigation.'),
  fertilizerTimingAdvice: z.string().describe('Personalized advice on fertilizer timing.'),
  harvestAlert: z.string().describe('Alert indicating optimal harvest time.'),
});

export type RealTimePersonalizedAdviceOutput = z.infer<typeof RealTimePersonalizedAdviceOutputSchema>;

export async function getRealTimePersonalizedAdvice(
  input: RealTimePersonalizedAdviceInput
): Promise<RealTimePersonalizedAdviceOutput> {
  return realTimePersonalizedAdviceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'realTimePersonalizedAdvicePrompt',
  input: {schema: RealTimePersonalizedAdviceInputSchema},
  output: {schema: RealTimePersonalizedAdviceOutputSchema},
  prompt: `You are an expert agricultural advisor providing real-time, personalized advice to farmers.

  Respond in the following language: {{{language}}}.

  Based on the farm's profile and current weather conditions, provide advice on irrigation, fertilizer timing, and harvest alerts.

  Farm Location: {{location}}
  Crop Type: {{cropType}}
  Area: {{area}} acres
  Farming Methods: {{farmingMethods}}
  Weather Conditions: {{weatherConditions}}
  Soil Health Card Data: {{soilHealthCardData}}
  AgriStack Data: {{agriStackData}}

  Provide specific and actionable recommendations for:
  - Irrigation: When and how much to irrigate.
  - Fertilizer Timing: When to apply fertilizer for optimal results.
  - Harvest Alert: When to harvest the crop for maximum yield.
`,
});

const realTimePersonalizedAdviceFlow = ai.defineFlow(
  {
    name: 'realTimePersonalizedAdviceFlow',
    inputSchema: RealTimePersonalizedAdviceInputSchema,
    outputSchema: RealTimePersonalizedAdviceOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
