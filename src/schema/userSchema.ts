import { z } from 'zod'

export const userSchema = z.object({
    id: z.string().min(1, "UserId is required"),
    name: z.string(),
    lastName: z.string(),
    mail: z.email()
});