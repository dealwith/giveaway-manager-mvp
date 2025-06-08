import { z } from "zod";

export const SignUpSchema = z
	.object({
		name: z.string().min(2).optional(),
		email: z.string().email(),
		password: z.string().min(8),
		confirmPassword: z.string().min(1)
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords do not match",
		path: ["confirmPassword"]
	});
