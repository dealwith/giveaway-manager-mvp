"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { confirmPasswordReset } from "firebase/auth";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Alert, AlertDescription } from "components/ui/alert";
import { Button } from "components/ui/button";
import { Input } from "components/ui/input";
import { Label } from "components/ui/label";
import { auth } from "config/firebase";
import { ROUTES } from "constants/routes";

const resetPasswordSchema = z
	.object({
		password: z.string().min(8, "Password must be at least 8 characters"),
		confirmPassword: z.string().min(1, "Please confirm your password")
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords do not match",
		path: ["confirmPassword"]
	});

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export function ResetPasswordForm() {
	const t = useTranslations("auth.resetPassword.form");
	const router = useRouter();
	const searchParams = useSearchParams();
	const token = searchParams.get("token");

	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);

	const {
		register,
		handleSubmit,
		formState: { errors }
	} = useForm<ResetPasswordFormValues>({
		resolver: zodResolver(resetPasswordSchema)
	});

	const onSubmit = async (data: ResetPasswordFormValues) => {
		if (!token) {
			setError(t("errors.invalidLink"));

			return;
		}

		setIsLoading(true);
		setError(null);
		setSuccess(null);

		try {
			if (!auth) {
				throw new Error("Authentication not initialized");
			}

			await confirmPasswordReset(auth, token, data.password);
			setSuccess(t("success.passwordUpdated"));

			setTimeout(() => {
				router.push(ROUTES.SIGNIN);
			}, 2000);
		} catch (error) {
			console.error("Error resetting password:", error);
			setError(t("errors.expiredLink"));
		} finally {
			setIsLoading(false);
		}
	};

	if (!token) {
		return (
			<div className="space-y-6">
				<div className="space-y-2 text-center">
					<h1 className="text-3xl font-bold">{t("invalid.title")}</h1>
					<p className="text-gray-500">{t("invalid.subtitle")}</p>
				</div>

				<Alert variant="destructive">
					<AlertDescription>{t("errors.expiredLink")}</AlertDescription>
				</Alert>

				<Button
					className="w-full"
					onClick={() => router.push(ROUTES.FORGOT_PASSWORD)}
				>
					{t("buttons.requestNewLink")}
				</Button>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="space-y-2 text-center">
				<h1 className="text-3xl font-bold">{t("form.title")}</h1>
				<p className="text-gray-500">{t("form.subtitle")}</p>
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
					<Label htmlFor="password">{t("fields.newPassword.label")}</Label>
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
					<Label htmlFor="confirmPassword">
						{t("fields.confirmPassword.label")}
					</Label>
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
					{isLoading ? t("buttons.loading") : t("buttons.resetPassword")}
				</Button>
			</form>
		</div>
	);
}
