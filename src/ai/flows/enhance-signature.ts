'use server';

/**
 * @fileOverview AI-powered signature enhancement flow.
 *
 * This file defines a Genkit flow that takes a signature image as input and
 * uses AI to generate a professional-looking digital signature with blank ink
 * and a white paper background.
 *
 * @exports enhanceSignature - The main function to enhance the signature.
 * @exports EnhanceSignatureInput - The input type for the enhanceSignature function.
 * @exports EnhanceSignatureOutput - The output type for the enhanceSignature function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EnhanceSignatureInputSchema = z.object({
  signatureDataUri: z
    .string()
    .describe(
      "A signature image as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type EnhanceSignatureInput = z.infer<typeof EnhanceSignatureInputSchema>;

const EnhanceSignatureOutputSchema = z.object({
  enhancedSignatureDataUri: z
    .string()
    .describe('The AI-enhanced signature image as a data URI.'),
});
export type EnhanceSignatureOutput = z.infer<typeof EnhanceSignatureOutputSchema>;

export async function enhanceSignature(
  input: EnhanceSignatureInput
): Promise<EnhanceSignatureOutput> {
  return enhanceSignatureFlow(input);
}

const enhanceSignaturePrompt = ai.definePrompt({
  name: 'enhanceSignaturePrompt',
  input: {schema: EnhanceSignatureInputSchema},
  prompt: [
      {
        media: { url: '{{signatureDataUri}}', contentType: 'image/jpeg' },
      },
      {
        text: `Generate a professional-looking digital signature from the given signature image. The signature should be in blank ink on a white paper background, making it look clean and official.`
      }
  ],
});

const enhanceSignatureFlow = ai.defineFlow(
  {
    name: 'enhanceSignatureFlow',
    inputSchema: EnhanceSignatureInputSchema,
    outputSchema: EnhanceSignatureOutputSchema,
  },
  async input => {
    const {media} = await ai.generate({
      prompt: await enhanceSignaturePrompt(input),
      model: 'googleai/gemini-2.5-flash-image-preview',
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    return {
      enhancedSignatureDataUri: media!.url,
    };
  }
);
