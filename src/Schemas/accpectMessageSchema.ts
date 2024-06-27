import { z } from 'zod';

export const acceptMessageSchema = z.object({
    message: z.boolean()
})