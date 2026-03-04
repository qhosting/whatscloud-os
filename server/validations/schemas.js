import { z } from 'zod';

export const registerSchema = z.object({
    body: z.object({
        name: z.string().min(2).max(50),
        email: z.string().email(),
        password: z.string().min(6),
    })
});

export const loginSchema = z.object({
    body: z.object({
        email: z.string().email(),
        password: z.string(),
    })
});

export const scrapeSchema = z.object({
    body: z.object({
        niche: z.string().min(1),
        city: z.string().min(1),
        country: z.string().optional(),
        limit: z.number().int().min(1).max(100).optional().default(5),
    })
});

export const callSchema = z.object({
    body: z.object({
        to: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format'),
        promptId: z.string().optional(),
        textToSpeech: z.string().optional()
    })
});

export const deductionsSchema = z.object({
    body: z.object({
        amount: z.number().int().positive(),
    })
});
