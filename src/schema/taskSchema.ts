import { z } from 'zod'


export const taskSchema = z.object({
    id: z.string().min(1, "Id for task is required"),
    name: z.string().min(1, "Name require at leats one character"),
    dueDate: z.iso.date()
});