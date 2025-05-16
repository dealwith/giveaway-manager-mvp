"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@components/ui/Button";
import { Input } from "@components/ui/Input";
import { Label } from "@components/ui/Label";
import { Alert, AlertDescription } from "@components/ui/Alert";
import { ROUTES } from "@constants/routes";
import { AUTH_ERRORS, AUTH_SUCCESS } from "@constants/auth";
import Link from "next/link";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "@config/firebase";
import { createUser } from "@lib/db";
import { EmailTemplates } from "@lib/email";

const signUpSchema = z
	.object({
		name: z.string().min(2, "Name must be at least 2 characters").optional(),
		email: z.string().email("Please enter a valid email address"),
		password: z.string().min(8, "Password must be at least 8 characters"),
		confirmPassword: z.string().min(1, "Please confirm your password"),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords do not match",
		path: ["confirmPassword"],
	});

type SignUpFormValues = z.infer<typeof signUpSchema>;

export function SignUpForm() {
	const router = useRouter();
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<SignUpFormValues>({
		resolver: zodResolver(signUpSchema),
	});

	const onSubmit = async (data: SignUpFormValues) => {
		setIsLoading(true);
		setError(null);
		setSuccess(null);

		try {
			// Create user in Firebase Auth
			const userCredential = await createUserWithEmailAndPassword(
				auth,
				data.email,
				data.password
			);

			const user = userCredential.user;

			// Update profile if name is provided
			if (data.name) {
				await updateProfile(user, {
					displayName: data.name,
				});
			}

			// Create user in Firestore
			await createUser({
				email: data.email,
				name: data.name,
			});

			// Send welcome email
			await EmailTemplates.WELCOME(data.email, data.name);

			setSuccess(AUTH_SUCCESS.ACCOUNT_CREATED);

			// Redirect to sign in page after a short delay
			setTimeout(() => {
				router.push(ROUTES.SIGNIN);
			}, 2000);
		} catch (error: any) {
			console.error("Error during sign up:", error);

			if (error.code === "auth/email-already-in-use") {
				setError(AUTH_ERRORS.EMAIL_EXISTS);
			} else {
				setError(AUTH_ERRORS.DEFAULT);
			}
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="space-y-6">
			<div className="space-y-2 text-center">
				<h1 className="text-3xl font-bold">Sign Up</h1>
				<p className="text-gray-500">
					Create an account to start managing your giveaways
				</p>
			</div>

			{error && (
				<Alert variant="destructive">
					<AlertDescription>{error}</AlertDescription>
				</Alert>
			)}

			{success && (
				<Alert variant="success">
					<AlertDescription>{success}</AlertDescription>
				</Alert>
			)}

			<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
				<div className="space-y-2">
					<Label htmlFor="name">Name (Optional)</Label>
					<Input
						id="name"
						placeholder="John Doe"
						{...register("name")}
						disabled={isLoading}
					/>
					{errors.name && (
						<p className="text-sm text-red-500">{errors.name.message}</p>
					)}
				</div>

				<div className="space-y-2">
					<Label htmlFor="email">Email</Label>
					<Input
						id="email"
						placeholder="name@example.com"
						{...register("email")}
						disabled={isLoading}
					/>
					{errors.email && (
						<p className="text-sm text-red-500">{errors.email.message}</p>
					)}
				</div>

				<div className="space-y-2">
					<Label htmlFor="password">Password</Label>
					<Input
						id="password"
						type="password"
						{...register("password")}
						disabled={isLoading}
					/>
					{errors.password && (
						<p className="text-sm text-red-500">{errors.password.message}</p>
					)}
				</div>

				<div className="space-y-2">
					<Label htmlFor="confirmPassword">Confirm Password</Label>
					<Input
						id="confirmPassword"
						type="password"
						{...register("confirmPassword")}
						disabled={isLoading}
					/>
					{errors.confirmPassword && (
						<p className="text-sm text-red-500">
							{errors.confirmPassword.message}
						</p>
					)}
				</div>

				<Button type="submit" className="w-full" disabled={isLoading}>
					{isLoading ? "Creating account..." : "Sign Up"}
				</Button>
			</form>

			<div className="text-center">
				<p className="text-sm text-gray-500">
					Already have an account?{" "}
					<Link
						href={ROUTES.SIGNIN}
						className="text-blue-500 hover:text-blue-700"
					>
						Sign in
					</Link>
				</p>
			</div>
		</div>
	);
}
