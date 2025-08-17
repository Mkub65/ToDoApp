import z from 'zod'
import {registerDto} from "../schema/registerDtoSchema";

export type RegisterDto = z.infer<typeof registerDto>;
