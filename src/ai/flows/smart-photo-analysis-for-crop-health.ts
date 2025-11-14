'use server';
/**
 * @fileOverview Analyzes crop health from a photo, identifies pests/diseases,
 * and suggests treatment recommendations.
 *
 * - smartPhotoAnalysisForCropHealth - Analyzes crop health from a photo and returns pest/disease information.
 * - SmartPhotoAnalysisForCropHealthInput - The input type for the smartPhotoAnalysisForCropHealth function.
 * - SmartPhotoAnalysisForCropHealthOutput - The return type for the smartPhotoAnalysisForCropHealth function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SmartPhotoAnalysisForCropHealthInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      'A photo of the crop, as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.'
    ),
    language: z.string().describe('The language for the response (e.g., "en" for English, "mr" for Marathi).'),
});
export type SmartPhotoAnalysisForCropHealthInput = z.infer<
  typeof SmartPhotoAnalysisForCropHealthInputSchema
>;

const SmartPhotoAnalysisForCropHealthOutputSchema = z.object({
  pestOrDisease: z.string().describe('The identified pest or disease, if any. Respond with N/A if not applicable.'),
  treatmentRecommendations: z
    .string()
    .describe('Treatment recommendations for the identified pest or disease.'),
  healthAssessment: z.string().describe('Overall health assessment of the crop.'),
});
export type SmartPhotoAnalysisForCropHealthOutput = z.infer<
  typeof SmartPhotoAnalysisForCropHealthOutputSchema
>;

export async function smartPhotoAnalysisForCropHealth(
  input: SmartPhotoAnalysisForCropHealthInput
): Promise<SmartPhotoAnalysisForCropHealthOutput> {
  return smartPhotoAnalysisForCropHealthFlow(input);
}

const prompt = ai.definePrompt({
  name: 'smartPhotoAnalysisForCropHealthPrompt',
  input: {schema: SmartPhotoAnalysisForCropHealthInputSchema},
  output: {schema: SmartPhotoAnalysisForCropHealthOutputSchema},
  prompt: `You are an AI assistant specialized in diagnosing crop health from images.

  Respond in the following language: {{{language}}}.

  Analyze the provided crop image and identify any potential pests or diseases.
  Provide treatment recommendations to address the identified issues.
  Also provide a general health assessment of the crop.

  Here is the crop image:
  {{media url=photoDataUri}}

  Respond concisely with the identified pest/disease, treatment recommendations, and health assessment.
`,
});

const smartPhotoAnalysisForCropHealthFlow = ai.defineFlow(
  {
    name: 'smartPhotoAnalysisForCropHealthFlow',
    inputSchema: SmartPhotoAnalysisForCropHealthInputSchema,
    outputSchema: SmartPhotoAnalysisForCropHealthOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
