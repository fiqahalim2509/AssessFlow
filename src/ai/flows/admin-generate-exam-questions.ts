'use server';
/**
 * @fileOverview A Genkit flow for generating multiple-choice questions for an exam based on a given topic or keywords.
 *
 * - adminGenerateExamQuestions - A function that handles the generation of exam questions.
 * - AdminGenerateExamQuestionsInput - The input type for the adminGenerateExamQuestions function.
 * - AdminGenerateExamQuestionsOutput - The return type for the adminGenerateExamQuestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AdminGenerateExamQuestionsInputSchema = z.object({
  topic: z.string().describe('The topic or keywords for which to generate exam questions.'),
  numberOfQuestions: z.number().int().min(1).max(20).default(5).describe('The number of multiple-choice questions to generate.'),
});
export type AdminGenerateExamQuestionsInput = z.infer<typeof AdminGenerateExamQuestionsInputSchema>;

const QuestionSchema = z.object({
  question: z.string().describe('The text of the multiple-choice question.'),
  options: z.object({
    A: z.string().describe('Option A for the multiple-choice question.'),
    B: z.string().describe('Option B for the multiple-choice question.'),
    C: z.string().describe('Option C for the multiple-choice question.'),
    D: z.string().describe('Option D for the multiple-choice question.'),
  }).describe('The four multiple-choice options for the question.'),
  correctAnswer: z.enum(['A', 'B', 'C', 'D']).describe('The letter (A, B, C, or D) corresponding to the correct answer.'),
}).describe('A single multiple-choice question with its options and correct answer.');

const AdminGenerateExamQuestionsOutputSchema = z.array(QuestionSchema).describe('An array of generated multiple-choice questions.');
export type AdminGenerateExamQuestionsOutput = z.infer<typeof AdminGenerateExamQuestionsOutputSchema>;

export async function adminGenerateExamQuestions(input: AdminGenerateExamQuestionsInput): Promise<AdminGenerateExamQuestionsOutput> {
  return adminGenerateExamQuestionsFlow(input);
}

const generateQuestionsPrompt = ai.definePrompt({
  name: 'generateExamQuestionsPrompt',
  input: {schema: AdminGenerateExamQuestionsInputSchema},
  output: {schema: AdminGenerateExamQuestionsOutputSchema},
  prompt: `You are an expert at creating challenging and clear multiple-choice questions.\nGenerate exactly {{numberOfQuestions}} multiple-choice questions on the topic of "{{topic}}".\nEach question must have four options (A, B, C, D) and specify the correct answer.\nEnsure the questions are suitable for an exam and test understanding of the topic.\nProvide the output in a JSON array format matching the following schema:\n{{output.schema}}`,
});

const adminGenerateExamQuestionsFlow = ai.defineFlow(
  {
    name: 'adminGenerateExamQuestionsFlow',
    inputSchema: AdminGenerateExamQuestionsInputSchema,
    outputSchema: AdminGenerateExamQuestionsOutputSchema,
  },
  async (input) => {
    const {output} = await generateQuestionsPrompt(input);
    return output!;
  }
);
