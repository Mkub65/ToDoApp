import z from 'zod'
export const registerDto = z.object({
    email: z.string().email("Nieprawidłowy adres email"),
    password: z.string().min(6, "Hasło musi mieć co najmniej 6 znaków"),
    confirmPassword: z.string().min(6, "Hasło musi mieć co najmniej 6 znaków"),
    firstName: z.string().min(2, "Imię musi mieć co najmniej 2 znaki"),
    lastName: z.string().min(2, "Nazwisko musi mieć co najmniej 2 znaki"),
})
    .refine((data) => data.password === data.confirmPassword, {
        message: "Hasła muszą się zgadzać",
        path: ["confirmPassword"],
    });
