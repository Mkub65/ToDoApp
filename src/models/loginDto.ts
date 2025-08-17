import z from "zod";
import {loginDto} from "../schema/loginDtoSchema";

export type LoginDto = z.infer<typeof loginDto>;
