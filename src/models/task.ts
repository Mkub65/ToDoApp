import { z } from 'zod';
import { taskSchema } from '../schema/taskSchema';

export type Task = z.infer<typeof taskSchema>;