"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import { Alert, AlertDescription } from "@components/ui/alert";
import { ROUTES } from "@constants/routes";
import { AUTH_ERRORS, AUTH_SUCCESS } from "@constants/auth";
import Link from "next/link";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "@config/firebase";
import { createUser } from "@lib/db";
import { sendWelcomeEmail } from "@lib/sendWelcomeEmail";
import { FcGoogle } from "react-icons/fc";
import { SignUpSchema } from "@/utils/validate/SignUpSchema";
import { signIn } from "next-auth/react";
import registerService from "@/app/services/RegisterService";

type SignUpFormValues = z.infer<typeof SignUpSchema>;

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
		resolver: zodResolver(SignUpSchema),
	});

	const onSubmit = async (data: SignUpFormValues) => {
  setIsLoading(true);
  setError(null);
  setSuccess(null);

  try {
    await registerService.addUser({
      email: data.email,
      password: data.password,
			confirmPassword: data.confirmPassword,
      name: data.name,
    });

    setSuccess(AUTH_SUCCESS.ACCOUNT_CREATED);

    const res = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });

    if (res?.error) {
      setError(res.error);
    } else {
      router.push(ROUTES.DASHBOARD);
    }
  } catch (err) {
    console.error("Registration error:", err);

    if (typeof err === "string" && err.includes("already in use")) {
      setError(AUTH_ERRORS.EMAIL_EXISTS);
    } else {
      setError(AUTH_ERRORS.DEFAULT);
    }
  } finally {
    setIsLoading(false);
  }
};

	const handleGoogleSignUp = async () => {
		setIsLoading(true);
		setError(null);
		setSuccess(null);

		try {
			await signIn("google", {
				callbackUrl: ROUTES.DASHBOARD,
			});
		} catch (error) {
			console.error("Google Sign-Up error:", error);
			setError(AUTH_ERRORS.DEFAULT);
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

			<div className="relative">
				<div className="absolute inset-0 flex items-center">
					<span className="w-full border-t" />
				</div>
				<div className="relative flex justify-center text-sm">
					<span className="bg-background px-2 text-muted-foreground">
						or
					</span>
				</div>
			</div>

			<Button
				variant="outline"
				className="w-full flex items-center gap-2 justify-center"
				onClick={handleGoogleSignUp}
				disabled={isLoading}
			>
				<FcGoogle className="text-xl" />
				{isLoading ? "Signing in..." : "Sign Up with Google"}
			</Button>

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
