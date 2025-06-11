"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { FcGoogle } from "react-icons/fc";
import { z } from "zod";

import { useSignUp } from "app/hooks/useSignUp";
import { SignUpSchema } from "app/utils/validate/SignUpSchema";
import { Alert, AlertDescription } from "components/ui/alert";
import { Button } from "components/ui/button";
import { Input } from "components/ui/input";
import { Label } from "components/ui/label";
import { ROUTES } from "constants/routes";

type SignUpFormValues = z.infer<typeof SignUpSchema>;

export function SignUpForm() {
	const t = useTranslations("auth.signUp");
	const router = useRouter();
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState<string | null>(null);
	const [isGoogleLoading, setIsGoogleLoading] = useState(false);
	const { signUp, isLoading } = useSignUp();
	const isFormLoading = isLoading || isGoogleLoading;

	const {
		register,
		handleSubmit,
		formState: { errors }
	} = useForm<SignUpFormValues>({
		resolver: zodResolver(SignUpSchema)
	});

	const onSubmit = async (data: SignUpFormValues) => {
		setError(null);
		setSuccess(null);

		try {
			await signUp({
				email: data.email,
				password: data.password,
				confirmPassword: data.confirmPassword,
				name: data.name
			});

			setSuccess(t("success.accountCreated"));

			const res = await signIn("credentials", {
				email: data.email,
				password: data.password,
				redirect: false
			});

			if (res?.error) {
				setError(res.error);
			} else {
				router.push(ROUTES.DASHBOARD);
			}
		} catch (err) {
			console.error("Registration error:", err);

			if (typeof err === "string" && err.includes("already in use")) {
				setError(t("errors.emailExists"));
			} else {
				setError(t("errors.default"));
			}
		}
	};

	const handleGoogleSignUp = async () => {
		setIsGoogleLoading(true);
		setError(null);
		setSuccess(null);

		try {
			await signIn("google", {
				callbackUrl: ROUTES.DASHBOARD
			});
		} catch (error) {
			console.error("Google Sign-Up error:", error);
			setError(t("errors.default"));
		} finally {
			setIsGoogleLoading(false);
		}
	};

	return (
		<div className="space-y-6">
			<div className="space-y-2 text-center">
				<h1 className="text-3xl font-bold">{t("title")}</h1>
				<p className="text-gray-500">{t("description")}</p>
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
					<Label htmlFor="name">{t("fields.name.label")}</Label>
					<Input
						id="name"
						placeholder={t("fields.name.placeholder")}
						{...register("name")}
						disabled={isFormLoading}
					/>
					{errors.name && (
						<p className="text-sm text-red-500">{errors.name.message}</p>
					)}
				</div>

				<div className="space-y-2">
					<Label htmlFor="email">{t("fields.email.label")}</Label>
					<Input
						id="email"
						placeholder={t("fields.email.placeholder")}
						{...register("email")}
						disabled={isFormLoading}
					/>
					{errors.email && (
						<p className="text-sm text-red-500">{errors.email.message}</p>
					)}
				</div>

				<div className="space-y-2">
					<Label htmlFor="password">{t("fields.password.label")}</Label>
					<Input
						id="password"
						type="password"
						{...register("password")}
						disabled={isFormLoading}
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
						disabled={isFormLoading}
					/>
					{errors.confirmPassword && (
						<p className="text-sm text-red-500">
							{errors.confirmPassword.message}
						</p>
					)}
				</div>

				<Button type="submit" className="w-full" disabled={isFormLoading}>
					{isFormLoading ? t("buttons.loading") : t("buttons.signUp")}
				</Button>
			</form>

			<div className="relative">
				<div className="absolute inset-0 flex items-center">
					<span className="w-full border-t" />
				</div>
				<div className="relative flex justify-center text-sm">
					<span className="bg-background px-2 text-muted-foreground">
						{t("divider")}
					</span>
				</div>
			</div>

			<Button
				variant="outline"
				className="w-full flex items-center gap-2 justify-center"
				onClick={handleGoogleSignUp}
				disabled={isFormLoading}
			>
				<FcGoogle className="text-xl" />
				{isGoogleLoading ? t("buttons.loading") : t("buttons.google")}
			</Button>

			<div className="text-center">
				<p className="text-sm text-gray-500">
					{t("signInPrompt")}{" "}
					<Link
						href={ROUTES.SIGNIN}
						className="text-blue-500 hover:text-blue-700"
					>
						{t("signInLink")}
					</Link>
				</p>
			</div>
		</div>
	);
}
