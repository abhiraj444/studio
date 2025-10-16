'use server';

/**
 * @fileOverview This file defines a Genkit flow for extracting document details using an LLM with vision capabilities.
 *
 * The flow takes an image of a document as input, sends it to the LLM with a specific prompt,
 * and returns the extracted details in JSON format.
 *
 * @exports extractDocumentDetails - The main function to trigger the document detail extraction flow.
 * @exports ExtractDocumentDetailsInput - The input type for the extractDocumentDetails function.
 * @exports ExtractDocumentDetailsOutput - The output type for the extractDocumentDetails function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractDocumentDetailsInputSchema = z.object({
  documentDataUri: z
    .string()
    .describe(
      'A photo of a document, as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.' 
    ),
  documentType: z.string().describe('The type of document being uploaded (e.g., Aadhar Card, Pan Card).'),
  customInstructions: z
    .string()
    .optional()
    .describe('Custom instructions for the LLM to use when extracting details.'),
});
export type ExtractDocumentDetailsInput = z.infer<typeof ExtractDocumentDetailsInputSchema>;

const ExtractDocumentDetailsOutputSchema = z.object({
  extractedDetails: z.record(z.any()).describe('The extracted details from the document in JSON format.'),
});
export type ExtractDocumentDetailsOutput = z.infer<typeof ExtractDocumentDetailsOutputSchema>;

export async function extractDocumentDetails(
  input: ExtractDocumentDetailsInput
): Promise<ExtractDocumentDetailsOutput> {
  return extractDocumentDetailsFlow(input);
}

const extractDocumentDetailsPrompt = ai.definePrompt({
  name: 'extractDocumentDetailsPrompt',
  input: {schema: ExtractDocumentDetailsInputSchema},
  output: {schema: ExtractDocumentDetailsOutputSchema},
  prompt: `You are an expert data extraction specialist.

You will receive an image of a document and your task is to extract all important details from the document.

The document type is: {{{documentType}}}

Here are some custom instructions: {{{customInstructions}}}

Extract the details and respond in proper JSON format with key-value pairs.

Here is the document: {{media url=documentDataUri}}
`,
});

const extractDocumentDetailsFlow = ai.defineFlow(
  {
    name: 'extractDocumentDetailsFlow',
    inputSchema: ExtractDocumentDetailsInputSchema,
    outputSchema: ExtractDocumentDetailsOutputSchema,
  },
  async input => {
    const {output} = await extractDocumentDetailsPrompt(input);
    return output!;
  }
);
