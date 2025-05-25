"use client";

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
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@config/firebase";
import useSWRMutation from "swr/mutation";
import { sendPasswordResetEmail as firebaseSendPasswordResetEmail } from "firebase/auth";

const forgotPasswordSchema = z.object({
	email: z.string().email("Please enter a valid email address"),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

async function resetPasswordRequest(_key: string, { arg }: { arg: string }) {
	try {
		if (!auth) {
			throw new Error('Authentication not initialized');
		}
		await sendPasswordResetEmail(auth, arg);
		return { success: AUTH_SUCCESS.PASSWORD_RESET };
	} catch (error) {
		console.error("Error sending password reset email:", error);
		throw new Error(AUTH_ERRORS.DEFAULT);
	}
}

export function ForgotPasswordForm() {
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<ForgotPasswordFormValues>({
		resolver: zodResolver(forgotPasswordSchema),
	});

	const { trigger, data, error, isMutating } = useSWRMutation(
		"resetPassword",
		resetPasswordRequest
	);

	const onSubmit = async (data: ForgotPasswordFormValues) => {
		try {
			await trigger(data.email);
		} catch (error) {
			console.error("Error in form submission:", error);
		}
	};

	return (
		<div className="space-y-6">
			<div className="space-y-2 text-center">
				<h1 className="text-3xl font-bold">Forgot Password</h1>
				<p className="text-gray-500">
					Enter your email address and we&apos;ll send you a link to reset your
					password
				</p>
			</div>

			{error && (
				<Alert variant="destructive">
					<AlertDescription>{error.message}</AlertDescription>
				</Alert>
			)}

			{data?.success && (
				<Alert variant="success">
					<AlertDescription>{data.success}</AlertDescription>
				</Alert>
			)}

			<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
				<div className="space-y-2">
					<Label htmlFor="email">Email</Label>
					<Input
						id="email"
						placeholder="name@example.com"
						{...register("email")}
						disabled={isMutating || !!data?.success}
					/>
					{errors.email && (
						<p className="text-sm text-red-500">{errors.email.message}</p>
					)}
				</div>

				<Button
					type="submit"
					className="w-full"
					disabled={isMutating || !!data?.success}
				>
					{isMutating ? "Sending..." : "Send Reset Link"}
				</Button>
			</form>

			<div className="text-center">
				<p className="text-sm text-gray-500">
					Remember your password?{" "}
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
