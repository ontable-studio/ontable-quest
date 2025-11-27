import * as z from "zod";

export const questionSchema = z.object({
    name: z.string().optional(),
    category: z.string().min(1, "Please select a category"),
    question: z.string().min(5, "Question must be at least 5 characters"),
});

export type QuestionValues = z.infer<typeof questionSchema>;