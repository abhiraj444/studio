'use server';

/**
 * @fileOverview A flow to generate a professional-looking photo from a user-uploaded image.
 *
 * - generateProfessionalPhoto - A function that generates a professional-looking photo.
 * - GenerateProfessionalPhotoInput - The input type for the generateProfessionalPhoto function.
 * - GenerateProfessionalPhotoOutput - The return type for the generateProfessionalPhoto function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateProfessionalPhotoInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a person, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type GenerateProfessionalPhotoInput = z.infer<
  typeof GenerateProfessionalPhotoInputSchema
>;

const GenerateProfessionalPhotoOutputSchema = z.object({
  professionalPhotoDataUri: z
    .string()
    .describe(
      "A professional-looking photo with a white background, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type GenerateProfessionalPhotoOutput = z.infer<
  typeof GenerateProfessionalPhotoOutputSchema
>;

export async function generateProfessionalPhoto(
  input: GenerateProfessionalPhotoInput
): Promise<GenerateProfessionalPhotoOutput> {
  return generateProfessionalPhotoFlow(input);
}

const generateProfessionalPhotoFlow = ai.defineFlow(
  {
    name: 'generateProfessionalPhotoFlow',
    inputSchema: GenerateProfessionalPhotoInputSchema,
    outputSchema: GenerateProfessionalPhotoOutputSchema,
  },
  async input => {
    const {media} = await ai.generate({
      prompt: [
        {
          media: {url: input.photoDataUri, contentType: 'image/jpeg'},
        },
        {
          text: `Generate a professional headshot with a plain white background without altering the facial features. The image must be suitable for a government exam application.`,
        },
      ],
      model: 'googleai/gemini-2.5-flash-image-preview',
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });
    return {professionalPhotoDataUri: media!.url!};
  }
);
