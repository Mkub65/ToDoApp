import { z } from 'zod';
import { userSchema } from '../schema/userSchema';

export type User = z.infer<typeof userSchema>;