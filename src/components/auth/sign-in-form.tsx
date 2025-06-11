"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { FcGoogle } from "react-icons/fc";
import useSWRMutation from "swr/mutation";
import { z } from "zod";

import { Alert, AlertDescription } from "components/ui/alert";
import { Button } from "components/ui/button";
import { Input } from "components/ui/input";
import { Label } from "components/ui/label";
import { ROUTES } from "constants/routes";

const signInSchema = z.object({
	email: z.string().email("Please enter a valid email address"),
	password: z.string().min(1, "Password is required")
});

type SignInFormValues = z.infer<typeof signInSchema>;

async function signInRequest(_key: string, { arg }: { arg: SignInFormValues }) {
	const result = await signIn("credentials", {
		email: arg.email,
		password: arg.password,
		redirect: false
	});

	if (result?.error) {
		throw new Error("Authentication failed");
	}

	return { success: true };
}

export function SignInForm() {
	const t = useTranslations("auth.signIn.form");
	const router = useRouter();
	const [showSuccess, setShowSuccess] = useState(false);

	const {
		register,
		handleSubmit,
		formState: { errors }
	} = useForm<SignInFormValues>({
		resolver: zodResolver(signInSchema)
	});

	const { trigger, error, isMutating, reset } = useSWRMutation(
		"signIn",
		signInRequest,
		{
			onSuccess: () => {
				setShowSuccess(true);
				setTimeout(() => {
					router.push(ROUTES.DASHBOARD);
					router.refresh();
				}, 1000);
			}
		}
	);

	const onSubmit = async (data: SignInFormValues) => {
		reset();
		setShowSuccess(false);
		await trigger(data);
	};

	const handleGoogleSignIn = async () => {
		await signIn("google", { callbackUrl: ROUTES.DASHBOARD });
	};

	return (
		<div className="space-y-6">
			{error && (
				<Alert variant="destructive">
					<AlertDescription>{t("errors.default")}</AlertDescription>
				</Alert>
			)}
			{showSuccess && (
				<Alert variant="success">
					<AlertDescription>{t("success.redirecting")}</AlertDescription>
				</Alert>
			)}

			<Button
				type="button"
				variant="outline"
				className="w-full flex items-center justify-center gap-2"
				onClick={handleGoogleSignIn}
				disabled={isMutating || showSuccess}
			>
				<FcGoogle size={20} />
				{isMutating ? t("buttons.loading") : t("buttons.google")}
			</Button>

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

			<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
				<div className="space-y-2">
					<Label htmlFor="email">{t("fields.email.label")}</Label>
					<Input
						id="email"
						type="email"
						placeholder={t("fields.email.placeholder")}
						{...register("email")}
						disabled={isMutating || showSuccess}
					/>
					{errors.email && (
						<p className="text-sm text-red-500">{errors.email.message}</p>
					)}
				</div>

				<div className="space-y-2">
					<div className="flex items-center justify-between">
						<Label htmlFor="password">{t("fields.password.label")}</Label>
						<Link
							href={ROUTES.FORGOT_PASSWORD}
							className="text-sm text-primary hover:underline"
						>
							{t("forgotPassword")}
						</Link>
					</div>
					<Input
						id="password"
						type="password"
						{...register("password")}
						disabled={isMutating || showSuccess}
					/>
					{errors.password && (
						<p className="text-sm text-red-500">{errors.password.message}</p>
					)}
				</div>
				<Button
					type="submit"
					className="w-full"
					disabled={isMutating || showSuccess}
					variant="default"
				>
					{isMutating ? t("buttons.loading") : t("buttons.signIn")}
				</Button>
			</form>

			<div className="text-center">
				<p className="text-sm text-muted-foreground">
					{t("signUpPrompt")}{" "}
					<Link href={ROUTES.SIGNUP} className="text-primary hover:underline">
						{t("signUpLink")}
					</Link>
				</p>
			</div>
		</div>
	);
}
