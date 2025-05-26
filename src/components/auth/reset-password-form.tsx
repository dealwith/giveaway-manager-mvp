"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import { Alert, AlertDescription } from "@components/ui/alert";
import { ROUTES } from "@constants/routes";
import { AUTH_SUCCESS } from "@constants/auth";
import { confirmPasswordReset } from "firebase/auth";
import { auth } from "@config/firebase";

const resetPasswordSchema = z
	.object({
		password: z.string().min(8, "Password must be at least 8 characters"),
		confirmPassword: z.string().min(1, "Please confirm your password"),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords do not match",
		path: ["confirmPassword"],
	});

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

const DEFAULT_ERROR_STATE = null;
const DEFAULT_SUCCESS_STATE = null;


export function ResetPasswordForm() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const token = searchParams.get("token");

	const [error, setError] = useState<string | null>(DEFAULT_ERROR_STATE);
	const [success, setSuccess] = useState<string | null>(DEFAULT_SUCCESS_STATE);
	const [isLoading, setIsLoading] = useState(false);

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<ResetPasswordFormValues>({
		resolver: zodResolver(resetPasswordSchema),
	});

	const onSubmit = async (data: ResetPasswordFormValues) => {
		if (!token) {
			setError("Invalid or expired reset link");
			return;
		}

		setIsLoading(true);
		setError(DEFAULT_ERROR_STATE);
		setSuccess(DEFAULT_SUCCESS_STATE);

		try {
			if (!auth) {
				throw new Error('Authentication not initialized');
			}
			await confirmPasswordReset(auth, token, data.password);
			setSuccess(AUTH_SUCCESS.PASSWORD_UPDATED);

			setTimeout(() => {
				router.push(ROUTES.SIGNIN);
			}, 2000);
		} catch (error) {
			console.error("Error resetting password:", error);
			setError("Invalid or expired reset link. Please request a new one.");
		} finally {
			setIsLoading(false);
		}
	};

	if (!token) {
		return (
			<div className="space-y-6">
				<div className="space-y-2 text-center">
					<h1 className="text-3xl font-bold">Reset Password</h1>
					<p className="text-gray-500">Invalid reset link</p>
				</div>

				<Alert variant="destructive">
					<AlertDescription>
						Invalid or expired reset link. Please request a new one.
					</AlertDescription>
				</Alert>

				<Button
					className="w-full"
					onClick={() => router.push(ROUTES.FORGOT_PASSWORD)}
				>
					Request New Reset Link
				</Button>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="space-y-2 text-center">
				<h1 className="text-3xl font-bold">Reset Password</h1>
				<p className="text-gray-500">Enter your new password below</p>
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
					<Label htmlFor="password">New Password</Label>
					<Input
						id="password"
						type="password"
						{...register("password")}
						disabled={isLoading || !!success}
					/>
					{errors.password && (
						<p className="text-sm text-red-500">{errors.password.message}</p>
					)}
				</div>

				<div className="space-y-2">
					<Label htmlFor="confirmPassword">Confirm New Password</Label>
					<Input
						id="confirmPassword"
						type="password"
						{...register("confirmPassword")}
						disabled={isLoading || !!success}
					/>
					{errors.confirmPassword && (
						<p className="text-sm text-red-500">
							{errors.confirmPassword.message}
						</p>
					)}
				</div>

				<Button
					type="submit"
					className="w-full"
					disabled={isLoading || !!success}
				>
					{isLoading ? "Updating..." : "Reset Password"}
				</Button>
			</form>
		</div>
	);
}
